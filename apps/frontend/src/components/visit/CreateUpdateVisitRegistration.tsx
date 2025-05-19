import React from 'react';

import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';

import CreateVisitRegistration from './CreateVisitRegistration';
import UpdateVisitRegistration from './UpdateVisitRegistration';

type CreateUpdateVisitRegistrationProps = {
  onSubmitted?: (registration: VisitRegistrationCore) => void;
  registration: VisitRegistrationCore;
};

function CreateUpdateVisitRegistration({
  registration,
  onSubmitted,
}: CreateUpdateVisitRegistrationProps) {
  const hasQuestionary = !!registration.registrationQuestionaryId;

  return hasQuestionary ? (
    <UpdateVisitRegistration
      visitRegistration={registration}
      onSubmitted={onSubmitted}
    />
  ) : (
    <CreateVisitRegistration
      visitId={registration.visitId}
      onSubmitted={onSubmitted}
    />
  );
}

export default CreateUpdateVisitRegistration;
