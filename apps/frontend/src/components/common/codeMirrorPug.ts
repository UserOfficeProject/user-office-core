import { StreamLanguage } from '@codemirror/language';
import { pug } from '@codemirror/legacy-modes/mode/pug';

export const pugLanguage = StreamLanguage.define(pug);
