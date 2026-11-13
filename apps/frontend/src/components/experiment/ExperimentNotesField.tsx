import InputLabel from '@mui/material/InputLabel';
import { Formik, Form } from 'formik';
import React from 'react';

import Editor from 'components/common/TinyEditor';
import { GetExperimentQuery } from 'generated/sdk';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

type Experiment = GetExperimentQuery['experiment'] | null;
interface ExperimentDetailsTableProps extends WithConfirmProps {
  experiment: Experiment;
}
export const ExperimentNotesField = (params: ExperimentDetailsTableProps) => {
  const initialData = {
    notes: params?.experiment?.notes,
  };

  return (
    <div>
      <InputLabel shrink margin="dense">
        notes
      </InputLabel>

      <Formik
        initialValues={initialData}
        //onSubmit={async (values): Promise<void> => {
        onSubmit={async (): Promise<void> => {
          console.log('submitted');
        }}
      >
        {({ setFieldValue }): JSX.Element => (
          //{({ isSubmitting, setFieldValue, values }): JSX.Element => (
          <Form>
            <Editor
              id="commentForManagement"
              initialValue={params.experiment?.notes ?? ''}
              init={{
                skin: false,
                content_css: false,
                plugins: ['link', 'preview', 'code', 'charmap', 'wordcount'],
                toolbar: 'bold italic',
                branding: false,
              }}
              onEditorChange={(content, editor) => {
                const isStartContentDifferentThanCurrent =
                  editor.startContent !== editor.contentDocument.body.innerHTML;

                if (isStartContentDifferentThanCurrent || editor.isDirty()) {
                  setFieldValue('notes', content);
                }
              }}
              // disabled={shouldDisableForm(isSubmitting)}
            />
            <button type="submit">Save</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default withConfirm(ExperimentNotesField);
