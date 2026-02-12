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
exports.overwriteFapMeetingDecisionRankingValidationSchema = exports.saveFapMeetingDecisionValidationSchema = exports.updateTimeAllocationValidationSchema = exports.assignFapMemberToProposalValidationSchema = exports.assignProposalToFapValidationSchema = exports.removeFapMemberValidationSchema = exports.assignFapMembersValidationSchema = exports.assignFapChairOrSecretaryValidationSchema = exports.updateFapValidationSchema = exports.createFapValidationSchema = void 0;
var Yup = __importStar(require("yup"));
exports.createFapValidationSchema = Yup.object().shape({
    code: Yup.string().required(),
    description: Yup.string().required(),
    numberRatingsRequired: Yup.number().min(2).required(),
});
exports.updateFapValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    code: Yup.string().required(),
    description: Yup.string().required(),
    numberRatingsRequired: Yup.number().min(2).required(),
});
var assignFapChairOrSecretaryValidationSchema = function (UserRole) {
    return Yup.object().shape({
        assignChairOrSecretaryToFapInput: Yup.object()
            .shape({
            userId: Yup.number().required(),
            roleId: Yup.number()
                .oneOf([UserRole.FAP_CHAIR, UserRole.FAP_SECRETARY])
                .required(),
            fapId: Yup.number().required(),
        })
            .required(),
    });
};
exports.assignFapChairOrSecretaryValidationSchema = assignFapChairOrSecretaryValidationSchema;
exports.assignFapMembersValidationSchema = Yup.object().shape({
    memberIds: Yup.array(Yup.number()).required(),
    fapId: Yup.number().required(),
});
exports.removeFapMemberValidationSchema = Yup.object().shape({
    memberId: Yup.number().required(),
    fapId: Yup.number().required(),
});
exports.assignProposalToFapValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required(),
    fapId: Yup.number().required(),
});
exports.assignFapMemberToProposalValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required(),
    fapId: Yup.number().required(),
    memberId: Yup.number().required(),
});
exports.updateTimeAllocationValidationSchema = Yup.object({
    fapId: Yup.number().required(),
    proposalPk: Yup.number().required(),
    fapTimeAllocation: Yup.number()
        .min(0, function (_a) {
        var min = _a.min;
        return "Must be greater than or equal to ".concat(min);
    })
        .max(1e5, function (_a) {
        var max = _a.max;
        return "Must be less than or equal to ".concat(max);
    })
        .nullable(),
});
exports.saveFapMeetingDecisionValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required(),
    commentForUser: Yup.string().nullable(),
    commentForManagement: Yup.string().nullable(),
    recommendation: Yup.string().nullable(),
    rankOrder: Yup.number()
        .min(0, function (_a) {
        var min = _a.min;
        return "Must be greater than or equal to ".concat(min);
    })
        .max(1e5, function (_a) {
        var max = _a.max;
        return "Must be less than or equal to ".concat(max);
    }),
    submitted: Yup.bool().nullable(),
});
exports.overwriteFapMeetingDecisionRankingValidationSchema = Yup.object().shape({
    proposalPk: Yup.number().required(),
    rankOrder: Yup.number()
        .min(0, function (_a) {
        var min = _a.min;
        return "Must be greater than or equal to ".concat(min);
    })
        .max(1e5, function (_a) {
        var max = _a.max;
        return "Must be less than or equal to ".concat(max);
    }),
});
//# sourceMappingURL=index.js.map