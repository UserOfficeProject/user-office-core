import { Delete } from '@material-ui/icons';
import React from 'react';
import { useQueryParams } from 'use-query-params';

import {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { SuperMaterialTable } from 'components/common/SuperMaterialTable';
import UOLoader from 'components/common/UOLoader';
import { VisitationStatus } from 'generated/sdk';
import { useMyVisitations } from 'hooks/visitation/useMyVisitations';
import { VisitationBasic } from 'models/VisitationSubmissionState';
import { tableIcons } from 'utils/materialIcons';
import { tableLocalization } from 'utils/materialLocalization';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CreateUpdateVisitation from './CreateUpdateVisitation';

const VisitationsTable = (props: { confirm: WithConfirmType }) => {
  const {
    loadingVisitations,
    visitations,
    setVisitations,
  } = useMyVisitations();
  const [
    urlQueryParams,
    setUrlQueryParams,
  ] = useQueryParams<UrlQueryParamsType>(DefaultQueryParams);
  const { api } = useDataApiWithFeedback();

  if (!visitations) {
    return <UOLoader />;
  }

  const columns = [
    { title: 'Proposal', field: 'proposal.title' },
    { title: 'Instrument', field: 'proposal.instrument.name' },
    { title: 'Visitation status', field: 'status' },
  ];

  const deleteHandler = (visitationToDelete: VisitationBasic) => {
    props.confirm(
      () => {
        api('Visitation deleted')
          .deleteVisitation({
            visitationId: visitationToDelete.id,
          })
          .then((data) => {
            if (!data.deleteVisitation.rejection) {
              setVisitations(
                visitations.filter(
                  (visitation) => visitation.id !== visitationToDelete.id
                )
              );
            }
          });
      },
      {
        title: 'Are you sure?',
        description: `Are you sure you want to delete the visitation?`,
      }
    )();
  };

  const createModal = (
    onUpdate: (
      object: VisitationBasic,
      shouldCloseAfterUpdate: boolean
    ) => void,
    onCreate: (
      object: VisitationBasic,
      shouldCloseAfterCreation: boolean
    ) => void,
    editVisitation: VisitationBasic | null
  ) => (
    <CreateUpdateVisitation
      visitation={editVisitation}
      onCreate={(visitation) => onCreate({ ...visitation }, false)} // clone the object because it is immutable because of immer
      onUpdate={(visitation) => onUpdate({ ...visitation }, false)} // clone the object because it is immutable because of immer
    />
  );

  return (
    <div data-cy="visitations-table">
      <SuperMaterialTable
        setData={setVisitations}
        createModal={createModal}
        hasAccess={{ update: true, create: true, remove: true }}
        icons={tableIcons}
        localization={tableLocalization}
        title="Visitations"
        columns={columns}
        isLoading={loadingVisitations}
        data={visitations}
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
        actions={[
          (rowData) => {
            const readOnly = rowData.status === VisitationStatus.ACCEPTED;

            return {
              icon: Delete,
              tooltip: 'Delete visitation',
              onClick: (_event, rowData) =>
                deleteHandler(rowData as VisitationBasic),
              disabled: readOnly,
            };
          },
        ]}
      />
    </div>
  );
};

export default withConfirm(VisitationsTable);
