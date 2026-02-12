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
exports.createQuestionTemplateRelationValidationSchema = exports.updateTemplateValidationSchema = exports.updateQuestionsTopicRelsValidationSchema = exports.updateTopicOrderValidationSchema = exports.deleteQuestionTemplateRelationValidationSchema = exports.updateQuestionTemplateRelationValidationSchema = exports.deleteQuestionValidationSchema = exports.updateQuestionValidationSchema = exports.createQuestionValidationSchema = exports.deleteTopicValidationSchema = exports.updateTopicValidationSchema = exports.createTopicValidationSchema = exports.deleteTemplateValidationSchema = exports.cloneTemplateValidationSchema = exports.createTemplateValidationSchema = void 0;
var Yup = __importStar(require("yup"));
exports.createTemplateValidationSchema = Yup.object().shape({
    name: Yup.string().required(),
    description: Yup.string().notRequired(),
});
exports.cloneTemplateValidationSchema = Yup.object().shape({
    templateId: Yup.number().required(),
});
exports.deleteTemplateValidationSchema = exports.cloneTemplateValidationSchema;
exports.createTopicValidationSchema = Yup.object().shape({
    templateId: Yup.number().required(),
    sortOrder: Yup.number().required(),
});
exports.updateTopicValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    title: Yup.string().notRequired(),
    isEnabled: Yup.bool().notRequired(),
});
exports.deleteTopicValidationSchema = Yup.object().shape({
    topicId: Yup.number().required(),
});
var createQuestionValidationSchema = function (dataType) {
    return Yup.object().shape({
        dataType: Yup.string().oneOf(Object.values(dataType)),
    });
};
exports.createQuestionValidationSchema = createQuestionValidationSchema;
exports.updateQuestionValidationSchema = Yup.object().shape({
    id: Yup.string().required(),
    naturalKey: Yup.string().notRequired(),
    question: Yup.string().notRequired(),
    config: Yup.string().notRequired(),
});
exports.deleteQuestionValidationSchema = Yup.object().shape({
    questionId: Yup.string().required(),
});
exports.updateQuestionTemplateRelationValidationSchema = Yup.object().shape({
    questionId: Yup.string().required(),
    templateId: Yup.number().required(),
    topicId: Yup.number().notRequired(),
    sortOrder: Yup.number().notRequired(),
    config: Yup.string().notRequired(),
    dependency: Yup.object().nullable().notRequired(),
});
exports.deleteQuestionTemplateRelationValidationSchema = Yup.object().shape({
    questionId: Yup.string().required(),
    templateId: Yup.number().required(),
});
exports.updateTopicOrderValidationSchema = Yup.object().shape({
    topicOrder: Yup.array().of(Yup.number()),
});
exports.updateQuestionsTopicRelsValidationSchema = Yup.object().shape({
    templateId: Yup.number().required(),
    topicId: Yup.number().required(),
    questionIds: Yup.array().of(Yup.string()).required(),
});
exports.updateTemplateValidationSchema = Yup.object().shape({
    templateId: Yup.number().required(),
    name: Yup.string().notRequired(),
    description: Yup.string().notRequired(),
    isArchived: Yup.bool().notRequired(),
});
exports.createQuestionTemplateRelationValidationSchema = Yup.object().shape({
    templateId: Yup.number().required(),
    questionId: Yup.string().required(),
    sortOrder: Yup.number().required(),
    topicId: Yup.number().required(),
});
//# sourceMappingURL=index.js.map