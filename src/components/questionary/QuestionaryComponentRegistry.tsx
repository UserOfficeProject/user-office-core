/* eslint-disable @typescript-eslint/ban-types */
import { FormikProps } from 'formik';
import React, { FC } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { SearchCriteriaInputProps } from 'components/proposal/SearchCriteriaInputProps';
import {
  Answer,
  DataType,
  QuestionTemplateRelation,
  Sdk,
  Template,
} from 'generated/sdk';
import { Question } from 'models/Question';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';

import { booleanDefinition } from './questionaryComponents/Boolean/BooleanDefinition';
import { dateDefinition } from './questionaryComponents/DatePicker/DatePickerDefinition';
import { embellishmentDefinition } from './questionaryComponents/Embellishment/EmbellishmentDefinition';
import { fileUploadDefinition } from './questionaryComponents/FileUpload/FileUploadDefinition';
import { intervalDefinition } from './questionaryComponents/Interval/IntervalDefinition';
import { multipleChoiceDefinition as multiChoiceDefinition } from './questionaryComponents/MultipleChoice/MultipleChoiceDefinition';
import { numberInputDefinition } from './questionaryComponents/NumberInput/NumberInputDefinition';
import { proposalBasisDefinition } from './questionaryComponents/ProposalBasis/ProposalBasisDefinition';
import { richTextInputDefinition } from './questionaryComponents/RichTextInput/RichTextInputDefinition';
import { sampleBasisDefinition } from './questionaryComponents/SampleBasis/SampleBasisDefinition';
import { sampleDeclarationDefinition } from './questionaryComponents/SampleDeclaration/SampleDeclaratonDefinition';
import { shipmentBasisDefinition } from './questionaryComponents/ShipmentBasis/ShipmentBasisDefinition';
import { textInputDefinition } from './questionaryComponents/TextInput/TextInputDefinition';

export type FormChildren<ValueObjectType> = (
  formikProps: FormikProps<ValueObjectType>
) => React.ReactNode;

export interface QuestionFormProps {
  question: Question;
  closeMe?: () => unknown;
  onUpdated?: (question: Question) => unknown;
  onDeleted?: (question: Question) => unknown;
  children?: FormChildren<Question>;
}
export interface QuestionTemplateRelationFormProps {
  questionRel: QuestionTemplateRelation;
  template: Template;
  closeMe?: () => unknown;
  onUpdated?: (template: Template) => unknown;
  onDeleted?: (template: Template) => unknown;
  onOpenQuestionClicked?: (question: Question) => unknown;
  children?: FormChildren<QuestionTemplateRelation>;
}

export type QuestionRenderer = React.FunctionComponent<Question>;
export type AnswerRenderer = React.FunctionComponent<Answer>;
export interface Renderers {
  readonly questionRenderer: QuestionRenderer;
  readonly answerRenderer: AnswerRenderer;
}

export interface QuestionaryComponentDefinition {
  readonly dataType: DataType;
  readonly name: string;
  readonly questionTemplateRelationForm: () => FC<QuestionTemplateRelationFormProps>;
  readonly questionForm: () => FC<QuestionFormProps>;
  readonly questionaryComponent: (
    props: BasicComponentProps
  ) => JSX.Element | null;
  readonly renderers?: Renderers;
  readonly createYupValidationSchema:
    | ((
        field: Answer,
        state: QuestionarySubmissionState,
        api?: () => Sdk
      ) => object)
    | null;
  readonly getYupInitialValue: (props: {
    answer: Answer;
    state: QuestionarySubmissionState;
  }) => Answer['value'];
  readonly readonly: boolean; // if true then no answer will be produced
  readonly creatable: boolean; // if true then the question can be added to a questionary
  readonly icon: JSX.Element;
  readonly searchCriteriaComponent?: FC<SearchCriteriaInputProps>;
}

const registry = [
  booleanDefinition,
  dateDefinition,
  embellishmentDefinition,
  fileUploadDefinition,
  multiChoiceDefinition,
  textInputDefinition,
  sampleDeclarationDefinition,
  proposalBasisDefinition,
  sampleBasisDefinition,
  intervalDefinition,
  numberInputDefinition,
  shipmentBasisDefinition,
  richTextInputDefinition,
];

Object.freeze(registry);

const componentMap = new Map<DataType, QuestionaryComponentDefinition>();
registry.forEach((definition) =>
  componentMap.set(definition.dataType, definition)
);

export function getQuestionaryComponentDefinition(id: DataType) {
  const definition = componentMap.get(id);
  if (!definition) {
    throw new Error(`Definition for ${id} was not found`);
  }

  return definition;
}

// Convenience methods below
export const getQuestionaryComponentDefinitions = () => registry;

export function createQuestionTemplateRelationForm(
  props: QuestionTemplateRelationFormProps
): JSX.Element {
  const dataType = props.questionRel.question.dataType;
  const definition = getQuestionaryComponentDefinition(dataType);

  return React.createElement(definition.questionTemplateRelationForm(), props);
}

export function createQuestionForm(props: QuestionFormProps): JSX.Element {
  const dataType = props.question.dataType;
  const definition = getQuestionaryComponentDefinition(dataType);

  return React.createElement(definition.questionForm(), props);
}

export function createQuestionaryComponent(
  props: BasicComponentProps
): JSX.Element {
  const dataType = props.answer.question.dataType;
  const definition = getQuestionaryComponentDefinition(dataType);

  return React.createElement(definition.questionaryComponent, props);
}

export const getTemplateFieldIcon = (dataType: DataType) => {
  return getQuestionaryComponentDefinition(dataType).icon;
};

export const creatableQuestions = registry.filter(
  (def) => def.creatable === true
);

export const nonCreatableQuestions = registry.filter(
  (def) => def.creatable === false
);
