import * as Yup from 'yup';
export declare const createProposalValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateProposalValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    abstract: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    answers: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    topicsCompleted: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    users: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    proposerId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    partialSave: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    abstract: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    answers: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    topicsCompleted: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    users: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    proposerId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    partialSave: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    abstract: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    answers: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    topicsCompleted: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    users: Yup.ArraySchema<Yup.AnySchema, import("yup/lib/types").AnyObject, any[], any[]>;
    proposerId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    partialSave: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>>;
export declare const submitProposalValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const deleteProposalValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const proposalNotifyValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const administrationProposalValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    finalStatus: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    commentForUser: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    commentForManagement: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    managementTimeAllocations: import("yup/lib/array").RequiredArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>[]>;
    managementDecisionSubmitted: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    finalStatus: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    commentForUser: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    commentForManagement: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    managementTimeAllocations: import("yup/lib/array").RequiredArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>[]>;
    managementDecisionSubmitted: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    finalStatus: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    commentForUser: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    commentForManagement: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    managementTimeAllocations: import("yup/lib/array").RequiredArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
        value: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>[]>;
    managementDecisionSubmitted: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>>;
export declare const generalInfoUpdateValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    abstract: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    abstract: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    title: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    abstract: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const createProposalScientistCommentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    comment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    comment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    comment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateProposalScientistCommentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    commentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    comment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    commentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    comment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    commentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    comment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const deleteProposalScientistCommentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    commentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    commentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    commentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
