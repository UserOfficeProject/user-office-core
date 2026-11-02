import MaterialTable, { Column, Options } from '@material-table/core';
import { Visibility } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { TFunction } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { Experiment } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { UserExperiment } from 'hooks/experiment/useUserExperiments';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

import ExperimentReviewContent, {
  EXPERIMENT_MODAL_TAB_NAMES,
} from '../experiment/ExperimentReviewContent';
import ExperimentReviewModal from '../experiment/ExperimentReviewModal';

type ExperimentTimesTableProps = {
  title: string;
  isLoading: boolean;
  experiments: UserExperiment[];
  options?: Partial<Options<UserExperiment>>;
};

const RowActionButtons = ({ experimentId }: { experimentId: string }) => {
  const [, setSearchParams] = useSearchParams();

  return (
    <Tooltip title="View Experiment">
      <IconButton
        data-cy="view-experiment"
        onClick={() => {
          setSearchParams((searchParams) => {
            searchParams.set('experiment', experimentId);

            return searchParams;
          });
        }}
      >
        <Visibility />
      </IconButton>
    </Tooltip>
  );
};

export default function ExperimentsTimesTable({
  title,
  isLoading,
  experiments,
  options,
}: ExperimentTimesTableProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedExperimentPk = searchParams.get('experiment');
  const parsedExperimentPk =
    selectedExperimentPk !== null ? parseInt(selectedExperimentPk) : NaN;
  const [selectedExperiment] = useState<Experiment>();
  const experimentPkFromUrl = Number.isInteger(parsedExperimentPk)
    ? parsedExperimentPk
    : null;
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const experimentReviewTabs = [
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_FORM,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_REVIEW,
    EXPERIMENT_MODAL_TAB_NAMES.VISIT,
  ];

  const experimentsWithFormattedDates = experiments.map((event) => ({
    ...event,
    experimentId: event.experimentId,
    startsAtFormatted: toFormattedDateTime(event.startsAt),
    endsAtFormatted: toFormattedDateTime(event.endsAt),
    localContactFormatted: getFullUserName(event.localContact),
  }));

  const columns: (
    t: TFunction<'translation', undefined>
  ) => Column<UserExperiment>[] = (t) => [
    {
      title: 'Actions',
      cellStyle: { padding: 0 },
      sorting: false,
      removable: false,
      field: 'rowActionButtons',
      render: (rowData: UserExperiment) => (
        <RowActionButtons experimentId={rowData.experimentPk.toString()} />
      ),
    },
    { title: 'Proposal title', field: 'proposal.title' },
    { title: 'Proposal ID', field: 'proposal.proposalId' },
    { title: 'Experiment Number', field: 'experimentId' },
    { title: t('instrument') as string, field: 'instrument.name' },
    {
      title: 'Local contact',
      field: 'localContactFormatted',
    },
    {
      title: 'Starts at',
      field: 'startsAtFormatted',
    },
    {
      title: 'Ends at',
      field: 'endsAtFormatted',
    },
  ];

  // the experiment can live outside the currently loaded page of results (e.g. a
  // deep link), in which case ExperimentReviewContent fetches it by primary key
  const experimentPkToReview =
    selectedExperiment?.experimentPk ?? experimentPkFromUrl;

  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title={title}
        isLoading={isLoading}
        columns={columns(t)}
        data={experimentsWithFormattedDates}
        options={{
          search: false,
          padding: 'dense',
          emptyRowsWhenPaging: false,
          paging: false,
          ...options,
        }}
      />
      {experimentPkToReview !== null && (
        <ExperimentReviewModal
          title={
            selectedExperiment
              ? `View Experiment: ${selectedExperiment.experimentId} - (${toFormattedDateTime(selectedExperiment.startsAt)} - ${toFormattedDateTime(selectedExperiment.endsAt)})`
              : 'View Experiment'
          }
          modalOpen={true}
          handleClose={() => {
            setSearchParams((searchParams) => {
              searchParams.delete('experiment');

              return searchParams;
            });
          }}
        >
          <ExperimentReviewContent
            experimentPk={experimentPkToReview}
            tabNames={experimentReviewTabs}
            isInsideModal={true}
          />
        </ExperimentReviewModal>
      )}
    </div>
  );
}
