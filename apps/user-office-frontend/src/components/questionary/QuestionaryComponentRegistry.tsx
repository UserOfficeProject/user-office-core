/* eslint-disable @typescript-eslint/ban-types */
import { FormikProps } from 'formik';
import React, { FC, ReactNode } from 'react';
import * as Yup from 'yup';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { SearchCriteriaInputProps } from 'components/proposal/SearchCriteriaInputProps';
import {
  Answer,
  DataType,
  Question,
  QuestionTemplateRelation,
  Sdk,
  Template,
  TemplateFragment,
} from 'generated/sdk';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

import { booleanDefinition } from './questionaryComponents/Boolean/BooleanDefinition';
import { dateDefinition } from './questionaryComponents/DatePicker/DatePickerDefinition';
import { embellishmentDefinition } from './questionaryComponents/Embellishment/EmbellishmentDefinition';
import { feedbackBasisDefinition } from './questionaryComponents/FeedbackBasis/FeedbackBasisDefinition';
import { fileUploadDefinition } from './questionaryComponents/FileUpload/FileUploadDefinition';
import { genericTemplateDefinition } from './questionaryComponents/GenericTemplate/GenericTemplateDefinition';
import { genericTemplateBasisDefinition } from './questionaryComponents/GenericTemplateBasis/GenericTemplateBasisDefinition';
import { intervalDefinition } from './questionaryComponents/Interval/IntervalDefinition';
import { multipleChoiceDefinition as multiChoiceDefinition } from './questionaryComponents/MultipleChoice/MultipleChoiceDefinition';
import { numberInputDefinition } from './questionaryComponents/NumberInput/NumberInputDefinition';
import { proposalBasisDefinition } from './questionaryComponents/ProposalBasis/ProposalBasisDefinition';
import { proposalEsiBasisDefinition } from './questionaryComponents/ProposalEsiBasis/ProposalEsiBasisDefinition';
import { richTextInputDefinition } from './questionaryComponents/RichTextInput/RichTextInputDefinition';
import { sampleBasisDefinition } from './questionaryComponents/SampleBasis/SampleBasisDefinition';
import { sampleDeclarationDefinition } from './questionaryComponents/SampleDeclaration/SampleDeclaratonDefinition';
import { sampleEsiBasisDefinition } from './questionaryComponents/SampleEsiBasis/SampleEsiBasisDefinition';
import { shipmentBasisDefinition } from './questionaryComponents/ShipmentBasis/ShipmentBasisDefinition';
import { textInputDefinition } from './questionaryComponents/TextInput/TextInputDefinition';
import { visitBasisDefinition } from './questionaryComponents/VisitBasis/VisitBasisDefinition';

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
  onUpdated?: (template: TemplateFragment) => unknown;
  onDeleted?: (template: TemplateFragment) => unknown;
  onOpenQuestionClicked?: (question: Question) => unknown;
  children?: FormChildren<QuestionTemplateRelation>;
}

export type QuestionRenderer = React.FunctionComponent<Question>;
export type AnswerRenderer = React.FunctionComponent<Answer>;
export interface Renderers {
  readonly questionRenderer: QuestionRenderer;
  readonly answerRenderer: AnswerRenderer;
}
export type CreateYupValidation =
  | ((
      field: Answer,
      state: QuestionarySubmissionState,
      api?: () => Sdk
    ) => Yup.AnySchema)
  | null;

export type GetYupInitialValue = (props: {
  answer: Answer;
  state: QuestionarySubmissionState;
}) => Answer['value'];

export interface QuestionaryComponentDefinition {
  /**
   * The enum value from DataType
   */
  readonly dataType: DataType;

  /**
   * A human readable name
   */
  readonly name: string;

  /**
   * The main component that is rendered in the questionary and visible by user
   */
  readonly questionaryComponent: FC<BasicComponentProps> | null;

  /**
   * A form used in administration panel to define a question (more on this below)
   */
  readonly questionForm: () => FC<QuestionFormProps>;

  /**
   * A form used in administration panel to define a question template relation (more on that below)
   */
  readonly questionTemplateRelationForm: () => FC<QuestionTemplateRelationFormProps>;

  /**
   * Rendering of the question and answer that is displayed in the review,
   * For most components use the `defaultRenderer`. The `defaultRenderer` will print question and answer
   * as simple strings.
   *
   * If you want to exclude your question from review completely you can set renderers to undefined
   */
  readonly renderers?: Renderers;

  /**
   * Yup validation rules for the answer
   */
  readonly createYupValidationSchema: CreateYupValidation;

  /**
   * Returns initial value for the Yup validation schema
   */
  readonly getYupInitialValue: GetYupInitialValue;

  /**
   * If true then no answer will be produced.
   * This could be set to true for decorative components
   * or components with special functionality where no answer is needed
   */
  readonly readonly: boolean;

  /**
   * If true then the question can be added to a questionary from template editor.
   */
  readonly creatable: boolean;

  /**
   * The icon for component
   */
  readonly icon: JSX.Element;

  /**
   * Component used in search questions page. Contains UI that user officer
   * can use to specify search criteria for the dataType
   */
  readonly searchCriteriaComponent?: FC<SearchCriteriaInputProps>;
  readonly preSubmitTransform?: (answer: Answer) => Answer;
}

const registry = [
  booleanDefinition,
  dateDefinition,
  embellishmentDefinition,
  feedbackBasisDefinition,
  fileUploadDefinition,
  genericTemplateBasisDefinition,
  genericTemplateDefinition,
  intervalDefinition,
  multiChoiceDefinition,
  numberInputDefinition,
  proposalBasisDefinition,
  proposalEsiBasisDefinition,
  richTextInputDefinition,
  sampleBasisDefinition,
  sampleDeclarationDefinition,
  sampleEsiBasisDefinition,
  shipmentBasisDefinition,
  textInputDefinition,
  visitBasisDefinition,
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
): ReactNode {
  const dataType = props.answer.question.dataType;
  const definition = getQuestionaryComponentDefinition(dataType);

  return definition.questionaryComponent
    ? React.createElement(definition.questionaryComponent, props)
    : null;
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
