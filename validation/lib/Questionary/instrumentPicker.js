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
exports.instrumentPickerValidationSchema = void 0;
var Yup = __importStar(require("yup"));
var instrumentPickerValidationSchema = function (field) {
    var config = field.config;
    var schema;
    if (config.isMultipleSelect) {
        schema = Yup.array().of(Yup.object()
            .shape({
            instrumentId: Yup.string(),
            timeRequested: Yup.string(),
        })
            .nullable());
        if (config.required) {
            schema = schema.required().min(1);
        }
        if (config.requestTime) {
            schema = Yup.array()
                .of(Yup.object().shape({
                instrumentId: Yup.string(),
                timeRequested: Yup.string()
                    .required('Request time field is required')
                    .test('is-number?', 'Requested time is not valid', function (value) {
                    var timeValue = Number(value);
                    if (isNaN(timeValue) ||
                        timeValue <= 0 ||
                        !Number.isInteger(timeValue))
                        return false;
                    else
                        return true;
                }),
            }))
                .required()
                .min(1);
        }
    }
    else {
        schema = Yup.object()
            .shape({
            instrumentId: Yup.string(),
            timeRequested: Yup.string(),
        })
            .nullable();
        if (config.required) {
            schema = schema.required();
        }
        if (config.requestTime) {
            schema = Yup.object()
                .shape({
                instrumentId: Yup.string(),
                timeRequested: Yup.string()
                    .required('Request time field is required')
                    .test('is-number?', 'Requested time is not valid', function (value) {
                    var timeValue = Number(value);
                    if (isNaN(timeValue) ||
                        timeValue <= 0 ||
                        !Number.isInteger(timeValue))
                        return false;
                    else
                        return true;
                }),
            })
                .nullable()
                .required('Field is required');
        }
    }
    return schema;
};
exports.instrumentPickerValidationSchema = instrumentPickerValidationSchema;
//# sourceMappingURL=instrumentPicker.js.map