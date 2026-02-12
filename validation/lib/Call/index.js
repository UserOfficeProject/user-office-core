"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFapToCallInstrumentValidationSchema = exports.removeAssignedInstrumentFromCallValidationSchema = exports.assignInstrumentsToCallValidationSchema = exports.updateCallValidationBackendSchema = exports.updateCallValidationSchemas = exports.createCallValidationSchemas = void 0;
var Yup = __importStar(require("yup"));
var util_1 = require("../util");
var firstStepCreateCallValidationSchema = Yup.object().shape({
    shortCode: Yup.string().required('Short Code is required'),
    startCall: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE_TIME)
        .required('Start call date is required'),
    endCall: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE_TIME)
        .required('End call date is required')
        .when('startCall', function (startCall, schema) {
        if (!(0, util_1.isValidDate)(startCall)) {
            return schema;
        }
        return schema.min(startCall, 'End call date can not be before start call date.');
    }),
    endCallInternal: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE_TIME)
        .when('endCall', function (endCall, schema) {
        if (!(0, util_1.isValidDate)(endCall)) {
            return schema;
        }
        return schema.min(endCall, 'Internal call end date can not be before call end date.');
    }),
    templateId: Yup.number().required(),
    proposalWorkflowId: Yup.number().required(),
    experimentWorkflowId: Yup.number().nullable().notRequired(),
    proposalPdfTemplateId: Yup.number().nullable().notRequired(),
    experimentPdfTemplateId: Yup.number().nullable().notRequired(),
});
var firstStepUpdateCallValidationSchema = firstStepCreateCallValidationSchema.concat(Yup.object()
    .shape({
    id: Yup.number().required('Id is required'),
})
    .required());
var secondStepCallValidationSchema = Yup.object().shape({
    startReview: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .required('Start review date is required'),
    endReview: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .required('End review date is required')
        .when('startReview', function (startReview, schema) {
        if (!(0, util_1.isValidDate)(startReview)) {
            return schema;
        }
        return schema.min(startReview, 'End review date can not be before start review date.');
    }),
    startFapReview: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .nullable()
        .notRequired(),
    endFapReview: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .nullable()
        .notRequired()
        .when('startFapReview', function (startFapReview, schema) {
        if (!(0, util_1.isValidDate)(startFapReview)) {
            return schema;
        }
        return schema.min(startFapReview, 'End Fap review date can not be before start Fap review date.');
    }),
    surveyComment: Yup.string()
        .max(100, 'Survey comment should be no longer than 100 characters')
        .required('Survey comment is required'),
});
var thirdStepCallValidationSchema = Yup.object().shape({
    startNotify: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .required('Start notify date is required'),
    endNotify: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .required('End notify date is required')
        .when('startNotify', function (startNotify, schema) {
        if (!(0, util_1.isValidDate)(startNotify)) {
            return schema;
        }
        return schema.min(startNotify, 'End notify date can not be before start notify date.');
    }),
    startCycle: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .required('Start cycle date is required'),
    endCycle: Yup.date()
        .typeError(util_1.TYPE_ERR_INVALID_DATE)
        .required('End cycle date is required')
        .when('startCycle', function (startCycle, schema) {
        if (!(0, util_1.isValidDate)(startCycle)) {
            return schema;
        }
        return schema.min(startCycle, 'End cycle date can not be before start cycle date.');
    }),
    cycleComment: Yup.string()
        .max(100, 'Cycle comment should be no longer than 100 characters')
        .required('Cycle comment is required'),
});
exports.createCallValidationSchemas = [
    firstStepCreateCallValidationSchema,
    secondStepCallValidationSchema,
    thirdStepCallValidationSchema,
];
exports.updateCallValidationSchemas = [
    firstStepUpdateCallValidationSchema,
    secondStepCallValidationSchema,
    thirdStepCallValidationSchema,
];
exports.updateCallValidationBackendSchema = Yup.object().shape({
    // from first step
    id: firstStepUpdateCallValidationSchema.fields.id,
    shortCode: firstStepCreateCallValidationSchema.fields.shortCode.optional(),
    startCall: firstStepCreateCallValidationSchema.fields.startCall.optional(),
    endCall: firstStepCreateCallValidationSchema.fields.endCall.optional(),
    endCallInternal: firstStepCreateCallValidationSchema.fields.endCallInternal.optional(),
    templateId: firstStepCreateCallValidationSchema.fields.templateId.optional(),
    proposalWorkflowId: firstStepCreateCallValidationSchema.fields.proposalWorkflowId.optional(),
    experimentWorkflowId: firstStepCreateCallValidationSchema.fields.experimentWorkflowId.optional(),
    proposalPdfTemplateId: firstStepCreateCallValidationSchema.fields.proposalPdfTemplateId.optional(),
    experimentPdfTemplateId: firstStepCreateCallValidationSchema.fields.experimentPdfTemplateId.optional(),
    // from second step
    startReview: secondStepCallValidationSchema.fields.startReview.optional(),
    endReview: secondStepCallValidationSchema.fields.endReview.optional(),
    startFapReview: secondStepCallValidationSchema.fields.startFapReview.optional(),
    endFapReview: secondStepCallValidationSchema.fields.endFapReview.optional(),
    surveyComment: secondStepCallValidationSchema.fields.surveyComment.optional(),
    // from third step
    startNotify: thirdStepCallValidationSchema.fields.startNotify.optional(),
    endNotify: thirdStepCallValidationSchema.fields.endNotify.optional(),
    startCycle: thirdStepCallValidationSchema.fields.startCycle.optional(),
    endCycle: thirdStepCallValidationSchema.fields.endCycle.optional(),
    cycleComment: thirdStepCallValidationSchema.fields.cycleComment.optional(),
});
exports.assignInstrumentsToCallValidationSchema = Yup.object().shape({
    callId: Yup.number().required('callId is required'),
    instrumentIds: Yup.array(Yup.number())
        .required('At least one instrumentId is required')
        .min(1),
});
exports.removeAssignedInstrumentFromCallValidationSchema = Yup.object().shape({
    callId: Yup.number().required('callId is required'),
    instrumentId: Yup.number().required('instrumentId is required'),
});
exports.updateFapToCallInstrumentValidationSchema = Yup.object().shape({
    callId: Yup.number().required('callId is required'),
    instrumentId: Yup.number().required('instrumentId is required'),
    fapId: Yup.number(),
});
//# sourceMappingURL=index.js.map