import { Button, Collapse } from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import ProposalStatusFilter from 'components/common/proposalFilters/ProposalStatusFilter';
import QuestionaryFilter, {
  useQuestionFilterQueryParams,
} from 'components/common/proposalFilters/QuestionaryFilter';
import {
  Call,
  Instrument,
  ProposalsFilter,
  ProposalStatus,
} from 'generated/sdk';

type ProposalFilterBarProps = {
  calls?: { data: Call[]; isLoading: boolean };
  instruments?: { data: Instrument[]; isLoading: boolean };
  proposalStatuses?: { data: ProposalStatus[]; isLoading: boolean };
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
};

const ProposalFilterBar: React.FC<ProposalFilterBarProps> = ({
  calls,
  instruments,
  proposalStatuses,
  setProposalFilter,
  filter,
}) => {
  const { setQuestionFilterQuery } = useQuestionFilterQueryParams();
  const [showQuestionFilter, setShowQuestionFilter] = useState(
    filter.questionFilter !== undefined
  );

  const selectedCallTemplateId = calls?.data.find(
    call => call.id === filter.callId
  )?.templateId;

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

      <Button
        variant="outlined"
        endIcon={showQuestionFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        style={{
          marginTop: '17px',
          marginLeft: '8px',
          textTransform: 'none',
          fontSize: '16px',
        }}
        onClick={() => {
          const shouldShowQuestionFilter = !showQuestionFilter;
          setShowQuestionFilter(shouldShowQuestionFilter);
          if (!shouldShowQuestionFilter) {
            setQuestionFilterQuery(undefined);
            setProposalFilter({
              ...filter,
              questionFilter: undefined,
            }); // submitting because it feels intuitive that filter is cleared when menu is closed
          }
        }}
        disabled={!selectedCallTemplateId}
      >
        {showQuestionFilter ? 'close' : 'more'}
      </Button>

      {selectedCallTemplateId && (
        <Collapse in={showQuestionFilter}>
          <QuestionaryFilter
            templateId={selectedCallTemplateId}
            onSubmit={questionFilter => {
              setProposalFilter({
                ...filter,
                questionFilter,
              });
            }}
          />
        </Collapse>
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
