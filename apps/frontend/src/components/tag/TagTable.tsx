import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ScienceIcon from 'components/common/icons/ScienceIcon';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { Call, InstrumentMinimalFragment } from 'generated/sdk';
import { TagData, useTagsData } from 'hooks/tag/useTagsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import { CreateUpdateTag } from './CreateUpdateTag';
import { SelectCallModel } from './SelectCallModel';
import { SelectInstrumentModel } from './SelectInstrumentModel';
import { TagDetailsPanel } from './TagDetailsPanel';

const tagsColumns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Short code',
    field: 'shortCode',
  },
];

const TagTable = () => {
  const { tags, loadingTags, setTagsWithLoading } = useTagsData();
  const [assigningCallTagId, setAssigningCallTagId] = useState<number | null>(
    null
  );
  const [assigningInstrumentTagId, setAssigningInstrumentTagId] = useState<
    number | null
  >(null);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const createModal = (
    onUpdate: FunctionType<void, [TagData | null]>,
    onCreate: FunctionType<void, [TagData | null]>,
    editTag: TagData | null
  ) => (
    <CreateUpdateTag
      tag={editTag}
      close={(call): void => {
        !!editTag ? onUpdate(call) : onCreate(call);
      }}
    />
  );
  const assignInstrumentsToTag = async (
    instruments: InstrumentMinimalFragment[]
  ) => {
    api().assignInstrumentsToTag({
      instrumentIds: instruments.map((instrument) => instrument.id),
      tagId: assigningInstrumentTagId as number,
    });
    setTagsWithLoading(
      tags.map((tag) =>
        tag.id === assigningInstrumentTagId
          ? {
              ...tag,
              instruments: tag.instruments.concat(instruments),
            }
          : tag
      )
    );
    setAssigningInstrumentTagId(null);
  };

  const assignCallsToTag = async (calls: Pick<Call, 'id' | 'shortCode'>[]) => {
    api().assignCallsToTag({
      callIds: calls.map((call) => call.id),
      tagId: assigningCallTagId as number,
    });

    setTagsWithLoading(
      tags.map((tag) =>
        tag.id === assigningCallTagId
          ? {
              ...tag,
              calls: tag.calls.concat(calls),
            }
          : tag
      )
    );

    setAssigningCallTagId(null);
  };

  const AssignInstrumentIcon = (): JSX.Element => <ScienceIcon />;

  const AssignCallIcon = (): JSX.Element => <CalendarTodayIcon />;

  const instrumentsAssignments = tags?.find(
    (tag) => tag.id === assigningInstrumentTagId
  );

  const callAssignments = tags?.find((tag) => tag.id === assigningCallTagId);

  const removeInstrument = (instrumentId: number, tagId: number) => {
    setTagsWithLoading(
      tags.map((tag) =>
        tag.id === tagId
          ? {
              ...tag,
              instruments: tag.instruments.filter((i) => i.id !== instrumentId),
            }
          : tag
      )
    );
  };

  const removeCall = (callId: number, tagId: number) => {
    setTagsWithLoading(
      tags.map((tag) =>
        tag.id === tagId
          ? {
              ...tag,
              calls: tag.calls.filter((i) => i.id !== callId),
            }
          : tag
      )
    );
  };

  return (
    <>
      <SelectInstrumentModel
        tagId={assigningInstrumentTagId ?? 0}
        preSelectedInstruments={instrumentsAssignments?.instruments.map(
          (instrument) => instrument.id
        )}
        open={!!assigningInstrumentTagId}
        close={(): void => setAssigningInstrumentTagId(null)}
        addInstruments={assignInstrumentsToTag}
      />
      <SelectCallModel
        tagId={assigningCallTagId ?? 0}
        preSelectedCalls={callAssignments?.calls.map((call) => call.id)}
        open={!!assigningCallTagId}
        close={(): void => setAssigningCallTagId(null)}
        addCalls={assignCallsToTag}
      />
      <div data-cy="tag-table">
        <SuperMaterialTable
          columns={tagsColumns}
          createModal={createModal}
          title={'Tags'}
          data={tags}
          options={{
            search: false,
            paging: false,
          }}
          isLoading={loadingTags || isExecutingCall}
          setData={setTagsWithLoading}
          detailPanel={(rowData) => {
            return (
              <TagDetailsPanel
                tag={rowData.rowData}
                removeInstrument={removeInstrument}
                removeCall={removeCall}
              />
            );
          }}
          actions={[
            {
              icon: AssignInstrumentIcon,
              tooltip: `Assign ${t('instrument')}`,
              onClick: (_event, rowdata) => {
                setAssigningInstrumentTagId((rowdata as TagData).id);
              },
            },
            {
              icon: AssignCallIcon,
              tooltip: `Assign Call`,
              onClick: (_event, rowdata) => {
                setAssigningCallTagId((rowdata as TagData).id);
              },
            },
          ]}
        />
      </div>
    </>
  );
};

export default TagTable;
