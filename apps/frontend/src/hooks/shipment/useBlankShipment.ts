import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  GetShipmentQuery,
  QuestionaryStep,
  ShipmentStatus,
  TemplateGroupId,
  User,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ShipmentWithQuestionary } from 'models/questionary/shipment/ShipmentWithQuestionary';

export function createShipmentStub(
  creator: Pick<User, 'id'>,
  questionarySteps: QuestionaryStep[],
  templateId: number,
  experimentPk: number,
  proposalPk: number
): ShipmentWithQuestionary {
  return {
    id: 0,
    title: '',
    status: ShipmentStatus.DRAFT,
    externalRef: '',
    questionaryId: 0,
    experimentPk,
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

export function useBlankShipment(
  experimentPk?: number | null,
  proposalPk?: number | null
) {
  const [blankShipment, setBlankShipment] = useState<
    GetShipmentQuery['shipment'] | null
  >(null);

  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(UserContext);

  const api = useDataApi();

  useEffect(() => {
    if (!experimentPk || !proposalPk) {
      return;
    }
    api()
      .getActiveTemplateId({
        templateGroupId: TemplateGroupId.SHIPMENT,
      })
      .then(({ activeTemplateId }) => {
        if (activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const blankShipment = createShipmentStub(
                  user,
                  result.blankQuestionarySteps,
                  activeTemplateId,
                  experimentPk,
                  proposalPk!
                );
                setBlankShipment(blankShipment);
                setError(null);
              } else {
                setError('Could not create shipment stub');
              }
            });
        } else {
          setError('There is no active shipment template');
        }
      });
  }, [api, user, experimentPk, proposalPk]);

  return { blankShipment, error };
}
