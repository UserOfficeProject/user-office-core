import PropTypes from 'prop-types';
import React from 'react';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import ProposalStatusFilter from 'components/common/proposalFilters/ProposalStatusFilter';
import QuestionaryFilter from 'components/common/QuestionaryFilter';
import {
  Call,
  GetTemplateQuery,
  Instrument,
  ProposalsFilter,
  ProposalStatus,
} from 'generated/sdk';

type ProposalFilterBarProps = {
  calls?: { data: Call[]; isLoading: boolean };
  instruments?: { data: Instrument[]; isLoading: boolean };
  proposalStatuses?: { data: ProposalStatus[]; isLoading: boolean };
  template?: { data: GetTemplateQuery['template']; isLoading: boolean };
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
};

const ProposalFilterBar: React.FC<ProposalFilterBarProps> = ({
  calls,
  instruments,
  proposalStatuses,
  template,
  setProposalFilter,
  filter,
}) => {
  return (
    <>
      <CallFilter
        callId={filter.callId as number}
        calls={calls?.data}
        isLoading={calls?.isLoading}
        shouldShowAll={true}
        onChange={callId => {
          setProposalFilter({
            ...filter,
            callId,
          });
        }}
      />

      <InstrumentFilter
        instrumentId={filter.instrumentId as number}
        instruments={instruments?.data}
        isLoading={instruments?.isLoading}
        shouldShowAll={true}
        onChange={instrumentId => {
          setProposalFilter({
            ...filter,
            instrumentId,
          });
        }}
      />

      <ProposalStatusFilter
        proposalStatusId={filter.proposalStatusId as number}
        proposalStatuses={proposalStatuses?.data}
        isLoading={proposalStatuses?.isLoading}
        shouldShowAll={true}
        onChange={proposalStatusId => {
          setProposalFilter({
            ...filter,
            proposalStatusId,
          });
        }}
      />

      {template?.data && (
        <QuestionaryFilter
          template={template.data}
          isLoading={template.isLoading}
          onSubmit={questionFilter =>
            setProposalFilter({
              ...filter,
              questionFilter,
            })
          }
        />
      )}
    </>
  );
};

ProposalFilterBar.propTypes = {
  calls: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  instruments: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  proposalStatuses: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  setProposalFilter: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
};

export default ProposalFilterBar;
