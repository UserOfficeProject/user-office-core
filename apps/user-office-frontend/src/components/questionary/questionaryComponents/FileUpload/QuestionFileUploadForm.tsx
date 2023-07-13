import ListItemText from '@mui/material/ListItemText';
import { Field } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-mui';
import React from 'react';
import * as Yup from 'yup';

import MultiMenuItem from 'components/common/MultiMenuItem';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { FileUploadConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionFileUploadForm = (props: QuestionFormProps) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const availableFileTypeOptions = [
    { label: '.pdf', value: '.pdf' },
    { label: '.doc', value: '.doc' },
    { label: '.docx', value: '.docx' },
    { label: 'audio/*', value: 'audio/*' },
    { label: 'video/*', value: 'video/*' },
    { label: 'image/*', value: 'image/*' },
  ];

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required form'),
        config: Yup.object({
          file_type: Yup.array().required().min(1, 'File type is required'),
          small_label: Yup.string(),
          max_files: Yup.number().min(
            0,
            'Value must be greater than or equal to 0'
          ),
          pdf_page_limit: Yup.number().min(
            0,
            'Value must be greater than or equal to 0'
          ),
        }),
      })}
    >
      {(formikProps) => {
        const config = formikProps.values.config as FileUploadConfig;
        const fileType = config.file_type;

        return (
          <>
            <Field
              name="naturalKey"
              id="Key-Input"
              label="Key"
              type="text"
              component={TextField}
              fullWidth
              inputProps={{ 'data-cy': 'natural_key' }}
            />
            <Field
              name="question"
              id="Question-Input"
              label="Question"
              type="text"
              component={TextField}
              fullWidth
              inputProps={{ 'data-cy': 'question' }}
            />

            <TitledContainer label="Options">
              <Field
                name="config.small_label"
                label="Helper text"
                id="Helper-Text-Input"
                placeholder="(e.g. only PDF accepted)"
                type="text"
                component={TextField}
                fullWidth
                data-cy="small_label"
              />
            </TitledContainer>

            <TitledContainer label="Constraints">
              <Field
                name="config.required"
                id="Is-Required-Input"
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Is required',
                }}
                data-cy="required"
              />
              <Field
                id="fileType"
                name="config.file_type"
                label="Accepted file types"
                multiple
                onClose={(event: React.SyntheticEvent) => {
                  event.preventDefault();
                }}
                renderValue={(selected?: string[] | string) => {
                  if (typeof selected === 'string') {
                    return selected;
                  }

                  return selected?.join(', ') || '';
                }}
                formControl={{
                  fullWidth: true,
                  required: true,
                  margin: 'normal',
                }}
                inputProps={{
                  id: 'fileType',
                }}
                component={Select}
                data-cy="file_type"
                labelId="fileType-label"
              >
                {availableFileTypeOptions.map(({ value, label }) => {
                  return (
                    <MultiMenuItem value={value} key={value}>
                      <ListItemText primary={label} />
                    </MultiMenuItem>
                  );
                })}
              </Field>
              <Field
                name="config.max_files"
                id="Max-number-Input"
                label="Max number of files"
                type="number"
                component={TextField}
                fullWidth
                required
                InputProps={{ inputProps: { min: 0 } }}
                data-cy="max_files"
                helperText="Use 0 for unlimited files"
              />
              {fileType.includes('.pdf') && (
                <Field
                  name="config.pdf_page_limit"
                  id="Pdf-page-limit-Input"
                  label="Max number of PDF pages"
                  type="number"
                  component={TextField}
                  fullWidth
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                  data-cy="pdf_page_limit"
                  helperText="Use 0 for unlimited pages"
                />
              )}
            </TitledContainer>
          </>
        );
      }}
    </QuestionFormShell>
  );
};
