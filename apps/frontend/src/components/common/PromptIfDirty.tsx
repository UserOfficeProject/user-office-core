import { useFormikContext } from 'formik';
import * as React from 'react';

import { Prompt } from 'hooks/common/usePrompt';

export default function PromptIfDirty({ isDirty }: { isDirty?: boolean }) {
  const formik = useFormikContext();

  return (
    <Prompt
      when={
        (isDirty !== undefined ? isDirty : formik.dirty) &&
        formik.submitCount === 0
      }
      message="Changes you recently made in this tab will be lost! Are you sure?"
    />
  );
}
