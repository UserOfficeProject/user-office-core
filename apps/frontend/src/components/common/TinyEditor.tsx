// It is important to import the Editor which accepts plugins.
import 'tinymce/tinymce';
import 'tinymce/models/dom/model';
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

const TinyEditor = (props: IAllProps) => (
  <Editor
    {...props}
    // @ts-expect-error Tinymce types package is not updated and license_key has a wrong type
    init={{ license_key: 'gpl', promotion: false, height: 300, ...props.init }}
  />
);

export default TinyEditor;
