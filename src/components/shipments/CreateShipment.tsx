import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  BasicUserDetails,
  QuestionaryStep,
  ShipmentFragment,
  ShipmentStatus,
  TemplateCategoryId,
  VisitFragment,
} from 'generated/sdk';
import {
  ShipmentBasic,
  ShipmentExtended,
} from 'models/ShipmentSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ShipmentContainer from './ShipmentContainer';

function createShipmentStub(
  creator: BasicUserDetails,
  questionarySteps: QuestionaryStep[],
  templateId: number,
  visitId: number,
  proposalPk: number
): ShipmentExtended {
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
    },
    proposal: {
      proposalId: '123456',
    },
    samples: [],
  };
}

interface CreateShipmentProps {
  visit: VisitFragment & {
    shipments: ShipmentFragment[];
  };
  onShipmentSubmitted: (shipment: ShipmentBasic) => void;
}
function CreateShipment({ visit, onShipmentSubmitted }: CreateShipmentProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [blankShipment, setBlankShipment] = useState<ShipmentExtended>();
  const [
    noActiveShipmentTemplates,
    setNoActiveShipmentTemplates,
  ] = useState<boolean>(false);

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateCategoryId: TemplateCategoryId.SHIPMENT_DECLARATION,
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
