import * as Yup from 'yup';

import { isValidDate, TYPE_ERR_INVALID_DATE, TYPE_ERR_INVALID_DATE_TIME } from '../util';

const firstStepCreateCallValidationSchemaFields = {
  shortCode: Yup.string().required('Short Code is required'),
  startCall: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE_TIME)
    .required('Start call date is required'),
  endCall: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE_TIME)
    .required('End call date is required')
    .when('startCall', ([startCall]: [Date], schema) => {
      if (!isValidDate(startCall)) {
        return schema;
      }

      return schema.min(startCall, 'End call date can not be before start call date.');
    }),
  endCallInternal: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE_TIME)
    .when('endCall', ([endCall]: [Date], schema) => {
      if (!isValidDate(endCall)) {
        return schema;
      }

      return schema.min(endCall, 'Internal call end date can not be before call end date.');
    }),
  templateId: Yup.number().required(),
  proposalWorkflowId: Yup.number().required(),
  experimentWorkflowId: Yup.number().nullable().notRequired(),
  proposalPdfTemplateId: Yup.number().nullable().notRequired(),
  experimentPdfTemplateId: Yup.number().nullable().notRequired(),
};

const firstStepCreateCallValidationSchema = Yup.object().shape(
  firstStepCreateCallValidationSchemaFields,
);

const firstStepUpdateCallValidationSchema = firstStepCreateCallValidationSchema.concat(
  Yup.object()
    .shape({
      id: Yup.number().required('Id is required'),
    })
    .required(),
);

const secondStepCallValidationSchemaFields = {
  startReview: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('Start review date is required'),
  endReview: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('End review date is required')
    .when('startReview', ([startReview]: [Date], schema) => {
      if (!isValidDate(startReview)) {
        return schema;
      }

      return schema.min(startReview, 'End review date can not be before start review date.');
    }),
  startFapReview: Yup.date().typeError(TYPE_ERR_INVALID_DATE).nullable().notRequired(),
  endFapReview: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .nullable()
    .notRequired()
    .when('startFapReview', ([startFapReview]: [Date], schema) => {
      if (!isValidDate(startFapReview)) {
        return schema;
      }

      return schema.min(
        startFapReview,
        'End Fap review date can not be before start Fap review date.',
      );
    }),
};

const secondStepCallValidationSchema = Yup.object().shape(secondStepCallValidationSchemaFields);

const thirdStepCallValidationSchemaFields = {
  startNotify: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('Start notify date is required'),
  endNotify: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('End notify date is required')
    .when('startNotify', ([startNotify]: [Date], schema) => {
      if (!isValidDate(startNotify)) {
        return schema;
      }

      return schema.min(startNotify, 'End notify date can not be before start notify date.');
    }),
  startCycle: Yup.date().typeError(TYPE_ERR_INVALID_DATE).required('Start cycle date is required'),
  endCycle: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('End cycle date is required')
    .when('startCycle', ([startCycle]: [Date], schema) => {
      if (!isValidDate(startCycle)) {
        return schema;
      }

      return schema.min(startCycle, 'End cycle date can not be before start cycle date.');
    }),
  cycleComment: Yup.string()
    .max(100, 'Cycle comment should be no longer than 100 characters')
    .required('Cycle comment is required'),
};
const thirdStepCallValidationSchema = Yup.object().shape(thirdStepCallValidationSchemaFields);

export const createCallValidationSchemas = [
  firstStepCreateCallValidationSchema,
  secondStepCallValidationSchema,
  thirdStepCallValidationSchema,
];

export const updateCallValidationSchemas = [
  firstStepUpdateCallValidationSchema,
  secondStepCallValidationSchema,
  thirdStepCallValidationSchema,
];

export const updateCallValidationBackendSchema = Yup.object().shape({
  // from first step
  id: firstStepUpdateCallValidationSchema.fields.id,
  shortCode: firstStepCreateCallValidationSchemaFields.shortCode.optional(),
  startCall: firstStepCreateCallValidationSchemaFields.startCall.optional(),
  endCall: firstStepCreateCallValidationSchemaFields.endCall.optional(),
  endCallInternal: firstStepCreateCallValidationSchemaFields.endCallInternal.optional(),
  templateId: firstStepCreateCallValidationSchemaFields.templateId.optional(),
  proposalWorkflowId: firstStepCreateCallValidationSchemaFields.proposalWorkflowId.optional(),
  experimentWorkflowId: firstStepCreateCallValidationSchemaFields.experimentWorkflowId.optional(),
  proposalPdfTemplateId: firstStepCreateCallValidationSchemaFields.proposalPdfTemplateId.optional(),
  experimentPdfTemplateId:
    firstStepCreateCallValidationSchemaFields.experimentPdfTemplateId.optional(),
  // from second step
  startReview: secondStepCallValidationSchemaFields.startReview.optional(),
  endReview: secondStepCallValidationSchemaFields.endReview.optional(),
  startFapReview: secondStepCallValidationSchemaFields.startFapReview.optional(),
  endFapReview: secondStepCallValidationSchemaFields.endFapReview.optional(),
  // from third step
  startNotify: thirdStepCallValidationSchemaFields.startNotify.optional(),
  endNotify: thirdStepCallValidationSchemaFields.endNotify.optional(),
  startCycle: thirdStepCallValidationSchemaFields.startCycle.optional(),
  endCycle: thirdStepCallValidationSchemaFields.endCycle.optional(),
  cycleComment: thirdStepCallValidationSchemaFields.cycleComment.optional(),
});

export const assignInstrumentsToCallValidationSchema = Yup.object().shape({
  callId: Yup.number().required('callId is required'),
  instrumentIds: Yup.array(Yup.number()).required('At least one instrumentId is required').min(1),
});

export const removeAssignedInstrumentFromCallValidationSchema = Yup.object().shape({
  callId: Yup.number().required('callId is required'),
  instrumentId: Yup.number().required('instrumentId is required'),
});

export const updateFapToCallInstrumentValidationSchema = Yup.object().shape({
  callId: Yup.number().required('callId is required'),
  instrumentId: Yup.number().required('instrumentId is required'),
  fapId: Yup.number(),
});
