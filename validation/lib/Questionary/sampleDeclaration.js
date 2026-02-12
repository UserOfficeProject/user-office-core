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
exports.sampleDeclarationValidationSchema = void 0;
var Yup = __importStar(require("yup"));
var sampleDeclarationValidationSchema = function (field) {
    var config = field.config;
    var schema = Yup.array().of(Yup.object());
    if (config.minEntries) {
        schema = schema.min(config.minEntries, "Please add at least ".concat(config.minEntries, " sample(s)"));
    }
    if (config.maxEntries) {
        schema = schema.max(config.maxEntries, "Please add at most ".concat(config.maxEntries, " sample(s)"));
    }
    schema = schema.test('allSamplesCompleted', 'All samples must be completed', function (value) { var _a; return (_a = value === null || value === void 0 ? void 0 : value.every(function (sample) { return sample === null || sample === void 0 ? void 0 : sample.questionary.isCompleted; })) !== null && _a !== void 0 ? _a : false; });
    return schema;
};
exports.sampleDeclarationValidationSchema = sampleDeclarationValidationSchema;
//# sourceMappingURL=sampleDeclaration.js.map