import * as Yup from 'yup';
export declare const updateDataAccessUsersValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    userIds: import("yup/lib/array").RequiredArraySchema<import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>, import("yup/lib/types").AnyObject, number[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    userIds: import("yup/lib/array").RequiredArraySchema<import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>, import("yup/lib/types").AnyObject, number[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    userIds: import("yup/lib/array").RequiredArraySchema<import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>, import("yup/lib/types").AnyObject, number[]>;
}>>>;
