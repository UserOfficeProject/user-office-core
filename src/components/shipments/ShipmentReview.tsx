import {
  Link,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { ShipmentStatus } from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ShipmentContextType } from './ShipmentContainer';

interface ShipmentReviewProps {
  isReadonly: boolean;
  onComplete?: () => any;
  confirm: WithConfirmType;
}

const useStyles = makeStyles(theme => ({
  table: {
    margin: '5px 0 40px 0',
  },
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
  const { api } = useDataApiWithFeedback();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ShipmentContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { proposalData } = useProposalData(state.shipment.proposalId);
  const history = useHistory();
  const classes = useStyles();

  if (!proposalData) {
    return <UOLoader />;
  }

  return (
    <div>
      <Typography variant={'h6'}>Shipment details</Typography>
      <Table size={'small'} className={classes.table}>
        <TableBody>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>{state.shipment.title}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>{state.shipment.status}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Proposal</TableCell>
            <TableCell>
              <Link
                href="#"
                onClick={() => history.push(`/ProposalEdit/${proposalData.id}`)}
              >
                {proposalData.title}
              </Link>
            </TableCell>
          </TableRow>
          {state.shipment.samples.length > 0 && (
            <TableRow>
              <TableCell>Samples</TableCell>
              <TableCell>
                <ul className={classes.sampleList}>
                  {state.shipment.samples.map(sample => (
                    <li key={sample.id}>{sample.title}</li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Typography variant={'h6'}>Questionary details</Typography>
      <QuestionaryDetails
        questionaryId={state.shipment.questionaryId}
        className={classes.table}
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
          isLoading={false}
        />
      </div>
    </div>
  );
}

export default withConfirm(ShipmentReview);
