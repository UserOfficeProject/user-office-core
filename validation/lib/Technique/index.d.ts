import * as Yup from 'yup';
export declare const createTechniqueValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateTechniqueValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
}>>>;
export declare const deleteTechniqueValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const assignInstrumentsToTechniqueValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const removeInstrumentsFromTechniqueValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    instrumentIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const assignScientistsToTechniqueValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const removeScientistFromTechniqueValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    techniqueId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
