import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { DecodedValueMap } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import ProposalStatusFilter from 'components/common/proposalFilters/ProposalStatusFilter';
import QuestionaryFilter from 'components/common/proposalFilters/QuestionaryFilter';
import {
  Call,
  DataType,
  InstrumentFragment,
  ProposalsFilter,
  ProposalStatus,
  QuestionFilterCompareOperator,
  QuestionFilterInput,
} from 'generated/sdk';
import { useQuestionFilterQueryParams } from 'hooks/proposal/useQuestionFilterQueryParams';

import { ProposalUrlQueryParamsType } from './ProposalPage';

export const questionaryFilterFromUrlQuery = (
  urlQuery: DecodedValueMap<ProposalUrlQueryParamsType>
): QuestionFilterInput | undefined => {
  if (
    urlQuery.questionId &&
    urlQuery.compareOperator &&
    urlQuery.value &&
    urlQuery.dataType
  ) {
    return {
      questionId: urlQuery.questionId,
      compareOperator:
        urlQuery.compareOperator as QuestionFilterCompareOperator,
      value: urlQuery.value,
      dataType: urlQuery.dataType as DataType,
    };
  }
};
type ProposalFilterBarProps = {
  calls?: { data: Call[]; isLoading: boolean };
  instruments?: { data: InstrumentFragment[]; isLoading: boolean };
  proposalStatuses?: { data: ProposalStatus[]; isLoading: boolean };
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
};

const ProposalFilterBar = ({
  calls,
  instruments,
  proposalStatuses,
  setProposalFilter,
  filter,
}: ProposalFilterBarProps) => {
  const { setQuestionFilterQuery } = useQuestionFilterQueryParams();
  const [showQuestionFilter, setShowQuestionFilter] = useState(
    filter.questionFilter !== undefined
  );

  const selectedCallTemplateId = calls?.data.find(
    (call) => call.id === filter.callId
  )?.templateId;

  return (
    <Grid container spacing={2}>
      <Grid item sm={3} xs={12}>
        <CallFilter
          callId={filter.callId as number}
          calls={calls?.data}
          isLoading={calls?.isLoading}
          shouldShowAll={true}
          onChange={(callId) => {
            if (!callId) {
              setShowQuestionFilter(false);
            }

            setProposalFilter({
              ...filter,
              callId,
            });
          }}
        />
      </Grid>

      <Grid item sm={3} xs={12}>
        <InstrumentFilter
          instrumentId={filter.instrumentId as number}
          instruments={instruments?.data}
          isLoading={instruments?.isLoading}
          shouldShowAll={true}
          onChange={(instrumentId) => {
            setProposalFilter({
              ...filter,
              instrumentId,
            });
          }}
        />
      </Grid>

      <Grid item sm={3} xs={12}>
        <ProposalStatusFilter
          proposalStatusId={filter.proposalStatusId as number}
          proposalStatuses={proposalStatuses?.data}
          isLoading={proposalStatuses?.isLoading}
          shouldShowAll={true}
          onChange={(proposalStatusId) => {
            setProposalFilter({
              ...filter,
              proposalStatusId,
            });
          }}
        />
      </Grid>

      <Grid item sm={3} xs={12}>
        <Button
          variant="outlined"
          endIcon={showQuestionFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          style={{
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
          data-cy="question-search-toggle"
        >
          {showQuestionFilter ? 'close' : 'more'}
        </Button>
      </Grid>

      {selectedCallTemplateId && (
        <Grid item sm={6} xs={12}>
          <Collapse in={showQuestionFilter}>
            <QuestionaryFilter
              callId={filter.callId}
              templateId={selectedCallTemplateId}
              onSubmit={(questionFilter) => {
                setProposalFilter({
                  ...filter,
                  questionFilter,
                });
              }}
            />
          </Collapse>
        </Grid>
      )}
    </Grid>
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
