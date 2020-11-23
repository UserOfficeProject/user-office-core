import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import { Field } from 'formik';
import { Select, TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { Question, TemplateCategoryId } from 'generated/sdk';
import { useTemplateCategories } from 'hooks/template/useTemplateCategories';
import { useTemplates } from 'hooks/template/useTemplates';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionSubtemplateForm: FormComponent<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryId>(
    TemplateCategoryId.SAMPLE_DECLARATION
  );
  const { categories } = useTemplateCategories();
  const { templates } = useTemplates(false, selectedCategory);

  return (
    <QuestionFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          templateId: Yup.number().required('Template is required'),
          templateCategory: Yup.string().required('Category is required'),
          addEntryButtonLabel: Yup.string(),
          maxEntries: Yup.number().nullable(),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />

          <Field
            name="question"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Options">
            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="config.templateCategory">
                Template category
              </InputLabel>
              <Field
                name="config.templateCategory"
                type="text"
                component={Select}
                data-cy="templateCategory"
                inputProps={{
                  onChange: (e: any) => {
                    const categoryId = e.target.value;
                    setSelectedCategory(categoryId);
                  },
                }}
              >
                {categories.map(category => {
                  if (
                    category.categoryId ===
                    TemplateCategoryId.PROPOSAL_QUESTIONARY
                  ) {
                    return null;
                  }

                  return (
                    <MenuItem
                      value={category.categoryId}
                      key={category.categoryId}
                    >
                      {category.name}
                    </MenuItem>
                  );
                })}
              </Field>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="config.templateId">Template name</InputLabel>
              <Field
                name="config.templateId"
                type="text"
                component={Select}
                data-cy="template-id"
              >
                {templates &&
                  templates.map(template => {
                    return (
                      <MenuItem
                        value={template.templateId}
                        key={template.templateId}
                      >
                        {template.name}
                      </MenuItem>
                    );
                  })}
              </Field>
              <Link href="/SampleDeclarationTemplates/" target="blank">
                View all templates
              </Link>
            </FormControl>

            <Field
              name="config.addEntryButtonLabel"
              label="Add button label"
              placeholder='(e.g. "add new")'
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="addEntryButtonLabel"
            />
            <Field
              name="config.maxEntries"
              label="Max entries"
              placeholder="(e.g. 4, leave blank for unlimited)"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="maxEntries"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
