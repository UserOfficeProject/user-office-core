import React, { useContext } from 'react';

import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { ShipmentStatus } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ShipmentContextType } from './ShipmentContainer';

interface ShipmentReviewProps {
  isReadonly: boolean;
  onComplete?: () => any;
  confirm: WithConfirmType;
}
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

  return (
    <div>
      <QuestionaryDetails questionaryId={state.shipment.questionaryId} />
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
                    'I am aware that no further edits can be done after proposal submission.',
                }
              )(),
            label: 'Finish',
          }}
          isLoading={false}
        />
      </div>
    </div>
  );
}

export default withConfirm(ShipmentReview);
