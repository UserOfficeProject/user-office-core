import * as Yup from 'yup';
import { AnyObject } from 'yup/lib/types';
export declare const techniquePickerValidationSchema: (field: any) => Yup.NumberSchema<number, AnyObject, number> | Yup.ArraySchema<Yup.NumberSchema<number, AnyObject, number>, AnyObject, number[], number[]>;
