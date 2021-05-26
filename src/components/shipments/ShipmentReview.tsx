import { Link, makeStyles } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
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
import { EventType } from 'models/QuestionarySubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ShipmentContextType } from './ShipmentContainer';

type ShipmentReviewProps = {
  onComplete?: FunctionType<void>;
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

  const { proposalData } = useProposalData(state.shipment.proposalId);
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
        <Link href={`/ProposalEdit/${proposalData.id}`}>
          {proposalData.title}
        </Link>
      ),
    },
    { label: 'Proposal ID', value: state.shipment.proposal.shortCode },
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
    <div>
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
                dispatch({
                  type: EventType.SHIPMENT_MODIFIED,
                  payload: { shipment: result.submitShipment.shipment },
                });
              },
              {
                title: 'Confirmation',
                description:
                  'I am aware that no further edits can be done after shipment submission.',
              }
            )()
          }
          disabled={isSubmitted}
          variant="contained"
          color="primary"
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
            variant="contained"
            color="secondary"
            data-cy="download-shipment-label"
          >
            Download shipment label
          </NavigButton>
        )}
      </NavigationFragment>
    </div>
  );
}

export default withConfirm(ShipmentReview);
