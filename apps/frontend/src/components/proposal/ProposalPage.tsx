import React from 'react';
import { SetURLSearchParams, useSearchParams } from 'react-router-dom';
import { QueryParamConfig } from 'use-query-params';

import { UrlQueryParamsType } from 'components/common/SuperMaterialTable';
import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalFilterBar, {
  questionaryFilterFromUrlQuery,
} from './ProposalFilterBar';
import ProposalTableOfficer from './ProposalTableOfficer';

export type ProposalUrlQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<string | null | undefined>;
  proposalStatus: QueryParamConfig<number | null | undefined>;
  reviewModal: QueryParamConfig<number | null | undefined>;
  modalTab: QueryParamConfig<number | null | undefined>;
  compareOperator: QueryParamConfig<string | null | undefined>;
  questionId: QueryParamConfig<string | null | undefined>;
  proposalId: QueryParamConfig<string | null | undefined>;
  value: QueryParamConfig<string | null | undefined>;
  dataType: QueryParamConfig<string | null | undefined>;
} & UrlQueryParamsType;

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
  const [searchParams]: [ProposalUrlQueryParams, SetURLSearchParams] =
    useSearchParams();

  const callId = searchParams.get('call');
  const instrumentId = searchParams.get('instrument');
  const proposalStatusId = searchParams.get('proposalStatus');
  const questionId = searchParams.get('questionId');
  const proposalId = searchParams.get('proposalId');
  const compareOperator = searchParams.get('compareOperator');
  const value = searchParams.get('value');
  const dataType = searchParams.get('dataType');

  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: callId != null ? +callId : null,
    instrumentFilter: {
      instrumentId: instrumentId != null ? +instrumentId : null,
      showAllProposals: !instrumentId,
      showMultiInstrumentProposals: false,
    },
    proposalStatusId: proposalStatusId != null ? +proposalStatusId : null,
    referenceNumbers: proposalId ? [proposalId] : [],
    questionFilter: questionaryFilterFromUrlQuery({
      compareOperator,
      dataType,
      questionId,
      value,
    }),
  });
  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsData();
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
