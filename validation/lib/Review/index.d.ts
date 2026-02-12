import * as Yup from 'yup';
export declare const proposalGradeValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    comment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    grade: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    comment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    grade: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    comment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    grade: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const proposalTechnicalReviewValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    status: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    timeAllocation: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    comment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    publicComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    status: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    timeAllocation: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    comment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    publicComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    status: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    timeAllocation: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    comment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    publicComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>>;
export declare const removeUserForReviewValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    reviewID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    reviewID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    reviewID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const addUserForReviewValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    userID: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const submitProposalReviewValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    reviewId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    reviewId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    reviewId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
