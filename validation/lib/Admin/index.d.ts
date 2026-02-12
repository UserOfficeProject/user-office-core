import * as Yup from 'yup';
export declare const setPageTextValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    text: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    text: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    text: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>>;
export declare const createApiAccessTokenValidationSchema: (isBackendValidation: boolean) => Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    accessPermissions: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject> | import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    accessPermissions: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject> | import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    accessPermissions: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject> | import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>>;
export declare const updateApiAccessTokenValidationSchema: (isBackendValidation: boolean) => Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    accessTokenId: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    accessPermissions: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject> | import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    accessTokenId: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    accessPermissions: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject> | import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    accessTokenId: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    accessPermissions: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject> | import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>>;
