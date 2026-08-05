import MaterialTable, { Column } from '@material-table/core';
import { Dialog, DialogContent } from '@mui/material';
import { TFunction } from 'i18next';
import React, { useState, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { rowComponents } from 'components/common/MaterialTableCardRow';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useIsMobile } from 'hooks/common/useResponsive';
import {
  UserExperiment,
  useUserExperiments,
} from 'hooks/experiment/useUserExperiments';
import { useActionButtons } from 'hooks/proposalBooking/useActionButtons';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

const columns: (
  t: TFunction<'translation', undefined>
) => Column<UserExperiment>[] = (t) => [
  { title: 'Experiment Number', field: 'experimentId' },
  { title: 'Proposal title', field: 'proposal.title' },
  { title: 'Proposal ID', field: 'proposal.proposalId' },
  { title: t('instrument') as string, field: 'instrument.name' },
  {
    title: 'Local contact',
    render: (rowData) => getFullUserName(rowData.localContact),
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

type UserUpcomingExperimentsTableProps = {
  /** Render nothing at all when there are no upcoming experiments. */
  hideIfEmpty?: boolean;
};

export default function UserUpcomingExperimentsTable({
  hideIfEmpty = true,
}: UserUpcomingExperimentsTableProps) {
  const {
    loading: experimentsLoading,
    userExperiments,
    setUserUpcomingExperiments,
  } = useUserExperiments({ notDraft: true, onlyUpcoming: true });
  const isMobile = useIsMobile();
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const { t } = useTranslation();

  const [modalContents, setModalContents] = useState<ReactNode>(null);

  const {
    formTeamAction,
    finishEsi,
    registerVisitAction,
    declareShipmentAction,
    giveFeedback,
  } = useActionButtons({
    openModal: (contents) => setModalContents(contents),
    closeModal: () => {
      setModalContents(null);
    },
    eventUpdated: (updatedExperiment) => {
      const updatedExperiments = userExperiments.map((experiment) =>
        experiment?.experimentPk === updatedExperiment?.experimentPk
          ? updatedExperiment
          : experiment
      );
      setUserUpcomingExperiments(updatedExperiments);
    },
  });

  const context = useContext(FeatureContext);
  const isShipmentActionEnabled = !!context.featuresMap.get(FeatureId.SHIPPING)
    ?.isEnabled;

  // if there are no upcoming experiments, the dashboard hides the table
  // altogether; the standalone page keeps it and shows its empty state
  if (hideIfEmpty && userExperiments.length === 0) {
    return null;
  }

  const userExperimentsWithFormattedDates = userExperiments.map(
    (experiment) => ({
      ...experiment,
      startsAtFormatted: toFormattedDateTime(experiment.startsAt),
      endsAtFormatted: toFormattedDateTime(experiment.endsAt),
    })
  );

  return (
    <div data-cy="upcoming-experiments">
      <MaterialTable
        actions={[
          formTeamAction,
          finishEsi,
          registerVisitAction,
          ...(isShipmentActionEnabled ? [declareShipmentAction] : []),
          giveFeedback,
        ]}
        icons={tableIcons}
        title="Upcoming experiments"
        isLoading={experimentsLoading}
        columns={columns(t)}
        data={userExperimentsWithFormattedDates}
        components={rowComponents(isMobile)}
        options={{
          search: false,
          padding: 'dense',
          emptyRowsWhenPaging: false,
          paging: false,
          actionsColumnIndex: -1,
          header: !isMobile,
        }}
      />
      <Dialog
        open={modalContents !== null}
        onClose={() => setModalContents(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>{modalContents}</DialogContent>
      </Dialog>
    </div>
  );
}
