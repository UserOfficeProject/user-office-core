import * as Yup from 'yup';
export declare const createFapValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    code: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    numberRatingsRequired: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    code: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    numberRatingsRequired: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    code: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    numberRatingsRequired: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateFapValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    code: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    numberRatingsRequired: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    code: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    numberRatingsRequired: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    code: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    numberRatingsRequired: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const assignFapChairOrSecretaryValidationSchema: (UserRole: any) => Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    assignChairOrSecretaryToFapInput: any;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    assignChairOrSecretaryToFapInput: any;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    assignChairOrSecretaryToFapInput: any;
}>>>;
export declare const assignFapMembersValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    memberIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    memberIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    memberIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const removeFapMemberValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    memberId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    memberId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    memberId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const assignProposalToFapValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const assignFapMemberToProposalValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    memberId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    memberId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    memberId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateTimeAllocationValidationSchema: import("yup/lib/object").OptionalObjectSchema<{
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapTimeAllocation: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<{
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapTimeAllocation: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>;
export declare const saveFapMeetingDecisionValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    commentForUser: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    commentForManagement: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    recommendation: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    rankOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    submitted: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    commentForUser: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    commentForManagement: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    recommendation: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    rankOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    submitted: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    commentForUser: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    commentForManagement: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    recommendation: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    rankOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    submitted: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>>;
export declare const overwriteFapMeetingDecisionRankingValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    rankOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    rankOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    rankOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>>;
