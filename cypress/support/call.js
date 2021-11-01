import faker from 'faker';
import { GraphQLClient } from 'graphql-request';

const createCall = ({
  shortCode,
  title = '',
  description = '',
  startDate,
  endDate,
  templateId,
  esiTemplateId,
  workflowId,
  surveyComment,
  cycleComment,
}) => {
  const callShortCode = shortCode || faker.lorem.word();
  const callStartDate =
    startDate || faker.date.past().toISOString().slice(0, 10);
  const callEndDate = endDate || faker.date.future().toISOString().slice(0, 10);
  const callSurveyComment = surveyComment || faker.lorem.word();
  const callCycleComment = cycleComment || faker.lorem.word();
  const allocationTimeUnit = 'Day';
  const referenceNumberFormat = '';
  const currentDayStart = new Date();
  currentDayStart.setHours(0, 0, 0, 0);

  const query = `mutation {
    createCall(createCallInput: {
      shortCode: "${callShortCode}",
      startCall: "${callStartDate}",
      endCall: "${callEndDate}",
      startReview: "${currentDayStart}",
      endReview: "${currentDayStart}",
      startSEPReview: "${currentDayStart}",
      endSEPReview: "${currentDayStart}",
      startNotify: "${currentDayStart}",
      endNotify: "${currentDayStart}",
      startCycle: "${currentDayStart}",
      endCycle: "${currentDayStart}",
      cycleComment: "${callCycleComment}",
      surveyComment: "${callSurveyComment}",
      allocationTimeUnit: ${allocationTimeUnit},
      referenceNumberFormat: "${referenceNumberFormat}",
      proposalWorkflowId: ${workflowId},
      templateId: ${templateId},
      esiTemplateId: ${esiTemplateId},
      title: "${title}",
      description: "${description}",
    }) {
      rejection {
        reason
      }
      call {
        id
      }
    }
  }`;
  const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;
  const request = new GraphQLClient('/gateway', {
    headers: { authorization: authHeader },
  }).rawRequest(query, null);

  cy.wrap(request);
};

Cypress.Commands.add('createCall', createCall);
