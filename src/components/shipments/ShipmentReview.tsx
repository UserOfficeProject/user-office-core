import { Link, makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

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
import { useProposalData } from 'hooks/proposal/useProposalData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ShipmentContextType } from './ShipmentContainer';

type ShipmentReviewProps = {
  isReadonly: boolean;
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

const useStyles = makeStyles(() => ({
  sampleList: {
    listStyle: 'none',
    padding: 0,
  },
}));

function ShipmentReview({
  isReadonly,
  onComplete,
  confirm,
}: ShipmentReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ShipmentContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { proposalData } = useProposalData(state.shipment.proposalId);
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

  return (
    <div>
      <QuestionaryDetails
        questionaryId={state.shipment.questionaryId}
        additionalDetails={additionalDetails}
        title="Shipment information"
      />
      <div>
        <NavigationFragment
          disabled={isReadonly}
          back={undefined}
          saveAndNext={{
            callback: () =>
              confirm(
                async () => {
                  await api().updateShipment({
                    shipmentId: state.shipment.id,
                    status: ShipmentStatus.SUBMITTED,
                  });
                  onComplete?.();
                },
                {
                  title: 'Confirmation',
                  description:
                    'I am aware that no further edits can be done after shipment submission.',
                }
              )(),
            label: 'Submit',
          }}
          isLoading={isExecutingCall}
        />
      </div>
    </div>
  );
}

export default withConfirm(ShipmentReview);
