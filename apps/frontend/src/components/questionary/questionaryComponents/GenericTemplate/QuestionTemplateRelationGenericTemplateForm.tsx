import { Collapse, FormControl } from '@mui/material';
import Link from '@mui/material/Link';
import makeStyles from '@mui/styles/makeStyles';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import { default as React } from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { SubTemplateConfig, TemplateGroupId } from 'generated/sdk';
import { useTemplates } from 'hooks/template/useTemplates';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationGenericTemplateForm = (
  props: QuestionTemplateRelationFormProps
) => {
  const templateId = (props.questionRel.question.config as SubTemplateConfig)
    .templateId;
  const { templates } = useTemplates({
    isArchived: false,
    group: TemplateGroupId.GENERIC_TEMPLATE,
    templateIds: templateId ? [templateId] : null,
  });
  const useStyles = makeStyles((theme) => ({
    label: {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.grey[300],
      fontSize: 'medium',
    },
  }));
  const classes = useStyles();

  if (!templates) {
    return null;
  }

  const templateOptions = templates.map((template) => ({
    value: template.templateId,
    text: template.name,
  }));

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          addEntryButtonLabel: Yup.string(),
          maxEntries: Yup.number().nullable(),
          templateId: Yup.number().required('Template is required'),
          canCopy: Yup.bool().required(),
          copyButtonLabel: Yup.string().when('canCopy', {
            is: (canCopy: boolean) => canCopy,
            then: Yup.string().required('Copy button label is required'),
          }),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <label className={classes.label}>
            You are editing the question as it appears on the current template
          </label>
          <QuestionExcerpt question={props.questionRel.question} />
          <TitledContainer label="Options">
            <Field
              name="config.addEntryButtonLabel"
              label="Add button label"
              id="add-button-input"
              placeholder='(e.g. "add new")'
              type="text"
              component={TextField}
              fullWidth
              data-cy="addEntryButtonLabel"
            />
            <Field
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Can copy',
              }}
              name="config.canCopy"
              checked={(formikProps.values.config as SubTemplateConfig).canCopy}
            />
            <Collapse
              in={(formikProps.values.config as SubTemplateConfig).canCopy}
            >
              <Field
                name="config.copyButtonLabel"
                id="copy-button-label-Input"
                label="Copy button label"
                placeholder='(e.g. "copy")'
                type="text"
                component={TextField}
                fullWidth
                data-cy="copyButtonLabel"
              />
              <Field
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Multiple copy selection',
                }}
                name="config.isMultipleCopySelect"
              />
              <Field
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Copy is complete',
                }}
                name="config.isCompleteOnCopy"
              />
            </Collapse>
          </TitledContainer>

          <TitledContainer label="Constraints">
            <Field
              name="config.minEntries"
              label="Min entries"
              id="Min-input"
              placeholder="(e.g. 1, leave blank for unlimited)"
              type="text"
              component={TextField}
              fullWidth
              data-cy="min-entries"
            />
            <Field
              name="config.maxEntries"
              label="Max entries"
              id="Max-input"
              type="text"
              component={TextField}
              fullWidth
              data-cy="max-entries"
            />
          </TitledContainer>

          <TitledContainer label="Options">
            <FormControl fullWidth>
              <FormikUIAutocomplete
                name="config.templateId"
                items={templateOptions}
                label="Template name"
                noOptionsText="No Sub Templates available"
                InputProps={{ 'data-cy': 'template-id' }}
                TextFieldProps={{ margin: 'none' }}
                required
              />
              <Link href="/GenericTemplates/" target="blank">
                View all templates
              </Link>
            </FormControl>
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
