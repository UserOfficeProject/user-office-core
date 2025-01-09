import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsMinimalData } from 'hooks/instrument/useInstrumentsMinimalData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalFilterBar, {
  questionaryFilterFromUrlQuery,
} from './ProposalFilterBar';
import ProposalTableOfficer from './ProposalTableOfficer';

export interface ProposalUrlQueryParams extends URLSearchParams {
  call?: string;
  instrument?: string;
  proposalStatus?: string;
  reviewModal?: string;
  modalTab?: string;
  questionId?: string;
  proposalId?: string;
  compareOperator?: string;
  value?: string;
  dataType?: string;
}

export default function ProposalPage() {
  const [searchParams] = useSearchParams();

  const callId = searchParams.get('call');
  const instrumentId = searchParams.get('instrument');
  const proposalStatusId = searchParams.get('proposalStatus');
  const questionId = searchParams.get('questionId');
  const proposalId = searchParams.get('proposalId');
  const compareOperator = searchParams.get('compareOperator');
  const value = searchParams.get('value');
  const dataType = searchParams.get('dataType');

  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: callId ? +callId : undefined,
    instrumentFilter: {
      instrumentId: instrumentId != null ? +instrumentId : null,
      showAllProposals: !instrumentId,
      showMultiInstrumentProposals: false,
    },
    proposalStatusId: proposalStatusId ? +proposalStatusId : undefined,
    referenceNumbers: proposalId ? [proposalId] : undefined,
    questionFilter: questionaryFilterFromUrlQuery({
      compareOperator,
      dataType,
      questionId,
      value,
    }),
  });
  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsMinimalData();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper data-cy="officer-proposals-table">
        <ProposalFilterBar
          calls={{ data: calls, isLoading: loadingCalls }}
          instruments={{
            data: instruments,
            isLoading: loadingInstruments,
          }}
          proposalStatuses={{
            data: proposalStatuses,
            isLoading: loadingProposalStatuses,
          }}
          setProposalFilter={setProposalFilter}
          filter={proposalFilter}
          hiddenStatuses={[]}
        />
        <ProposalTableOfficer
          proposalFilter={proposalFilter}
          setProposalFilter={setProposalFilter}
        />
      </StyledPaper>
    </StyledContainer>
  );
}
