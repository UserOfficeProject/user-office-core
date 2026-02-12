import * as Yup from 'yup';
export declare const intervalQuestionValidationSchema: (field: any, NumberValueConstraint: any) => Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    min: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    max: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    unit: import("yup/lib/object").OptionalObjectSchema<import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").ObjectShape>>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    min: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    max: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    unit: import("yup/lib/object").OptionalObjectSchema<import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").ObjectShape>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    min: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    max: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    unit: import("yup/lib/object").OptionalObjectSchema<import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").ObjectShape>>;
}>>>;
