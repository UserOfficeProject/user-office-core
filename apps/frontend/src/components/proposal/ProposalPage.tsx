import React, { useMemo } from 'react';

import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
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
  const initialParams = useMemo(
    () => ({
      call: null,
      instrument: null,
      proposalStatus: null,
      reviewModal: null,
      modalTab: null,
      questionId: null,
      proposalId: null,
      compareOperator: null,
      value: null,
      dataType: null,
    }),
    []
  );

  const [typedParams] = useTypeSafeSearchParams<{
    call: string | null;
    instrument: string | null;
    proposalStatus: string | null;
    reviewModal: string | null;
    modalTab: string | null;
    questionId: string | null;
    proposalId: string | null;
    compareOperator: string | null;
    value: string | null;
    dataType: string | null;
  }>(initialParams);

  const {
    call: callId,
    instrument: instrumentId,
    proposalStatus: proposalStatusId,
    questionId,
    proposalId,
    compareOperator,
    value,
    dataType,
  } = typedParams;

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
