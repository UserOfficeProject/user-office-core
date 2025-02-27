import React from 'react';

import EsiIcon from 'components/common/icons/EsiIcon';
import { DataType } from 'generated/sdk';
import { ExperimentSafetySubmissionState } from 'models/questionary/experimentSafety/ExperimentSafetySubmissionState';

import { createProposalEsiBasisValidationSchema } from './createProposalEsiValidationSchema';
import QuestionaryComponentExperimentSafetyBasis from './QuestionaryComponentExperimentSafetyBasis';
import { QuestionProposalEsiBasisForm } from './QuestionProposalEsiBasisForm';
import { QuestionTemplateRelationProposalEsiBasisForm } from './QuestionTemplateRelationProposalEsiBasisForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const proposalEsiBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.PROPOSAL_ESI_BASIS,
  name: 'Proposal ESI Basis',
  questionaryComponent: QuestionaryComponentExperimentSafetyBasis,
  questionForm: () => QuestionProposalEsiBasisForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationProposalEsiBasisForm,
  readonly: true,
  creatable: false,
  icon: <EsiIcon />,
  createYupValidationSchema: createProposalEsiBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const esiState = state as ExperimentSafetySubmissionState;

    return esiState.experimentSafety.samples;
  },
};
