import contentDisposition from 'content-disposition';
import express from 'express';
import request from 'request';

import baseContext from '../buildContext';
import { questionaryDataSource } from '../datasources';
import { Proposal } from '../models/Proposal';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId,
} from '../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../models/Questionary';
import { TechnicalReview } from '../models/TechnicalReview';
import { DataType } from '../models/Template';
import { UserWithRole, AuthJwtPayload, BasicUserDetails } from '../models/User';
import { isRejection } from '../rejection';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/Logger';

type ProposalPDFData = {
  proposal: Proposal;
  principalInvestigator: BasicUserDetails;
  coProposers: BasicUserDetails[];
  questionarySteps: QuestionaryStep[];
  attachmentIds: string[];
  technicalReview?: TechnicalReview;
  filename: string;
};

const router = express.Router();

const getTopicActiveAnswers = (
  questionarySteps: QuestionaryStep[],
  topicId: number
) => {
  const step = getQuestionaryStepByTopicId(questionarySteps, topicId);

  return step
    ? (step.fields.filter(field => {
        return areDependenciesSatisfied(
          questionarySteps,
          field.question.proposalQuestionId
        );
      }) as Answer[])
    : [];
};

const getFileAttachmentIds = (answer: Answer) => {
  if (answer.question.dataType === DataType.FILE_UPLOAD && answer.value) {
    if (typeof answer.value !== 'string') {
      logger.logError(
        'Questionary answer with DataType `FILE_UPLOAD` has no string `answer.value`',
        { answer }
      );

      return [];
    } else {
      return answer.value.split(',');
    }
  }

  return [];
};

const collectSubtemplateData = async (answer: Answer) => {
  const subQuestionaryIds = answer.value;
  const attachmentIds: string[] = [];

  const questionaryAnswers: Array<{ fields: Answer[] }> = [];

  for (const subQuestionaryId of subQuestionaryIds) {
    const questionarySteps = await questionaryDataSource.getQuestionarySteps(
      subQuestionaryId
    );

    const stepAnswers: Answer[] = [];

    questionarySteps.forEach(questionaryStep => {
      const answers = getTopicActiveAnswers(
        questionarySteps,
        questionaryStep.topic.id
      );

      for (const answer of answers) {
        stepAnswers.push(answer);
        attachmentIds.push(...getFileAttachmentIds(answer));
      }
    });

    questionaryAnswers.push({
      fields: stepAnswers,
    });
  }

  return {
    questionaryAnswers,
    attachmentIds,
  };
};

const collectProposalPDFData = async (
  proposalId: number,
  user: UserWithRole
): Promise<ProposalPDFData> => {
  const UserAuthorization = baseContext.userAuthorization;
  const proposal = await baseContext.queries.proposal.get(user, proposalId);

  // Authenticate user
  if (!proposal || !UserAuthorization.hasAccessRights(user, proposal)) {
    throw new Error('User was not allowed to download PDF');
  }

  const queries = baseContext.queries.questionary;

  const questionarySteps = await queries.getQuestionarySteps(
    user,
    proposal.questionaryId
  );

  if (isRejection(questionarySteps) || questionarySteps == null) {
    throw new Error('Could not fetch questionary');
  }

  const principalInvestigator = await baseContext.queries.user.getBasic(
    user,
    proposal.proposerId
  );
  const coProposers = await baseContext.queries.user.getProposers(
    user,
    proposalId
  );

  if (!principalInvestigator || !coProposers) {
    throw new Error('User was not PI or co-proposer');
  }

  const out: ProposalPDFData = {
    proposal,
    principalInvestigator,
    coProposers,
    questionarySteps: [],
    attachmentIds: [],
    filename: `${proposal.created.getUTCFullYear()}_${
      principalInvestigator.lastname
    }_${proposal.shortCode}.pdf`,
  };

  // Information from each topic in proposal
  for (const step of questionarySteps) {
    if (!step) {
      console.error('step not found', questionarySteps);

      throw 'Could not download generated PDF';
    }

    const topic = step.topic;
    const answers = getTopicActiveAnswers(questionarySteps, topic.id);

    const questionaryAttachmentIds = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      questionaryAttachmentIds.push(...getFileAttachmentIds(answer));

      if (answer.question.dataType === DataType.SUBTEMPLATE) {
        const {
          attachmentIds,
          questionaryAnswers,
        } = await collectSubtemplateData(answer);

        answers[i].value = questionaryAnswers;
        questionaryAttachmentIds.push(...attachmentIds);
      }
    }

    out.questionarySteps.push({
      ...step,
      fields: answers,
    });
    out.attachmentIds.push(...questionaryAttachmentIds);
  }

  if (UserAuthorization.isReviewerOfProposal(user, proposal.id)) {
    const technicalReview = await baseContext.queries.review.technicalReviewForProposal(
      user,
      proposal.id
    );
    if (technicalReview) {
      out.technicalReview;
    }
  }

  return out;
};

router.get('/proposal/download/:proposal_ids', async (req: any, res) => {
  try {
    const decoded = verifyToken<AuthJwtPayload>(req.cookies.token);
    const proposalIds: number[] = req.params.proposal_ids
      .split(',')
      .map((n: string) => parseInt(n));

    const user = await baseContext.queries.user.getAgent(decoded.user.id);

    if (user == null) {
      throw new Error('Could not find user');
    }

    const userWithRole = { ...user, currentRole: decoded.currentRole };

    const data = await Promise.all(
      proposalIds.map(proposalId =>
        collectProposalPDFData(proposalId, userWithRole)
      )
    );

    const pdfReq = request
      .post(process.env.GENERATE_PROPOSAL_PDF_ENDPOINT!, { json: data })
      .on('response', pdfResp => {
        if (pdfResp.statusCode !== 200) {
          const buffer: Buffer[] = [];
          // TODO: handle if chunk is string
          pdfReq.on('data', chunk => buffer.push(chunk as Buffer));
          pdfReq.on('complete', () => {
            const body = Buffer.concat(buffer).toString();

            logger.logError('Failed to generate PDF', { response: body });
          });
          res.status(500).send('Failed to generate PDF');
        } else {
          res.setHeader(
            'Content-Disposition',
            contentDisposition(
              data.length > 1 ? 'proposals.pdf' : data[0].filename
            )
          );

          pdfResp.pipe(res);
        }
      })
      .on('error', err => {
        logger.logException('Could not download generated PDF', err);
        res.status(500).send('Could not download generated PDF');
      });
  } catch (e) {
    logger.logException('Could not download generated PDF', e);
    res.status(500).send('Could not download generated PDF');
  }
});

export default function proposalDownload() {
  return router;
}
