import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { QuestionaryStep, TemplateGroupId } from 'generated/sdk';
import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';
import { RegistrationWithQuestionary } from 'models/questionary/visit/VisitRegistrationWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import VisitRegistrationContainer from './VisitRegistrationContainer';

function createRegistrationStub(
  userId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[],
  visitId: number
): RegistrationWithQuestionary {
  return {
    userId: userId,
    registrationQuestionaryId: 0,
    isRegistrationSubmitted: false,
    trainingExpiryDate: null,
    startsAt: null,
    endsAt: null,
    visitId: visitId,
    user: {
      firstname: '',
      lastname: '',
      preferredname: '',
      id: userId,
      created: new Date(),
      organisation: '',
      placeholder: false,
      position: '',
    },
    questionary: {
      isCompleted: false,
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
  };
}

interface CreateVisitProps {
  onCreate?: (visit: VisitRegistrationCore) => void;
  onUpdate?: (visit: VisitRegistrationCore) => void;
  onSubmitted?: (visit: VisitRegistrationCore) => void;
  visitId: number;
}
function CreateVisit({ onSubmitted, visitId }: CreateVisitProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [blankRegistration, setBlankRegistration] =
    useState<RegistrationWithQuestionary>();

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateGroupId: TemplateGroupId.VISIT_REGISTRATION,
      })
      .then(({ activeTemplateId }) => {
        if (activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const blankRegistration = createRegistrationStub(
                  user.id,
                  activeTemplateId,
                  result.blankQuestionarySteps,
                  visitId
                );
                setBlankRegistration(blankRegistration);
              }
            });
        }
      });
  }, [setBlankRegistration, api, user, visitId]);

  if (!blankRegistration) {
    return <UOLoader />;
  }

  return (
    <VisitRegistrationContainer
      registration={blankRegistration}
      onSubmitted={onSubmitted}
    />
  );
}

export default CreateVisit;
