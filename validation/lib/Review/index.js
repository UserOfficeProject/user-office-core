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
exports.submitProposalReviewValidationSchema = exports.addUserForReviewValidationSchema = exports.removeUserForReviewValidationSchema = exports.proposalTechnicalReviewValidationSchema = exports.proposalGradeValidationSchema = void 0;
var Yup = __importStar(require("yup"));
var util_1 = require("../util");
var proposalFapReviewCommentValidationSchema = function () {
    var schema = Yup.string().transform(function (value) {
        return (0, util_1.sanitizeHtmlAndCleanText)(value);
    });
    schema = schema
        .max(util_1.FAP_REVIEW_COMMENT_CHAR_LIMIT, "Comment must be at most ".concat(util_1.FAP_REVIEW_COMMENT_CHAR_LIMIT, " characters"))
        .required();
    return schema;
};
exports.proposalGradeValidationSchema = Yup.object().shape({
    comment: proposalFapReviewCommentValidationSchema(),
    grade: Yup.string().required(),
});
exports.proposalTechnicalReviewValidationSchema = Yup.object().shape({
    status: Yup.string().required(),
    timeAllocation: Yup.number()
        .min(0, function (_a) {
        var min = _a.min;
        return "Must be greater than or equal to ".concat(min);
    })
        .max(1e5, function (_a) {
        var max = _a.max;
        return "Must be less than or equal to ".concat(max);
    })
        .required('Time allocation is required'),
    comment: Yup.string().nullable(),
    publicComment: Yup.string().nullable(),
});
exports.removeUserForReviewValidationSchema = Yup.object().shape({
    reviewID: Yup.number().required(),
});
exports.addUserForReviewValidationSchema = Yup.object().shape({
    userID: Yup.number().required(),
    proposalPk: Yup.number().required(),
});
exports.submitProposalReviewValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required('Proposal Primary Key is required'),
    reviewId: Yup.number().required('Review ID is required'),
});
//# sourceMappingURL=index.js.map