import contentDisposition from 'content-disposition';
import express, { Response } from 'express';
import request from 'request';

import baseContext from '../buildContext';
import { AuthJwtPayload } from '../models/User';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/Logger';
import { collectProposalPDFData } from './pdf/proposal';
import { collectSamplePDFData } from './pdf/sample';

const router = express.Router();

const ENDPOINT = process.env.GENERATE_PROPOSAL_PDF_ENDPOINT!;

const bufferRequestBody = (req: request.Request) =>
  new Promise(resolve => {
    const buffer: Buffer[] = [];

    req.on('data', chunk =>
      buffer.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    );

    req.on('complete', () => resolve(Buffer.concat(buffer).toString()));
  });

function factoryRequest<T extends { filename: string }>(
  pdfType: 'proposal' | 'sample',
  data: T[],
  res: Response
) {
  const pdfReq = request
    .post(`${ENDPOINT}/${pdfType}`, { json: data })
    .on('response', pdfResp => {
      if (pdfResp.statusCode !== 200) {
        bufferRequestBody(pdfReq)
          .then(body => {
            logger.logError('Failed to generate PDF', {
              response: body,
              pdfType,
            });
          })
          .catch(err => {
            logger.logException(
              'Failed to generate PDF and read response body',
              err,
              {
                pdfType,
              }
            );
          });

        res.status(500).send('Failed to generate PDF');
      } else {
        res.setHeader(
          'Content-Disposition',
          contentDisposition(
            data.length > 1 ? `${pdfType}_collection.pdf` : data[0].filename
          )
        );

        pdfResp.pipe(res);
      }
    })
    .on('error', err => {
      logger.logException('Could not download generated PDF', err, { pdfType });
      res.status(500).send('Could not download generated PDF');
    });
}

router.get('/download/proposal/:proposal_ids', async (req: any, res) => {
  try {
    const decoded = verifyToken<AuthJwtPayload>(req.cookies.token);
    const user = await baseContext.queries.user.getAgent(decoded.user.id);

    if (user == null) {
      throw new Error('Could not find user');
    }

    const proposalIds: number[] = req.params.proposal_ids
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const userWithRole = { ...user, currentRole: decoded.currentRole };

    const data = await Promise.all(
      proposalIds.map(proposalId =>
        collectProposalPDFData(proposalId, userWithRole)
      )
    );

    factoryRequest('proposal', data, res);
  } catch (e) {
    logger.logException('Could not download generated PDF', e);
    res.status(500).send('Could not download generated PDF');
  }
});

router.get('/download/sample/:sample_ids', async (req: any, res) => {
  try {
    const decoded = verifyToken<AuthJwtPayload>(req.cookies.token);
    const user = await baseContext.queries.user.getAgent(decoded.user.id);

    if (user == null) {
      throw new Error('Could not find user');
    }

    const sampleIds: number[] = req.params.sample_ids
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const userWithRole = { ...user, currentRole: decoded.currentRole };

    const data = await Promise.all(
      sampleIds.map(sampleId => collectSamplePDFData(sampleId, userWithRole))
    );

    factoryRequest('sample', data, res);
  } catch (e) {
    logger.logException('Could not download generated PDF', e);
    res.status(500).send('Could not download generated PDF');
  }
});

export default function proposalDownload() {
  return router;
}
