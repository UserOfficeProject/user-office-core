import { Collapse } from '@material-ui/core';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { Fragment, useState } from 'react';
import { TextInputConfig } from '../../../../generated/sdk';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import FormikUICustomEditor from '../../../common/FormikUICustomEditor';
import TitledContainer from '../../../common/TitledContainer';

export const TextInputConfigFragment = (props: { config: TextInputConfig }) => {
  const [isRichQuestion, setIsRichQuestion] = useState<boolean>(
    props.config.isHtmlQuestion
  );
  return (
    <Fragment>
      <Field
        label="Enable rich text question"
        name="question.config.isHtmlQuestion"
        component={FormikUICustomCheckbox}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setIsRichQuestion(event.target.checked);
        }}
        checked={isRichQuestion}
      />
      <Collapse in={isRichQuestion}>
        <Field
          visible={isRichQuestion}
          name="question.config.htmlQuestion"
          type="text"
          component={FormikUICustomEditor}
          margin="normal"
          fullWidth
          init={{
            skin: false,
            content_css: false,
            plugins: ['link', 'preview', 'image', 'code'],
            toolbar: 'bold italic',
            branding: false,
          }}
          data-cy="htmlQuestion"
        />
      </Collapse>
      <TitledContainer label="Constraints">
        <Field
          name="question.config.required"
          checked={props.config.required}
          component={FormikUICustomCheckbox}
          label="Is required"
          margin="normal"
          fullWidth
          data-cy="required"
        />

        <Field
          name="question.config.min"
          label="Min"
          type="text"
          component={TextField}
          margin="normal"
          fullWidth
          data-cy="min"
        />

        <Field
          name="question.config.max"
          label="Max"
          type="text"
          component={TextField}
          margin="normal"
          fullWidth
          data-cy="max"
        />
      </TitledContainer>
      <TitledContainer label="Options">
        <Field
          name="question.config.placeholder"
          label="Placeholder text"
          type="text"
          component={TextField}
          margin="normal"
          fullWidth
          data-cy="placeholder"
        />

        <Field
          name="question.config.multiline"
          checked={props.config.multiline}
          component={FormikUICustomCheckbox}
          label="Multiple line"
          margin="normal"
          fullWidth
          data-cy="multiline"
        />
      </TitledContainer>
    </Fragment>
  );
};
