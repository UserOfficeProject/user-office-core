import * as Yup from 'yup';

import {
  isValidDate,
  TYPE_ERR_INVALID_DATE,
  TYPE_ERR_INVALID_DATE_TIME,
} from '../util';

const firstStepCreateCallValidationSchema = Yup.object().shape({
  shortCode: Yup.string().required('Short Code is required'),
  startCall: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE_TIME)
    .required('Start call date is required'),
  endCall: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE_TIME)
    .required('End call date is required')
    .when('startCall', (startCall: Date, schema: Yup.DateSchema) => {
      if (!isValidDate(startCall)) {
        return schema;
      }

      return schema.min(
        startCall,
        'End call date can not be before start call date.'
      );
    }),
  endCallInternal: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE_TIME)
    .when('endCall', (endCall: Date, schema: Yup.DateSchema) => {
      if (!isValidDate(endCall)) {
        return schema;
      }

      return schema.min(
        endCall,
        'Internal call end date can not be before call end date.'
      );
    }),
  templateId: Yup.number().required(),
  proposalWorkflowId: Yup.number().required(),
  experimentWorkflowId: Yup.number().nullable().notRequired(),
  proposalPdfTemplateId: Yup.number().nullable().notRequired(),
  experimentPdfTemplateId: Yup.number().nullable().notRequired(),
});

const firstStepUpdateCallValidationSchema =
  firstStepCreateCallValidationSchema.concat(
    Yup.object()
      .shape({
        id: Yup.number().required('Id is required'),
      })
      .required()
  );

const secondStepCallValidationSchema = Yup.object().shape({
  startReview: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('Start review date is required'),
  endReview: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('End review date is required')
    .when('startReview', (startReview: Date, schema: Yup.DateSchema) => {
      if (!isValidDate(startReview)) {
        return schema;
      }

      return schema.min(
        startReview,
        'End review date can not be before start review date.'
      );
    }),
  startFapReview: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .nullable()
    .notRequired(),
  endFapReview: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .nullable()
    .notRequired()
    .when(
      'startFapReview',
      (
        startFapReview: Date,
        schema: Yup.DateSchema<
          Date | null | undefined,
          Record<string, unknown>,
          Date | null | undefined
        >
      ) => {
        if (!isValidDate(startFapReview)) {
          return schema;
        }

        return schema.min(
          startFapReview,
          'End Fap review date can not be before start Fap review date.'
        );
      }
    ),
  surveyComment: Yup.string()
    .max(100, 'Survey comment should be no longer than 100 characters')
    .required('Survey comment is required'),
});

const thirdStepCallValidationSchema = Yup.object().shape({
  startNotify: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('Start notify date is required'),
  endNotify: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('End notify date is required')
    .when('startNotify', (startNotify: Date, schema: Yup.DateSchema) => {
      if (!isValidDate(startNotify)) {
        return schema;
      }

      return schema.min(
        startNotify,
        'End notify date can not be before start notify date.'
      );
    }),
  startCycle: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('Start cycle date is required'),
  endCycle: Yup.date()
    .typeError(TYPE_ERR_INVALID_DATE)
    .required('End cycle date is required')
    .when('startCycle', (startCycle: Date, schema: Yup.DateSchema) => {
      if (!isValidDate(startCycle)) {
        return schema;
      }

      return schema.min(
        startCycle,
        'End cycle date can not be before start cycle date.'
      );
    }),
  cycleComment: Yup.string()
    .max(100, 'Cycle comment should be no longer than 100 characters')
    .required('Cycle comment is required'),
});

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
  shortCode: firstStepCreateCallValidationSchema.fields.shortCode.optional(),
  startCall: firstStepCreateCallValidationSchema.fields.startCall.optional(),
  endCall: firstStepCreateCallValidationSchema.fields.endCall.optional(),
  endCallInternal:
    firstStepCreateCallValidationSchema.fields.endCallInternal.optional(),
  templateId: firstStepCreateCallValidationSchema.fields.templateId.optional(),
  proposalWorkflowId:
    firstStepCreateCallValidationSchema.fields.proposalWorkflowId.optional(),
  experimentWorkflowId:
    firstStepCreateCallValidationSchema.fields.experimentWorkflowId.optional(),
  proposalPdfTemplateId:
    firstStepCreateCallValidationSchema.fields.proposalPdfTemplateId.optional(),
  experimentPdfTemplateId:
    firstStepCreateCallValidationSchema.fields.experimentPdfTemplateId.optional(),
  // from second step
  startReview: secondStepCallValidationSchema.fields.startReview.optional(),
  endReview: secondStepCallValidationSchema.fields.endReview.optional(),
  startFapReview:
    secondStepCallValidationSchema.fields.startFapReview.optional(),
  endFapReview: secondStepCallValidationSchema.fields.endFapReview.optional(),
  surveyComment: secondStepCallValidationSchema.fields.surveyComment.optional(),
  // from third step
  startNotify: thirdStepCallValidationSchema.fields.startNotify.optional(),
  endNotify: thirdStepCallValidationSchema.fields.endNotify.optional(),
  startCycle: thirdStepCallValidationSchema.fields.startCycle.optional(),
  endCycle: thirdStepCallValidationSchema.fields.endCycle.optional(),
  cycleComment: thirdStepCallValidationSchema.fields.cycleComment.optional(),
});

export const assignInstrumentsToCallValidationSchema = Yup.object().shape({
  callId: Yup.number().required('callId is required'),
  instrumentIds: Yup.array(Yup.number())
    .required('At least one instrumentId is required')
    .min(1),
});

export const removeAssignedInstrumentFromCallValidationSchema =
  Yup.object().shape({
    callId: Yup.number().required('callId is required'),
    instrumentId: Yup.number().required('instrumentId is required'),
  });

export const updateFapToCallInstrumentValidationSchema = Yup.object().shape({
  callId: Yup.number().required('callId is required'),
  instrumentId: Yup.number().required('instrumentId is required'),
  fapId: Yup.number(),
});
