import Skeleton from '@mui/material/Skeleton';
import type { IAllProps } from '@tinymce/tinymce-react';
import React, { Suspense } from 'react';

import { lazy } from 'utils/lazy';

const TinyEditorImpl = lazy(() => import('./TinyEditorImpl'));

const TinyEditor = (props: IAllProps) => (
  <Suspense
    fallback={
      <Skeleton
        variant="rectangular"
        height={props.init?.height ?? 300}
        data-cy="tiny-editor-loading"
      />
    }
  >
    <TinyEditorImpl {...props} />
  </Suspense>
);

export default TinyEditor;
