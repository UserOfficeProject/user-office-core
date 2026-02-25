import * as Yup from 'yup';

export const createTemplateValidationSchema = Yup.object().shape({
  name: Yup.string().required(),
  description: Yup.string().notRequired(),
});

export const cloneTemplateValidationSchema = Yup.object().shape({
  templateId: Yup.number().required(),
});

export const deleteTemplateValidationSchema = cloneTemplateValidationSchema;

export const createTopicValidationSchema = Yup.object().shape({
  templateId: Yup.number().required(),
  sortOrder: Yup.number().required(),
});

export const updateTopicValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  title: Yup.string().notRequired(),
  isEnabled: Yup.bool().notRequired(),
});

export const deleteTopicValidationSchema = Yup.object().shape({
  topicId: Yup.number().required(),
});

export const createQuestionValidationSchema = (dataType: any) =>
  Yup.object().shape({
    dataType: Yup.string().oneOf(Object.values(dataType)),
  });

export const updateQuestionValidationSchema = Yup.object().shape({
  id: Yup.string().required(),
  naturalKey: Yup.string().notRequired(),
  question: Yup.string().notRequired(),
  config: Yup.string().notRequired(),
});

export const deleteQuestionValidationSchema = Yup.object().shape({
  questionId: Yup.string().required(),
});

export const updateQuestionTemplateRelationValidationSchema =
  Yup.object().shape({
    questionId: Yup.string().required(),
    templateId: Yup.number().required(),
    topicId: Yup.number().notRequired(),
    sortOrder: Yup.number().notRequired(),
    config: Yup.string().notRequired(),
    dependency: Yup.object().nullable().notRequired(),
  });

export const deleteQuestionTemplateRelationValidationSchema =
  Yup.object().shape({
    questionId: Yup.string().required(),
    templateId: Yup.number().required(),
  });

export const updateTopicOrderValidationSchema = Yup.object().shape({
  topicOrder: Yup.array().of(Yup.number()),
});

export const updateQuestionsTopicRelsValidationSchema = Yup.object().shape({
  templateId: Yup.number().required(),
  topicId: Yup.number().required(),
  questionIds: Yup.array().of(Yup.string()).required(),
});

export const updateTemplateValidationSchema = Yup.object().shape({
  templateId: Yup.number().required(),
  name: Yup.string().notRequired(),
  description: Yup.string().notRequired(),
  isArchived: Yup.bool().notRequired(),
});

export const createQuestionTemplateRelationValidationSchema =
  Yup.object().shape({
    templateId: Yup.number().required(),
    questionId: Yup.string().required(),
    sortOrder: Yup.number().required(),
    topicId: Yup.number().required(),
  });
