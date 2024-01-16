// It is important to import the Editor which accepts plugins.
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/plugins/link';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/image';
import 'tinymce/plugins/code';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/wordcount';
import 'tinymce/icons/default';

import { Editor, IAllProps } from '@tinymce/tinymce-react';
import React from 'react';

const TinyEditor = (props: IAllProps) => <Editor {...props} />;

export default TinyEditor;
