import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React from 'react';
import { QueryParamConfig } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import DateFilter from 'components/common/proposalFilters/DateFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import ProposalStatusFilter from 'components/common/proposalFilters/ProposalStatusFilter';
import TechniqueFilter from 'components/common/proposalFilters/TechniqueFilter';
import { UrlQueryParamsType } from 'components/common/SuperMaterialTable';
import {
  Call,
  InstrumentFragment,
  ProposalsFilter,
  ProposalStatus,
  TechniqueFragment,
} from 'generated/sdk';

export type ProposalUrlQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<string | null | undefined>;
  reviewModal: QueryParamConfig<number | null | undefined>;
  modalTab: QueryParamConfig<number | null | undefined>;
  compareOperator: QueryParamConfig<string | null | undefined>;
  proposalId: QueryParamConfig<string | null | undefined>;
  value: QueryParamConfig<string | null | undefined>;
  dataType: QueryParamConfig<string | null | undefined>;
} & UrlQueryParamsType;

type ProposalFilterBarProps = {
  calls?: { data: Call[]; isLoading: boolean };
  instruments?: { data: InstrumentFragment[]; isLoading: boolean };
  techniques?: { data: TechniqueFragment[]; isLoading: boolean };
  proposalStatuses?: { data: ProposalStatus[]; isLoading: boolean };
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
};

const XpressProposalFilterBar = ({
  calls,
  instruments,
  techniques,
  proposalStatuses,
  setProposalFilter,
  filter,
}: ProposalFilterBarProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item sm={3} xs={12}>
        <CallFilter
          callId={filter.callId as number}
          calls={calls?.data}
          isLoading={calls?.isLoading}
          shouldShowAll={true}
          onChange={(callId) => {
            setProposalFilter({
              ...filter,
              callId,
            });
          }}
        />
      </Grid>

      <Grid item sm={3} xs={12}>
        <TechniqueFilter
          techniqueId={filter.techniqueFilter?.techniqueId}
          showMultiTechniqueProposals={
            filter.techniqueFilter?.showMultiTechniqueProposals
          }
          techniques={techniques?.data}
          isLoading={techniques?.isLoading}
          shouldShowAll={true}
          onChange={(techniqueFilterValue) => {
            setProposalFilter({
              ...filter,
              techniqueFilter: techniqueFilterValue,
            });
          }}
        />
      </Grid>

      <Grid item sm={3} xs={12}>
        <InstrumentFilter
          instrumentId={filter.instrumentFilter?.instrumentId}
          showMultiInstrumentProposals={
            filter.instrumentFilter?.showMultiInstrumentProposals
          }
          instruments={instruments?.data}
          isLoading={instruments?.isLoading}
          shouldShowAll={true}
          onChange={(instrumentFilterValue) => {
            setProposalFilter({
              ...filter,
              instrumentFilter: instrumentFilterValue,
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
          hiddenStatuses={filter.excludeProposalStatusIds as number[]}
          onChange={(proposalStatusId) => {
            setProposalFilter({
              ...filter,
              proposalStatusId,
            });
          }}
        />
      </Grid>

      <Grid item sm={5} xs={12}>
        <Grid item xs={12}>
          <DateFilter
            from={filter.dateFilter?.from}
            to={filter.dateFilter?.to}
            onChange={(dateFilterValue) => {
              setProposalFilter({
                ...filter,
                dateFilter: dateFilterValue,
              });
            }}
            data-cy="date-filter"
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

XpressProposalFilterBar.propTypes = {
  calls: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  instruments: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  techniques: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  setProposalFilter: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
};

export default XpressProposalFilterBar;
