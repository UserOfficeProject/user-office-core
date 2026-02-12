import * as Yup from 'yup';
export declare const createWorkflowValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    entityType: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    entityType: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    entityType: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateWorkflowValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const deleteWorkflowValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const addWorkflowStatusValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    droppableGroupId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    parentDroppableGroupId: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    statusId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    nextStatusId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    prevStatusId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    droppableGroupId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    parentDroppableGroupId: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    statusId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    nextStatusId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    prevStatusId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    droppableGroupId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    parentDroppableGroupId: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    statusId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    nextStatusId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    prevStatusId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>>;
export declare const moveWorkflowStatusValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    from: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    to: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    from: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    to: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    from: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    to: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const deleteWorkflowStatusValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    statusId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    statusId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    statusId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const addNextStatusEventsValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    workflowConnectionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    nextStatusEvents: import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    workflowConnectionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    nextStatusEvents: import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    workflowConnectionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    nextStatusEvents: import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>>;
export declare const addStatusActionsToConnectionValidationSchema: <T, U>(emailStatusActionType: T, rabbitMQStatusActionType: T, proposalDownloadStatusActionType: T, statusActionTypes: T[], otherEmailActionRecipients: U) => Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    connectionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    actions: any;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    connectionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    actions: any;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    connectionId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    workflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    actions: any;
}>>>;
