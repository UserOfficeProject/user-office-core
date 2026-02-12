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
exports.updateApiAccessTokenValidationSchema = exports.createApiAccessTokenValidationSchema = exports.setPageTextValidationSchema = void 0;
var Yup = __importStar(require("yup"));
var checkValidJson = function (value) {
    if (!value) {
        return false;
    }
    try {
        var parsedObject = JSON.parse(value);
        if (Object.keys(parsedObject).length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        return false;
    }
};
exports.setPageTextValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    text: Yup.string().notRequired(),
});
var createApiAccessTokenValidationSchema = function (isBackendValidation) {
    return Yup.object().shape({
        name: Yup.string().required(),
        accessPermissions: isBackendValidation
            ? Yup.string()
                .required('You must select at least one query or mutation for access')
                .test('Is valid object', 'Requires valid JSON', checkValidJson)
            : Yup.array()
                .of(Yup.string())
                .required('You must select at least one query or mutation for access'),
    });
};
exports.createApiAccessTokenValidationSchema = createApiAccessTokenValidationSchema;
var updateApiAccessTokenValidationSchema = function (isBackendValidation) {
    return Yup.object().shape({
        accessTokenId: isBackendValidation
            ? Yup.string().required()
            : Yup.string().notRequired(),
        name: Yup.string().required(),
        accessPermissions: isBackendValidation
            ? Yup.string()
                .required('You must select at least one query or mutation for access')
                .test('Is valid object', 'Requires valid JSON', checkValidJson)
            : Yup.array()
                .of(Yup.string())
                .required('You must select at least one query or mutation for access'),
    });
};
exports.updateApiAccessTokenValidationSchema = updateApiAccessTokenValidationSchema;
//# sourceMappingURL=index.js.map