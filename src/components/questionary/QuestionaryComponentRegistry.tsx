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

import { booleanDefinition } from './questionaryComponents/Boolean/BooleanDefinition';
import { dateDefinition } from './questionaryComponents/DatePicker/DatePickerDefinition';
import { embellishmentDefinition } from './questionaryComponents/Embellishment/EmbellishmentDefinition';
import { fileUploadDefinition } from './questionaryComponents/FileUpload/FileUploadDefinition';
import { multipleChoiceDefinition as multiChoiceDefinition } from './questionaryComponents/MultipleChoice/MultipleChoiceDefinition';
import { proposalBasisDefinition } from './questionaryComponents/ProposalBasis/ProposalBasisDefinition';
import { sampleBasisDefinition } from './questionaryComponents/SampleBasis/SampleBasisDefinition';
import { sampleDeclarationDefinition } from './questionaryComponents/SampleDeclaration/SampleDeclaratonDefinition';
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

export interface QuestionaryComponentDefinition {
  dataType: DataType;
  name: string;
  questionTemplateRelationForm: () => FormComponent<QuestionTemplateRelation>;
  questionForm: () => FormComponent<Question>;
  questionaryComponent: (props: BasicComponentProps) => JSX.Element | null;
  answerRenderer: (props: { answer: Answer }) => JSX.Element | null;
  createYupValidationSchema: ((field: Answer) => object) | null;
  readonly: boolean; // if true then no answer will be produced
  creatable: boolean; // if true then the question can be added to a questionary
  icon: JSX.Element;
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
];

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

export const getQuestionaryComponentDefinitions = () => registry.slice(0);

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

export function formatQuestionaryComponentAnswer(answer: Answer): JSX.Element {
  const dataType = answer.question.dataType;
  const definition = getQuestionaryComponentDefinition(dataType);

  return React.createElement(definition.answerRenderer, { answer });
}

export const getTemplateFieldIcon = (dataType: DataType) => {
  return getQuestionaryComponentDefinition(dataType).icon;
};
