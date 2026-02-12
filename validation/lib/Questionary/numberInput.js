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
exports.numberInputQuestionValidationSchema = void 0;
var Yup = __importStar(require("yup"));
var numberInputQuestionValidationSchema = function (field, NumberValueConstraint) {
    var _a;
    var config = field.config;
    var valueScheme = Yup.number().transform(function (value) {
        return isNaN(value) ? undefined : value;
    });
    if (config.required) {
        valueScheme = valueScheme.required('This is a required field');
    }
    switch (config.numberValueConstraint) {
        case NumberValueConstraint.ONLY_NEGATIVE:
            valueScheme = valueScheme.negative('Value must be a negative number');
            break;
        case NumberValueConstraint.ONLY_POSITIVE:
            valueScheme = valueScheme.positive('Value must be a positive number');
            break;
        case NumberValueConstraint.ONLY_NEGATIVE_INTEGER:
            valueScheme = valueScheme
                .integer('Value must be negative whole number')
                .negative('Value must be negative whole number');
            break;
        case NumberValueConstraint.ONLY_POSITIVE_INTEGER:
            valueScheme = valueScheme
                .integer('Value must be positive whole number')
                .positive('Value must be a positive whole number');
            break;
    }
    var unitScheme = Yup.object().nullable();
    // available units are specified and the field is required
    if (((_a = config.units) === null || _a === void 0 ? void 0 : _a.length) && config.required) {
        unitScheme = unitScheme.required('Please specify unit');
    }
    return Yup.object().shape({
        value: valueScheme,
        unit: unitScheme,
    });
};
exports.numberInputQuestionValidationSchema = numberInputQuestionValidationSchema;
//# sourceMappingURL=numberInput.js.map