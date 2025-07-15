import MaterialTable from '@material-table/core';
import { Delete } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Call, InstrumentMinimalFragment } from 'generated/sdk';
import { TagData } from 'hooks/tag/useTagsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export const TagDetailsPanel = ({
  tag,
  removeInstrument,
  removeCall,
}: {
  tag: TagData;
  removeInstrument: (instrumentId: number, tagId: number) => void;
  removeCall: (callId: number, tagId: number) => void;
}) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const callRowActions = [
    {
      icon: () => <Delete />,
      tooltip: 'Remove Call',
      onClick: (
        event: React.MouseEvent<HTMLElement>,
        rowData:
          | Pick<Call, 'id' | 'shortCode'>
          | Pick<Call, 'id' | 'shortCode'>[]
      ) => {
        // It will always be a singleton not a array but the type checker needs the array
        const call = rowData as Pick<Call, 'id' | 'shortCode'>;

        api().removeCallFromTag({
          callId: call.id,
          tagId: tag.id,
        });
        removeCall(call.id, tag.id);
      },
    },
  ];

  const instrumentRowActions = [
    {
      icon: () => <Delete />,
      tooltip: `Remove ${t('instrument')}`,
      onClick: (
        event: React.MouseEvent<JSX.Element>,
        rowData: InstrumentMinimalFragment | InstrumentMinimalFragment[]
      ) => {
        const instrument = rowData as InstrumentMinimalFragment;

        api().removeInstrumentFromTag({
          instrumentId: instrument.id,
          tagId: tag.id,
        });
        removeInstrument(instrument.id, tag.id);
      },
    },
  ];

  return (
    <>
      <MaterialTable
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Description', field: 'description' },
        ]}
        data={tag.instruments}
        isLoading={isExecutingCall}
        title="Instruments"
        options={{
          selection: false,
        }}
        actions={instrumentRowActions}
      />
      <MaterialTable
        columns={[{ title: 'ShortCode', field: 'shortCode' }]}
        data={tag.calls}
        isLoading={isExecutingCall}
        title="Calls"
        options={{
          selection: false,
        }}
        actions={callRowActions}
      />
    </>
  );
};
