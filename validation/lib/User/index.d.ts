import * as Yup from 'yup';
export declare const deleteUserValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const createUserByEmailInviteValidationSchema: (UserRole: any) => Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    userRole: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    userRole: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    userRole: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const createUserValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    user_title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    confirmPassword: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    institutionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    user_title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    confirmPassword: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    institutionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    user_title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    confirmPassword: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    institutionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateUserValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    user_title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    institutionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    user_title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    institutionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    firstname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    user_title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    institutionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateUserValidationBackendSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    firstname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    user_title: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    institutionId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    firstname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    user_title: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    institutionId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    firstname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    preferredname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    lastname: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    user_title: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    institutionId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>>;
export declare const updateUserRolesValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    roles: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    roles: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    roles: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
}>>>;
export declare const signInValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const getTokenForUserValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const resetPasswordByEmailValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const addUserRoleValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    roleID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    roleID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    roleID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updatePasswordValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const userPasswordFieldBEValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    token: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    token: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    token: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const userPasswordFieldValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    confirmPassword: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    confirmPassword: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    password: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    confirmPassword: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>>;
