import * as Yup from 'yup';
export declare const createInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    managerUserId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    managerUserId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    managerUserId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const updateInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    managerUserId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    managerUserId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    name: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    shortCode: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    description: import("yup/lib/string").RequiredStringSchema<string, import("yup/lib/types").AnyObject>;
    managerUserId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const deleteInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    id: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const assignProposalsToInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposals: import("yup/lib/array").RequiredArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>[]>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposals: import("yup/lib/array").RequiredArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>[]>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposals: import("yup/lib/array").RequiredArraySchema<Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
        id: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
        callId: Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>;
    }>>[]>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const removeProposalFromInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    proposalPk: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const assignScientistsToInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistIds: import("yup/lib/array").RequiredArraySchema<Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number>, import("yup/lib/types").AnyObject, number[]>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const removeScientistFromInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    scientistId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const setAvailabilityTimeOnInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    availabilityTime: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    availabilityTime: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    availabilityTime: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
export declare const submitInstrumentValidationSchema: Yup.ObjectSchema<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<import("yup/lib/object").ObjectShape, {
    callId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    instrumentId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
    fapId: import("yup/lib/number").RequiredNumberSchema<number, import("yup/lib/types").AnyObject>;
}>>>;
