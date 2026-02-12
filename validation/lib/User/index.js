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
exports.userPasswordFieldValidationSchema = exports.userPasswordFieldBEValidationSchema = exports.updatePasswordValidationSchema = exports.addUserRoleValidationSchema = exports.resetPasswordByEmailValidationSchema = exports.getTokenForUserValidationSchema = exports.signInValidationSchema = exports.updateUserRolesValidationSchema = exports.updateUserValidationBackendSchema = exports.updateUserValidationSchema = exports.createUserValidationSchema = exports.createUserByEmailInviteValidationSchema = exports.deleteUserValidationSchema = void 0;
var Yup = __importStar(require("yup"));
exports.deleteUserValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
});
var createUserByEmailInviteValidationSchema = function (UserRole) {
    return Yup.object().shape({
        firstname: Yup.string().required(),
        lastname: Yup.string().required(),
        email: Yup.string().email(),
        userRole: Yup.string().oneOf(Object.keys(UserRole)).required(),
    });
};
exports.createUserByEmailInviteValidationSchema = createUserByEmailInviteValidationSchema;
var phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;
var passwordValidationSchema = Yup.string()
    .required('Password must contain at least 8 characters (including upper case, lower case and numbers)')
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/, 'Password must contain at least 8 characters (including upper case, lower case and numbers)');
exports.createUserValidationSchema = Yup.object().shape({
    firstname: Yup.string().required().min(2).max(50),
    preferredname: Yup.string().notRequired().max(50),
    lastname: Yup.string().required().min(2).max(50),
    user_title: Yup.string().required(),
    email: Yup.string().email().required(),
    password: passwordValidationSchema,
    confirmPassword: Yup.string()
        .when('password', {
        is: function (val) { return (val && val.length > 0 ? true : false); },
        then: Yup.string().oneOf([Yup.ref('password')], 'Confirm password does not match password'),
    })
        .notRequired(),
    institutionId: Yup.number().required(),
});
exports.updateUserValidationSchema = Yup.object().shape({
    firstname: Yup.string().min(2).max(50).required(),
    preferredname: Yup.string().notRequired().max(50),
    lastname: Yup.string().min(2).max(50).required(),
    user_title: Yup.string().required(),
    email: Yup.string().email().required(),
    institutionId: Yup.number().required(),
});
exports.updateUserValidationBackendSchema = Yup.object().shape({
    id: Yup.number().required(),
    firstname: Yup.string().min(2).max(50).notRequired(),
    preferredname: Yup.string().notRequired().max(50),
    lastname: Yup.string().min(2).max(50).notRequired(),
    user_title: Yup.string().notRequired(),
    email: Yup.string().email().notRequired(),
    institutionId: Yup.number().notRequired(),
});
exports.updateUserRolesValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    roles: Yup.array().of(Yup.number()).required(),
});
exports.signInValidationSchema = Yup.object().shape({
    email: Yup.string().email(),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .max(25, 'Password must be at most 25 characters')
        .required('Password must be at least 8 characters'),
});
exports.getTokenForUserValidationSchema = Yup.object().shape({
    userId: Yup.number().required(),
});
exports.resetPasswordByEmailValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email')
        .required('Please enter an email'),
});
exports.addUserRoleValidationSchema = Yup.object().shape({
    userID: Yup.number().required(),
    roleID: Yup.number().required(),
});
exports.updatePasswordValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    password: passwordValidationSchema,
});
exports.userPasswordFieldBEValidationSchema = Yup.object().shape({
    password: passwordValidationSchema,
    token: Yup.string().required(),
});
exports.userPasswordFieldValidationSchema = Yup.object().shape({
    password: passwordValidationSchema,
    confirmPassword: Yup.string()
        .when('password', {
        is: function (val) { return (val && val.length > 0 ? true : false); },
        then: Yup.string().oneOf([Yup.ref('password')], 'Confirm password does not match password'),
    })
        .notRequired(),
});
//# sourceMappingURL=index.js.map