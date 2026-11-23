import express from 'express';
import { container } from 'tsyringe';

import { UserAuthorization } from '../../../auth/UserAuthorization';
import { Tokens } from '../../../config/Tokens';
import { TemplateDataSource } from '../../../datasources/TemplateDataSource';
import { ExperimentSafetyPDFData } from '../../../factory/pdf/experimentSafety';
import { FullProposalPDFData } from '../../../factory/pdf/proposal';
import { ShipmentPDFData } from '../../../factory/pdf/shipmentLabel';
import { PDFType, MetaBase, DownloadType } from '../../../factory/service';
import callFactoryService from '../../../factory/service';
import { Role } from '../../../models/Role';
import { TemplateGroupId } from '../../../models/Template';
import FactoryServices, { DownloadTypeServices } from '../factoryServices';

const router = express.Router();

router.post(
  `/${PDFType.SHIPMENT_LABEL}/:templateId`,
  async (req, res, next) => {
    try {
      const userAuth = container.resolve<UserAuthorization>(
        Tokens.UserAuthorization
      );
      if (!req.user || !userAuth.isUserOfficer(res.locals.agent)) {
        res
          .status(403)
          .send('Shipment label previews require a User Officer role');

        return;
      }

      const templateId = Number(req.params.templateId);
      const { pdfTemplate } = req.body ?? {};
      if (
        !Number.isSafeInteger(templateId) ||
        templateId < 1 ||
        typeof pdfTemplate !== 'string' ||
        !pdfTemplate.trim() ||
        pdfTemplate.length > 64_000
      ) {
        res
          .status(400)
          .send('Enter a label template of 1 to 64,000 characters');

        return;
      }

      const templates = container.resolve<TemplateDataSource>(
        Tokens.TemplateDataSource
      );
      const template = await templates.getTemplate(templateId);
      if (template?.groupId !== TemplateGroupId.SHIPMENT) {
        res.status(404).send('Shipment declaration template not found');

        return;
      }

      const steps = await templates.getTemplateSteps(templateId);
      const answers = Object.fromEntries(
        steps.flatMap(({ fields }) =>
          fields.map(({ question }) => [
            question.naturalKey,
            `Example ${question.naturalKey}`,
          ])
        )
      );
      const filename = 'shipment-label-preview.pdf';
      await callFactoryService<ShipmentPDFData, MetaBase>(
        DownloadType.PDF,
        PDFType.SHIPMENT_LABEL,
        {
          data: [
            {
              shipment: {
                id: 1,
                title: 'Example shipment',
                externalRef: '000001',
                proposalId: '000002',
                callShortCode: 'CALL',
                instrumentShortCodes: 'INSTRUMENT',
                localContact: 'Example contact',
              },
              answers,
              pdfTemplate,
            },
          ],
          meta: { collectionFilename: filename, singleFilename: filename },
          userRole: req.user.currentRole,
        },
        req,
        res,
        next
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(`/${PDFType.PROPOSAL}`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }
    const { proposalPk, pdfTemplateId } = req.query;

    if (!proposalPk && !pdfTemplateId) {
      res.status(400).send('Invalid request');
    }
    const factoryServices =
      container.resolve<DownloadTypeServices>(FactoryServices);

    const userWithRole = {
      ...res.locals.agent,
    };

    const meta: MetaBase = {
      collectionFilename: '',
      singleFilename: '',
    };

    let payload = null;

    const proposalPkNumber = parseInt(proposalPk as string);
    if (!isNaN(proposalPkNumber)) {
      const proposalPdfData = await factoryServices.getPdfProposals(
        userWithRole,
        [proposalPkNumber],
        meta,
        {
          filter: req.query?.filter?.toString(),
        }
      );

      if (!proposalPdfData) {
        throw new Error('Could not get proposal details');
      }

      const userRole = req.user.currentRole;

      payload = {
        data: proposalPdfData,
        meta,
        userRole,
      };
    }

    const pdfTemplateIdNumber = parseInt(pdfTemplateId as string);
    if (!isNaN(pdfTemplateIdNumber)) {
      const pdfTemplate = await factoryServices.getProposalPdfTemplate(
        userWithRole,
        pdfTemplateIdNumber
      );
      if (!pdfTemplate) {
        throw new Error('Could not get pdf template');
      }

      const dummyData = JSON.parse(pdfTemplate.dummyData) as {
        data: FullProposalPDFData;
        userRole: Role;
      };

      payload = {
        data: [{ ...dummyData.data, pdfTemplate: pdfTemplate }],
        meta,
        userRole: dummyData.userRole,
      };
    }

    if (!payload) {
      throw new Error('Invalid request');
    }

    callFactoryService<FullProposalPDFData, MetaBase>(
      DownloadType.PDF,
      PDFType.PROPOSAL,
      payload,
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(`/${PDFType.EXPERIMENT_SAFETY}`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const { pdfTemplateId } = req.query;

    if (!pdfTemplateId) {
      res.status(400).send('Invalid request');
    }
    const factoryServices =
      container.resolve<DownloadTypeServices>(FactoryServices);

    const userWithRole = {
      ...res.locals.agent,
    };

    const meta: MetaBase = {
      collectionFilename: '',
      singleFilename: '',
    };

    let payload = null;

    const pdfTemplateIdNumber = parseInt(pdfTemplateId as string);
    if (!isNaN(pdfTemplateIdNumber)) {
      const pdfTemplate = await factoryServices.getExperimentSafetyPdfTemplate(
        userWithRole,
        pdfTemplateIdNumber
      );
      if (!pdfTemplate) {
        throw new Error('Could not get pdf template');
      }

      const dummyData = JSON.parse(pdfTemplate.dummyData) as {
        data: ExperimentSafetyPDFData;
        userRole: Role;
      };

      payload = {
        data: [{ ...dummyData.data, pdfTemplate: pdfTemplate }],
        meta,
        userRole: dummyData.userRole,
      };
    }

    if (!payload) {
      throw new Error('Invalid request');
    }
    callFactoryService<ExperimentSafetyPDFData, MetaBase>(
      DownloadType.PDF,
      PDFType.EXPERIMENT_SAFETY,
      payload,
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

export default function pdfPreview() {
  return router;
}
