import * as Yup from 'yup';
export declare const createInviteValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    note: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    claims: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    note: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    claims: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    email: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    note: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    claims: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>;
}>>>;
export declare const updateInviteValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    code: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    note: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    claims: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    code: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    note: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    claims: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    code: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    email: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    note: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    claims: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        roleIds: any;
        coProposerProposalPk: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>;
}>>>;
