import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { Fragment } from 'react';
import { FileUploadConfig } from '../../../generated/sdk';
import FormikUICustomSelect from '../../common/FormikUICustomSelect';
import TitledContainer from '../../common/TitledContainer';

export const FileUploadConfigFragment = (props: {
  config: FileUploadConfig;
}) => {
  return (
    <Fragment>
      <TitledContainer label="Options">
        <Field
          name="question.config.small_label"
          label="Helper text"
          placeholder="(e.g. only PDF accepted)"
          type="text"
          component={TextField}
          margin="normal"
          fullWidth
          data-cy="small_label"
        />
      </TitledContainer>

      <TitledContainer label="Constraints">
        <Field
          name="question.config.file_type"
          label="Accepted file types (leave empty for any)"
          id="fileType"
          component={FormikUICustomSelect}
          availableOptions={[
            '.pdf',
            '.doc',
            '.docx',
            'audio/*',
            'video/*',
            'image/*',
          ]}
          margin="normal"
          fullWidth
          data-cy="file_type"
        />
        <Field
          name="question.config.max_files"
          label="Max number of files"
          type="text"
          component={TextField}
          margin="normal"
          fullWidth
          data-cy="max_files"
        />
      </TitledContainer>
    </Fragment>
  );
};
