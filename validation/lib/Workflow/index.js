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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStatusActionsToConnectionValidationSchema = exports.addNextStatusEventsValidationSchema = exports.deleteWorkflowStatusValidationSchema = exports.moveWorkflowStatusValidationSchema = exports.addWorkflowStatusValidationSchema = exports.deleteWorkflowValidationSchema = exports.updateWorkflowValidationSchema = exports.createWorkflowValidationSchema = void 0;
var Yup = __importStar(require("yup"));
exports.createWorkflowValidationSchema = Yup.object().shape({
    name: Yup.string().max(50).required(),
    description: Yup.string().max(200).required(),
    entityType: Yup.string().oneOf(['PROPOSAL', 'EXPERIMENT']).required(),
});
exports.updateWorkflowValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    name: Yup.string().max(50).required(),
    description: Yup.string().max(200).required(),
});
exports.deleteWorkflowValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
});
exports.addWorkflowStatusValidationSchema = Yup.object().shape({
    workflowId: Yup.number().required(),
    sortOrder: Yup.number().required(),
    droppableGroupId: Yup.string().required(),
    parentDroppableGroupId: Yup.string().nullable().notRequired(),
    statusId: Yup.number().required(),
    nextStatusId: Yup.number().nullable().notRequired(),
    prevStatusId: Yup.number().nullable().notRequired(),
});
exports.moveWorkflowStatusValidationSchema = Yup.object().shape({
    from: Yup.number().required(),
    to: Yup.number().required(),
    workflowId: Yup.number().required(),
});
exports.deleteWorkflowStatusValidationSchema = Yup.object().shape({
    statusId: Yup.number().required(),
    workflowId: Yup.number().required(),
});
exports.addNextStatusEventsValidationSchema = Yup.object().shape({
    workflowConnectionId: Yup.number().required(),
    nextStatusEvents: Yup.array().of(Yup.string()).required(),
});
var addStatusActionsToConnectionValidationSchema = function (emailStatusActionType, rabbitMQStatusActionType, proposalDownloadStatusActionType, statusActionTypes, otherEmailActionRecipients) {
    return Yup.object().shape({
        connectionId: Yup.number().required(),
        workflowId: Yup.number().required(),
        actions: Yup.array()
            .of(Yup.object().shape({
            actionId: Yup.number().required(),
            actionType: Yup.mixed().oneOf(statusActionTypes).required(),
            config: Yup.object().test('RecipientWithTemplate', 'Invalid values provided for action config', function (value, context) { return __awaiter(void 0, void 0, void 0, function () {
                var _a, filteredNonCompleteValues, foundOtherRecipient;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _a = context.parent.actionType;
                            switch (_a) {
                                case emailStatusActionType: return [3 /*break*/, 1];
                                case rabbitMQStatusActionType: return [3 /*break*/, 5];
                                case proposalDownloadStatusActionType: return [3 /*break*/, 6];
                            }
                            return [3 /*break*/, 7];
                        case 1:
                            if (!((_b = value.recipientsWithEmailTemplate) === null || _b === void 0 ? void 0 : _b.length)) return [3 /*break*/, 4];
                            filteredNonCompleteValues = value.recipientsWithEmailTemplate.filter(function (item) { var _a, _b; return !((_a = item.recipient) === null || _a === void 0 ? void 0 : _a.name) || !((_b = item.emailTemplate) === null || _b === void 0 ? void 0 : _b.id); });
                            if (filteredNonCompleteValues.length) {
                                return [2 /*return*/, false];
                            }
                            foundOtherRecipient = value.recipientsWithEmailTemplate.find(function (recipientWithEmailTemplate) {
                                return recipientWithEmailTemplate.recipient.name ===
                                    otherEmailActionRecipients;
                            });
                            if (!foundOtherRecipient) return [3 /*break*/, 3];
                            return [4 /*yield*/, Yup.array()
                                    .of(Yup.string().email(function (_a) {
                                    var value = _a.value;
                                    return "".concat(value, " is not a valid email");
                                }))
                                    .min(1, 'You must provide at least 1 valid email')
                                    .required()
                                    .validate(foundOtherRecipient.otherRecipientEmails)];
                        case 2:
                            _d.sent();
                            _d.label = 3;
                        case 3: return [2 /*return*/, true];
                        case 4: return [2 /*return*/, false];
                        case 5:
                            {
                                // NOTE: Value here is: RabbitMQActionConfig from the core codebase
                                if ((_c = value.exchanges) === null || _c === void 0 ? void 0 : _c.length) {
                                    return [2 /*return*/, true];
                                }
                                else {
                                    return [2 /*return*/, false];
                                }
                            }
                            _d.label = 6;
                        case 6:
                            {
                                // Proposal download action has no config
                                return [2 /*return*/, value === null || value === undefined];
                            }
                            _d.label = 7;
                        case 7: return [2 /*return*/, false];
                    }
                });
            }); }),
        }))
            .notRequired(),
    });
};
exports.addStatusActionsToConnectionValidationSchema = addStatusActionsToConnectionValidationSchema;
//# sourceMappingURL=index.js.map