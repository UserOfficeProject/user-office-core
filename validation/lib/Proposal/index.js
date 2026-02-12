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
exports.deleteProposalScientistCommentValidationSchema = exports.updateProposalScientistCommentValidationSchema = exports.createProposalScientistCommentValidationSchema = exports.generalInfoUpdateValidationSchema = exports.administrationProposalValidationSchema = exports.proposalNotifyValidationSchema = exports.deleteProposalValidationSchema = exports.submitProposalValidationSchema = exports.updateProposalValidationSchema = exports.createProposalValidationSchema = void 0;
var Yup = __importStar(require("yup"));
exports.createProposalValidationSchema = Yup.object().shape({
    callId: Yup.number().required(),
});
exports.updateProposalValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required(),
    title: Yup.string().required(),
    abstract: Yup.string().required(),
    answers: Yup.array().notRequired(),
    topicsCompleted: Yup.array().notRequired(),
    users: Yup.array().notRequired(),
    proposerId: Yup.number().notRequired(),
    partialSave: Yup.bool().notRequired(),
});
exports.submitProposalValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required(),
});
exports.deleteProposalValidationSchema = exports.submitProposalValidationSchema;
exports.proposalNotifyValidationSchema = exports.submitProposalValidationSchema;
exports.administrationProposalValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required(),
    finalStatus: Yup.string().required(),
    commentForUser: Yup.string().nullable(),
    commentForManagement: Yup.string().nullable(),
    managementTimeAllocations: Yup.array()
        .of(Yup.object().shape({
        instrumentId: Yup.number().required(),
        value: Yup.number()
            .min(0, function (_a) {
            var min = _a.min;
            return "Must be greater than or equal to ".concat(min);
        })
            .max(1e5, function (_a) {
            var max = _a.max;
            return "Must be less than or equal to ".concat(max);
        })
            .nullable(),
    }))
        .required()
        .min(1),
    managementDecisionSubmitted: Yup.bool().nullable(),
});
var MAX_TITLE_LEN = 175;
var MAX_ABSTRACT_LEN = 1500;
exports.generalInfoUpdateValidationSchema = Yup.object().shape({
    title: Yup.string()
        .max(MAX_TITLE_LEN, 'Title must be at most 175 characters')
        .required('Title is required'),
    abstract: Yup.string()
        .max(MAX_ABSTRACT_LEN, 'Abstract must be at most 1500 characters')
        .required('Abstract is required'),
});
exports.createProposalScientistCommentValidationSchema = Yup.object().shape({
    comment: Yup.string().min(1).required('Comment is required'),
    proposalPk: Yup.number().required(),
});
exports.updateProposalScientistCommentValidationSchema = Yup.object().shape({
    commentId: Yup.number().required(),
    comment: Yup.string().min(1).required('Comment is required'),
});
exports.deleteProposalScientistCommentValidationSchema = Yup.object().shape({
    commentId: Yup.number().required(),
});
//# sourceMappingURL=index.js.map