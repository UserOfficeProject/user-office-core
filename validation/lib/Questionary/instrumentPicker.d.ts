import * as Yup from 'yup';
import { AnyObject } from 'yup/lib/types';
export declare const instrumentPickerValidationSchema: (field: any) => Yup.ObjectSchema<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}>, import("yup/lib/object").AssertsShape<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}>> | Yup.ArraySchema<Yup.ObjectSchema<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}>, import("yup/lib/object").AssertsShape<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}>>, AnyObject, import("yup/lib/object").TypeOfShape<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}>[], import("yup/lib/object").AssertsShape<{
    instrumentId: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
    timeRequested: Yup.BaseSchema<string, import("yup/lib/object").AnyObject, string>;
}>[]>;
