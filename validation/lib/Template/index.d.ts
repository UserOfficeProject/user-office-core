import * as Yup from 'yup';
export declare const createTemplateValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>>;
export declare const cloneTemplateValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const deleteTemplateValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const createTopicValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateTopicValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    isEnabled: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    isEnabled: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    title: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    isEnabled: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>>;
export declare const deleteTopicValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const createQuestionValidationSchema: (dataType: any) => Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    dataType: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    dataType: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    dataType: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>>;
export declare const updateQuestionValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    naturalKey: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    question: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    config: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    naturalKey: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    question: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    config: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    naturalKey: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    question: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    config: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
}>>>;
export declare const deleteQuestionValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateQuestionTemplateRelationValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    sortOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    config: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    dependency: import("yup/lib/object").OptionalObjectSchema<import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").ObjectShape>>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    sortOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    config: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    dependency: import("yup/lib/object").OptionalObjectSchema<import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").ObjectShape>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    sortOrder: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    config: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    dependency: import("yup/lib/object").OptionalObjectSchema<import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").ObjectShape>>;
}>>>;
export declare const deleteQuestionTemplateRelationValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateTopicOrderValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    topicOrder: Yup.ArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[], number[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    topicOrder: Yup.ArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[], number[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    topicOrder: Yup.ArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[], number[]>;
}>>>;
export declare const updateQuestionsTopicRelsValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    questionIds: import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    questionIds: import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    questionIds: import("yup/lib/array").RequiredArraySchema<Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>, import("yup/lib/types").AnyObject, string[]>;
}>>>;
export declare const updateTemplateValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    description: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    isArchived: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    description: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    isArchived: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    description: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
    isArchived: Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean>;
}>>>;
export declare const createQuestionTemplateRelationValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    templateId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    questionId: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    sortOrder: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    topicId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
