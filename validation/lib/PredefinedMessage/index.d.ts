import * as Yup from 'yup';
export declare const createPredefinedMessageValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    message: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    key: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    message: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    key: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    message: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    key: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updatePredefinedMessageValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    message: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    key: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    message: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    key: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    message: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    key: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
