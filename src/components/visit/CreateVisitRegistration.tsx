import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { QuestionaryStep, TemplateCategoryId } from 'generated/sdk';
import {
  RegistrationBasic,
  RegistrationExtended,
} from 'models/VisitSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import VisitRegistrationContainer from './VisitRegistrationContainer';

function createRegistrationStub(
  userId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[],
  visitId: number
): RegistrationExtended {
  return {
    userId: userId,
    registrationQuestionaryId: 0,
    isRegistrationSubmitted: false,
    trainingExpiryDate: null,
    visitId: visitId,
    user: {
      firstname: '',
      lastname: '',
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
  onCreate?: (visit: RegistrationBasic) => void;
  onUpdate?: (visit: RegistrationBasic) => void;
  onSubmitted?: (visit: RegistrationBasic) => void;
  visitId: number;
}
function CreateVisit({
  onCreate,
  onUpdate,
  onSubmitted,
  visitId,
}: CreateVisitProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [
    blankRegistration,
    setBlankRegistration,
  ] = useState<RegistrationExtended>();

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateCategoryId: TemplateCategoryId.VISIT,
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
      onCreate={onCreate}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default CreateVisit;
