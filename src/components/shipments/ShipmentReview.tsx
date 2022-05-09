import GetAppIcon from '@mui/icons-material/GetApp';
import { Link } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
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

const useStyles = makeStyles(() => ({
  sampleList: {
    listStyle: 'none',
    padding: 0,
  },
}));

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
  const classes = useStyles();

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
        <ul className={classes.sampleList}>
          {state.shipment.samples.map((sample) => (
            <li key={sample.id}>{sample.title}</li>
          ))}
        </ul>
      ),
    },
  ];

  const isSubmitted = state.shipment.status === ShipmentStatus.SUBMITTED;

  return (
    <>
      <QuestionaryDetails
        questionaryId={state.shipment.questionaryId}
        additionalDetails={additionalDetails}
        title="Shipment information"
      />
      <NavigationFragment isLoading={isExecutingCall}>
        <NavigButton
          onClick={() =>
            confirm(
              async () => {
                const result = await api().submitShipment({
                  shipmentId: state.shipment.id,
                });
                if (!result.submitShipment.shipment) {
                  return;
                }
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                  itemWithQuestionary: result.submitShipment.shipment,
                });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                  itemWithQuestionary: result.submitShipment.shipment,
                });
              },
              {
                title: 'Confirmation',
                description:
                  'I am aware that no further edits can be done after shipment submission.',
              }
            )()
          }
          disabled={isSubmitted || isExecutingCall}
        >
          {isSubmitted ? '✔ Submitted' : 'Submit'}
        </NavigButton>
        {state.shipment.status === ShipmentStatus.SUBMITTED && (
          <NavigButton
            onClick={() =>
              downloadShipmentLabel(
                [state.shipment.id],
                `${state.shipment.title}.pdf`
              )
            }
            startIcon={<GetAppIcon />}
            color="secondary"
            data-cy="download-shipment-label"
          >
            Download shipment label
          </NavigButton>
        )}
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ShipmentReview);
