"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHtmlAndCleanText = exports.isValidDate = exports.NumericalID = exports.ID = exports.atOrLaterThanMsg = exports.oneOfMsg = exports.maxCharactersMsg = exports.minCharactersMsg = exports.FAP_REVIEW_COMMENT_CHAR_LIMIT = exports.TYPE_ERR_INVALID_DATE_TIME = exports.TYPE_ERR_INVALID_DATE = exports.TZ_LESS_DATE_TIME_FORMAT = void 0;
var luxon_1 = require("luxon");
var sanitize_html_1 = __importDefault(require("sanitize-html"));
var Yup = __importStar(require("yup"));
exports.TZ_LESS_DATE_TIME_FORMAT = 'yyyy-MM-DD HH:mm:ss';
exports.TYPE_ERR_INVALID_DATE = 'Invalid Date Format';
exports.TYPE_ERR_INVALID_DATE_TIME = 'Invalid DateTime Format';
exports.FAP_REVIEW_COMMENT_CHAR_LIMIT = 6000;
var minCharactersMsg = function (_a) {
    var min = _a.min;
    return "Must be at least ".concat(min, " characters");
};
exports.minCharactersMsg = minCharactersMsg;
var maxCharactersMsg = function (_a) {
    var max = _a.max;
    return "Must be at most ".concat(max, " characters");
};
exports.maxCharactersMsg = maxCharactersMsg;
var oneOfMsg = function (types) {
    return "Must be one of the following values: ".concat(Array.isArray(types) ? types.join(', ') : Object.values(types).join(', '));
};
exports.oneOfMsg = oneOfMsg;
var atOrLaterThanMsg = function (time) {
    return "Must be at or later than ".concat(time);
};
exports.atOrLaterThanMsg = atOrLaterThanMsg;
exports.ID = Yup.string()
    .min(1, exports.minCharactersMsg)
    .max(15, exports.maxCharactersMsg)
    .typeError('Invalid ID');
exports.NumericalID = exports.ID.matches(/^[\d]+$/, 'Invalid NumericalID').typeError('Invalid NumericalID');
var isValidDate = function (d) { return luxon_1.DateTime.fromJSDate(d).isValid; };
exports.isValidDate = isValidDate;
// options to remove all html tags and get only text characters count
var sanitizerValidationConfig = {
    allowedTags: [],
    disallowedTagsMode: 'discard',
    allowedAttributes: {},
    allowedStyles: {},
    selfClosing: [],
    allowedSchemes: [],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [],
};
var sanitizeHtmlAndCleanText = function (htmlString) {
    var sanitized = (0, sanitize_html_1.default)(htmlString, sanitizerValidationConfig);
    /**
     * NOTE:
     * 1. Remove all newline characters from counting.
     * 2. Replace the surrogate pairs(emojis) with _ and count them as one character instead of two ("😀".length = 2).
     *    https://stackoverflow.com/questions/31986614/what-is-a-surrogate-pair
     */
    var sanitizedCleaned = sanitized
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_')
        .trim();
    return sanitizedCleaned;
};
exports.sanitizeHtmlAndCleanText = sanitizeHtmlAndCleanText;
//# sourceMappingURL=util.js.map