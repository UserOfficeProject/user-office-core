import { Typography } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import React from 'react';
import { useQueryParams } from 'use-query-params';

import {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { SuperMaterialTable } from 'components/common/SuperMaterialTable';
import UOLoader from 'components/common/UOLoader';
import { VisitStatus } from 'generated/sdk';
import { useMyVisits } from 'hooks/visit/useMyVisits';
import { VisitBasic } from 'models/VisitSubmissionState';
import { tableIcons } from 'utils/materialIcons';
import { tableLocalization } from 'utils/materialLocalization';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CreateUpdateVisit from './CreateUpdateVisit';

const VisitsTable = (props: { confirm: WithConfirmType }) => {
  const { loadingVisits, visits, setVisits } = useMyVisits();
  const [
    urlQueryParams,
    setUrlQueryParams,
  ] = useQueryParams<UrlQueryParamsType>(DefaultQueryParams);
  const { api } = useDataApiWithFeedback();

  if (!visits) {
    return <UOLoader />;
  }

  const columns = [
    { title: 'Proposal', field: 'proposal.title' },
    { title: 'Instrument', field: 'proposal.instrument.name' },
    { title: 'Visit status', field: 'status' },
  ];

  const deleteHandler = (visitToDelete: VisitBasic) => {
    props.confirm(
      () => {
        api('Visit deleted')
          .deleteVisit({
            visitId: visitToDelete.id,
          })
          .then((data) => {
            if (!data.deleteVisit.rejection) {
              setVisits(
                visits.filter((visit) => visit.id !== visitToDelete.id)
              );
            }
          });
      },
      {
        title: 'Are you sure?',
        description: `Are you sure you want to delete the visit?`,
      }
    )();
  };

  const createModal = (
    onUpdate: (object: VisitBasic, shouldCloseAfterUpdate: boolean) => void,
    onCreate: (object: VisitBasic, shouldCloseAfterCreation: boolean) => void,
    editVisit: VisitBasic | null
  ) => (
    <CreateUpdateVisit
      visit={editVisit}
      onCreate={(visit) => onCreate({ ...visit }, false)} // clone the object because it is immutable because of immer
      onUpdate={(visit) => onUpdate({ ...visit }, false)} // clone the object because it is immutable because of immer
    />
  );

  return (
    <div data-cy="visits-table">
      <SuperMaterialTable
        setData={setVisits}
        createModal={createModal}
        hasAccess={{ update: true, create: true, remove: true }}
        icons={tableIcons}
        localization={tableLocalization}
        title={
          <Typography variant="h6" component="h2">
            {'Visits'}
          </Typography>
        }
        columns={columns}
        isLoading={loadingVisits}
        data={visits}
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
        actions={[
          (rowData) => {
            const readOnly = rowData.status === VisitStatus.ACCEPTED;

            return {
              icon: Delete,
              tooltip: 'Delete visit',
              onClick: (_event, rowData) =>
                deleteHandler(rowData as VisitBasic),
              disabled: readOnly,
            };
          },
        ]}
      />
    </div>
  );
};

export default withConfirm(VisitsTable);
