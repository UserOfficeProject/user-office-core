import ListItemText from '@mui/material/ListItemText';
import { Field } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import MultiMenuItem from 'components/common/MultiMenuItem';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationFileUploadForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  const availableFileTypeOptions = [
    { label: '.pdf', value: '.pdf' },
    { label: '.doc', value: '.doc' },
    { label: '.docx', value: '.docx' },
    { label: 'audio/*', value: 'audio/*' },
    { label: 'video/*', value: 'video/*' },
    { label: 'image/*', value: 'image/*' },
  ];

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            file_type: Yup.array().required().min(1, 'File type is required'),
            small_label: Yup.string(),
            max_files: Yup.number().min(
              0,
              'Value must be grater than or equal to 0'
            ),
          }),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <TitledContainer label="Options">
            <Field
              name="config.small_label"
              label="Helper text"
              id="helper-text-id"
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
              // NOTE: Because of some weird value handling when escape button is pressed to close the select options we need to preventDefault.
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
              label="Max number of files"
              id="Max-files-id"
              type="number"
              component={TextField}
              fullWidth
              required
              InputProps={{ inputProps: { min: 0 } }}
              data-cy="max_files"
              helperText="Use 0 for unlimited files"
            />
          </TitledContainer>

          <TitledContainer label="Dependencies">
            <QuestionDependencyList
              form={formikProps}
              template={props.template}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
