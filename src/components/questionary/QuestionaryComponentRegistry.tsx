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
import { visitationBasisDefinition } from './questionaryComponents/VisitationBasis/VisitiationBasisDefinition';

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
export type CreateYupValidation =
  | ((
      field: Answer,
      state: QuestionarySubmissionState,
      api?: () => Sdk
    ) => object)
  | null;

export type GetYupInitialValue = (props: {
  answer: Answer;
  state: QuestionarySubmissionState;
}) => Answer['value'];

type QuestionaryComponent = (props: BasicComponentProps) => JSX.Element | null;

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
  readonly questionaryComponent: QuestionaryComponent;

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
  visitationBasisDefinition,
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
