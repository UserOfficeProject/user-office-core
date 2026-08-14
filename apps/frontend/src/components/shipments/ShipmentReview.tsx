import GetAppIcon from '@mui/icons-material/GetApp';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React, { useContext } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import UOLoader from 'components/common/UOLoader';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { ShipmentStatus } from 'generated/sdk';
import { useDownloadPDFShipmentLabel } from 'hooks/proposal/useDownloadPDFShipmentLabel';
import { useProposalData } from 'hooks/proposal/useProposalData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ShipmentContextType } from './ShipmentContainer';

type ShipmentReviewProps = {
  confirm: WithConfirmType;
};

function ShipmentReview({ confirm }: ShipmentReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ShipmentContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { proposalData } = useProposalData(state.shipment.proposalPk);
  const downloadShipmentLabel = useDownloadPDFShipmentLabel();

  if (!proposalData) {
    return <UOLoader />;
  }

  const additionalDetails: TableRowData[] = [
    { label: 'Title', value: state.shipment.title },
    { label: 'Status', value: state.shipment.status },
    {
      label: 'Proposal',
      value: (
        <Link href={`/ProposalEdit/${proposalData.primaryKey}`}>
          {proposalData.title}
        </Link>
      ),
    },
    { label: 'Proposal ID', value: state.shipment.proposal.proposalId },
    {
      label: 'Samples',
      value: (
        <List sx={{ listStyle: 'none', padding: 0 }}>
          {state.shipment.samples.map((sample) => (
            <ListItem key={sample.id}>{sample.title}</ListItem>
          ))}
        </List>
      ),
    },
  ];

  const isSubmitted = state.shipment.status === ShipmentStatus.SUBMITTED;

  const primary = {
    label: isSubmitted ? '✔ Submitted' : 'Submit',
    onClick: () =>
      confirm(
        async () => {
          const { submitShipment } = await api().submitShipment({
            shipmentId: state.shipment.id,
          });
          dispatch({
            type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
            itemWithQuestionary: submitShipment,
          });
          dispatch({
            type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
            itemWithQuestionary: submitShipment,
          });
        },
        {
          title: 'Confirmation',
          description:
            'I am aware that no further edits can be done after shipment submission.',
        }
      )(),
    disabled: isSubmitted || isExecutingCall,
  };
  const save = isSubmitted
    ? {
        label: 'Download shipment label',
        onClick: () =>
          downloadShipmentLabel(
            [state.shipment.id],
            `${state.shipment.title}.pdf`
          ),
      }
    : undefined;

  return (
    <>
      <QuestionaryDetails
        questionaryId={state.shipment.questionaryId}
        additionalDetails={additionalDetails}
        title="Shipment information"
      />
      <NavigationFragment
        isLoading={isExecutingCall}
        actions={{ save, primary }}
      >
        <NavigButton onClick={primary.onClick} disabled={primary.disabled}>
          {primary.label}
        </NavigButton>
        {save && (
          <NavigButton
            onClick={save.onClick}
            startIcon={<GetAppIcon />}
            color="secondary"
            data-cy="download-shipment-label"
          >
            {save.label}
          </NavigButton>
        )}
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ShipmentReview);
