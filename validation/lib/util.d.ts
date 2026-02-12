import * as Yup from 'yup';
export declare const TZ_LESS_DATE_TIME_FORMAT = "yyyy-MM-DD HH:mm:ss";
export declare const TYPE_ERR_INVALID_DATE = "Invalid Date Format";
export declare const TYPE_ERR_INVALID_DATE_TIME = "Invalid DateTime Format";
export declare const FAP_REVIEW_COMMENT_CHAR_LIMIT = 6000;
export declare const minCharactersMsg: ({ min }: {
    min: number;
}) => string;
export declare const maxCharactersMsg: ({ max }: {
    max: number;
}) => string;
export declare const oneOfMsg: (types: Record<string, string> | Array<string | number>) => string;
export declare const atOrLaterThanMsg: (time: string) => string;
export declare const ID: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
export declare const NumericalID: Yup.StringSchema<string, import("yup/lib/types").AnyObject, string>;
export declare const isValidDate: (d: Date) => boolean;
export declare const sanitizeHtmlAndCleanText: (htmlString: string) => string;
