import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { Answer } from 'generated/sdk';

export const createFormikConfigObjects = (
  fields: Answer[]
): { validationSchema: any; initialValues: any } => {
  const validationSchema: any = {};
  const initialValues: any = {};

  fields.forEach(field => {
    const definition = getQuestionaryComponentDefinition(
      field.question.dataType
    );
    if (definition.createYupValidationSchema) {
      validationSchema[
        field.question.proposalQuestionId
      ] = definition.createYupValidationSchema(field);
      initialValues[field.question.proposalQuestionId] = field.value;
    }
  });

  return { initialValues, validationSchema };
};
