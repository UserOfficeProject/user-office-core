import DescriptionIcon from '@mui/icons-material/Description';
import React from 'react';

import { DataType } from 'generated/sdk';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createProposalBasisValidationSchema } from './createProposalBasisValidationSchema';
import { QuestionaryComponentProposalBasis } from './QuestionaryComponentProposalBasis';
import { QuestionProposalBasisForm } from './QuestionProposalBasisForm';
import { QuestionTemplateRelationProposalBasisForm } from './QuestionTemplateRelationProposalBasisForm';

export const proposalBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.PROPOSAL_BASIS,
  name: 'Proposal Basis',
  questionaryComponent: QuestionaryComponentProposalBasis,
  questionForm: () => QuestionProposalBasisForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationProposalBasisForm,
  readonly: true,
  creatable: false,
  icon: <DescriptionIcon />,
  createYupValidationSchema: createProposalBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const proposalState = state as ProposalSubmissionState;

    return {
      title: proposalState.proposal.title,
      abstract: proposalState.proposal.abstract,
      proposer: proposalState.proposal.proposer?.id,
      users: proposalState.proposal.users.map((user) => user.id),
    };
  },
};
