import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FileDataSource } from '../datasources/FileDataSource';
import type { ProposalPDFData } from '../factory/pdf/proposal';
import { FileMetadata } from '../models/Blob';
import { ConnectionHasStatusAction } from '../models/StatusAction';
import { WorkflowEngineProposalType } from '../workflowEngine';
import { statusActionLogger } from './statusActionUtils';

const FACTORY_ENDPOINT = process.env.USER_OFFICE_FACTORY_ENDPOINT;

export const proposalDownloadActionHandler = async (
  statusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[],
  options?: {
    statusActionsLogId?: number;
    loggedInUserId?: number;
  }
) => {
  const fileDataSource = container.resolve<FileDataSource>(
    Tokens.FileDataSource
  );

  const successMessage = !!options?.statusActionsLogId
    ? 'Proposal successfully downloaded on status action replay'
    : 'Proposal successfully downloaded';
  const failMessage = !!options?.statusActionsLogId
    ? 'Proposal failed to download on status action replay'
    : 'Proposal failed to download';

  const submittedProposals = proposals.filter(
    (prop) => (prop.submitted = true)
  );

  for (const proposal of submittedProposals) {
    const statusLogger = statusActionLogger({
      connectionId: statusAction.connectionId,
      actionId: statusAction.actionId,
      statusActionsLogId: null,
      proposalPks: [proposal.primaryKey],
    });

    const logContext = {
      proposalPk: proposal.primaryKey,
      proposalId: proposal.proposalId,
      callId: proposal.callId,
      statusAction: statusAction,
      executedBy: options?.loggedInUserId ? options.loggedInUserId : 'Workflow',
    };

    logger.logInfo(
      `Downloading proposal PDF for proposal ${proposal.proposalId} via status action download`,
      {
        ...logContext,
      }
    );

    const { collectProposalPDFDataTokenAccess } = await import(
      '../factory/pdf/proposal'
    );

    let proposalPDFData: ProposalPDFData;
    try {
      proposalPDFData = await collectProposalPDFDataTokenAccess(
        proposal.primaryKey
      );
    } catch (error) {
      logger.logError(
        `Error collecting proposal PDF data for proposal ${proposal.proposalId} via status action download`,
        {
          ...logContext,
          error,
        }
      );

      await statusLogger(false, failMessage);

      continue;
    }

    let fileMetadata: FileMetadata;
    try {
      fileMetadata = await fetchAndStorePdfFromFactory(
        proposal.primaryKey,
        {
          data: [proposalPDFData],
        },
        fileDataSource
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.logError(
        `Error fetching/storing PDF for proposal ${proposal.proposalId} via status action download`,
        {
          message: err.message,
          name: err.name,
          stack: err.stack,
        }
      );

      await statusLogger(false, failMessage);

      continue;
    }

    logger.logInfo(
      `Successfully fetched and stored PDF for proposal ${proposal.proposalId} via status action download`,
      {
        ...logContext,
        filemetadata: fileMetadata,
      }
    );

    await statusLogger(true, successMessage);
  }
};

async function fetchAndStorePdfFromFactory<TData>(
  primaryKey: number,
  properties: {
    data: TData[];
  },
  fileDataSource: FileDataSource
): Promise<FileMetadata> {
  const controller = new AbortController();

  try {
    const factoryResp = await fetch(`${FACTORY_ENDPOINT}/pdf/proposal`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(properties),
    });

    if (!factoryResp.ok) {
      throw new Error(`Factory request failed: ${await factoryResp.text()}`);
    }

    const factoryRespBody = factoryResp.body;
    if (!factoryRespBody) {
      throw new Error('Factory response body is empty');
    }

    const readableStream = Readable.fromWeb(factoryRespBody as ReadableStream, {
      signal: controller.signal,
    });

    const contentType =
      factoryResp.headers.get('Content-Type') || 'application/pdf';

    const filename = `${primaryKey}.pdf`;

    return await storeFileWithSize(
      fileDataSource,
      filename,
      contentType,
      readableStream
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    logger.logError('Error fetching and storing PDF', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });

    throw err;
  }

  async function storeFileWithSize(
    fileDataSource: FileDataSource,
    filename: string,
    contentType: string,
    readableStream: Readable
  ): Promise<FileMetadata> {
    let contentLength = 0;

    readableStream.on('data', (chunk: Buffer) => {
      contentLength += chunk.length;
    });

    return new Promise((resolve, reject) => {
      readableStream.on('end', async () => {
        try {
          const metadata = await fileDataSource.put(
            filename,
            contentType,
            contentLength,
            readableStream,
            true
          );
          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      });

      readableStream.on('error', reject);
    });
  }
}
