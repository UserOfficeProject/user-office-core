import * as Yup from 'yup';
export declare const createCallValidationSchemas: (Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    startCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalWorkflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    startCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalWorkflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    startCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalWorkflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>> | Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>> | Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    cycleComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    cycleComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    cycleComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>)[];
export declare const updateCallValidationSchemas: (Yup.ObjectSchema<{
    [x: string]: Yup.AnySchema | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
} & {
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    startCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalWorkflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
} & import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<{
    [x: string]: Yup.AnySchema | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
} & {
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    startCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalWorkflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
} & import("yup/lib/object").ObjectShape>, import("yup/lib/object").AssertsShape<{
    [x: string]: Yup.AnySchema | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
} & {
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    startCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCall: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    proposalWorkflowId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
} & import("yup/lib/object").ObjectShape>> | Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endReview: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>> | Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    cycleComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    cycleComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    startNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endNotify: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    startCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    endCycle: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    cycleComment: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>)[];
export declare const updateCallValidationBackendSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: Yup.AnySchema | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
    shortCode: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    startCall: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCall: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    startReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    startNotify: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endNotify: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    startCycle: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCycle: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    cycleComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: Yup.AnySchema | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
    shortCode: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    startCall: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCall: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    startReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    startNotify: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endNotify: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    startCycle: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCycle: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    cycleComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: Yup.AnySchema | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
    shortCode: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    startCall: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCall: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCallInternal: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    templateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentWorkflowId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    proposalPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    experimentPdfTemplateId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    startReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    startFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endFapReview: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    surveyComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    startNotify: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endNotify: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    startCycle: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    endCycle: Yup.DateSchema<Date, import("yup/lib/types").AnyObject, Date>;
    cycleComment: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>>;
export declare const assignInstrumentsToCallValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
}>>>;
export declare const removeAssignedInstrumentFromCallValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateFapToCallInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
}>>>;
