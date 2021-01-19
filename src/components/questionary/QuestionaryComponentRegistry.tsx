import React, { FunctionComponent } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  Answer,
  DataType,
  Question,
  QuestionTemplateRelation,
  Template,
} from 'generated/sdk';
import { Event } from 'models/QuestionaryEditorModel';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';

import { booleanDefinition } from './questionaryComponents/Boolean/BooleanDefinition';
import { dateDefinition } from './questionaryComponents/DatePicker/DatePickerDefinition';
import { embellishmentDefinition } from './questionaryComponents/Embellishment/EmbellishmentDefinition';
import { fileUploadDefinition } from './questionaryComponents/FileUpload/FileUploadDefinition';
import { intervalDefinition } from './questionaryComponents/Interval/IntervalDefinition';
import { multipleChoiceDefinition as multiChoiceDefinition } from './questionaryComponents/MultipleChoice/MultipleChoiceDefinition';
import { numberInputDefinition } from './questionaryComponents/NumberInput/NumberInputDefinition';
import { proposalBasisDefinition } from './questionaryComponents/ProposalBasis/ProposalBasisDefinition';
import { sampleBasisDefinition } from './questionaryComponents/SampleBasis/SampleBasisDefinition';
import { sampleDeclarationDefinition } from './questionaryComponents/SampleDeclaration/SampleDeclaratonDefinition';
import { shipmentBasisDefinition } from './questionaryComponents/ShipmentBasis/ShipmentBasisDefinition';
import { textInputDefinition } from './questionaryComponents/TextInput/TextInputDefinition';

export interface FormProps<ValueObjectType> {
  field: ValueObjectType;
  template: Template;
  dispatch: React.Dispatch<Event>;
  closeMe: () => any;
}

export type FormComponent<ValueObjectType> = FunctionComponent<
  FormProps<ValueObjectType>
>;

export interface Renderers {
  readonly questionRenderer: (props: {
    question: Question;
  }) => JSX.Element | null;
  readonly answerRenderer: (props: { answer: Answer }) => JSX.Element | null;
}

export interface QuestionaryComponentDefinition {
  readonly dataType: DataType;
  readonly name: string;
  readonly questionTemplateRelationForm: () => FormComponent<
    QuestionTemplateRelation
  >;
  readonly questionForm: () => FormComponent<Question>;
  readonly questionaryComponent: (
    props: BasicComponentProps
  ) => JSX.Element | null;
  readonly renderers?: Renderers;
  readonly createYupValidationSchema: ((field: Answer) => object) | null;
  readonly getYupInitialValue: (props: {
    answer: Answer;
    state: QuestionarySubmissionState;
  }) => Answer['value'];
  readonly readonly: boolean; // if true then no answer will be produced
  readonly creatable: boolean; // if true then the question can be added to a questionary
  readonly icon: JSX.Element;
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
];

Object.freeze(registry);

const componentMap = new Map<DataType, QuestionaryComponentDefinition>();
registry.forEach(definition =>
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
  props: FormProps<QuestionTemplateRelation>
): JSX.Element {
  const dataType = props.field.question.dataType;
  const definition = getQuestionaryComponentDefinition(dataType);

  return React.createElement(definition.questionTemplateRelationForm(), props);
}

export function createQuestionTemplateForm(
  props: FormProps<Question>
): JSX.Element {
  const dataType = props.field.dataType;
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
