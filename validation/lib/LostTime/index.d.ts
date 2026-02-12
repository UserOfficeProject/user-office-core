import * as Yup from 'yup';
export declare const bulkUpsertLostTimeValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalBookingId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    lostTimes: Yup.ArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>[], import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>[]>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalBookingId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    lostTimes: Yup.ArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>[], import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>[]>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalBookingId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    lostTimes: Yup.ArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>[], import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
        startsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
        endsAt: import("yup/lib/date").RequiredDateSchema<Date, import("yup/lib/types").AnyObject>;
    }>>[]>;
}>>>;
