import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  BasicUserDetails,
  QuestionaryStep,
  ShipmentStatus,
  TemplateGroupId,
  VisitFragment,
} from 'generated/sdk';
import { ShipmentCore } from 'models/questionary/shipment/ShipmentCore';
import { ShipmentWithQuestionary } from 'models/questionary/shipment/ShipmentWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ShipmentContainer from './ShipmentContainer';

function createShipmentStub(
  creator: BasicUserDetails,
  questionarySteps: QuestionaryStep[],
  templateId: number,
  visitId: number,
  proposalPk: number
): ShipmentWithQuestionary {
  return {
    id: 0,
    title: '',
    status: ShipmentStatus.DRAFT,
    externalRef: '',
    questionaryId: 0,
    visitId: visitId,
    created: new Date(),
    creatorId: creator.id,
    proposalPk: proposalPk,
    questionary: {
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
      isCompleted: false,
    },
    proposal: {
      proposalId: '123456',
    },
    samples: [],
  };
}

interface CreateShipmentProps {
  visit: VisitFragment & {
    // potentially we will have many shipments associated with the visit
    shipments: ShipmentCore[];
  };
  // for now only one shipment
  onShipmentSubmitted: (shipment: ShipmentCore) => void;
}
function CreateShipment({ visit, onShipmentSubmitted }: CreateShipmentProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [blankShipment, setBlankShipment] = useState<ShipmentWithQuestionary>();
  const [
    noActiveShipmentTemplates,
    setNoActiveShipmentTemplates,
  ] = useState<boolean>(false);

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateGroupId: TemplateGroupId.SHIPMENT,
      })
      .then((data) => {
        if (data.activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: data.activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const blankShipment = createShipmentStub(
                  user,
                  result.blankQuestionarySteps,
                  data.activeTemplateId!,
                  visit.id,
                  visit.proposalPk
                );
                setBlankShipment(blankShipment);
              }
              setNoActiveShipmentTemplates(false);
            });
        } else {
          setNoActiveShipmentTemplates(true);
        }
      });
  }, [setBlankShipment, api, user, visit]);

  if (noActiveShipmentTemplates) {
    return <div>No active templates found</div>;
  }

  if (!blankShipment) {
    return <UOLoader />;
  }

  return (
    <ShipmentContainer
      shipment={blankShipment}
      onShipmentSubmitted={onShipmentSubmitted}
    />
  );
}

export default CreateShipment;
