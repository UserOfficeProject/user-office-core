import React from 'react';

import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';

import CreateVisitRegistration from './CreateVisitRegistration';
import UpdateVisitRegistration from './UpdateVisitRegistration';

type CreateUpdateVisitRegistrationProps = {
  onCreate?: (registration: VisitRegistrationCore) => void;
  onUpdate?: (registration: VisitRegistrationCore) => void;
  onSubmitted?: (registration: VisitRegistrationCore) => void;
  registration: VisitRegistrationCore;
};

function CreateUpdateVisitRegistration({
  registration,
  onCreate,
  onUpdate,
  onSubmitted,
}: CreateUpdateVisitRegistrationProps) {
  const hasQuestionary = !!registration.registrationQuestionaryId;

  return hasQuestionary ? (
    <UpdateVisitRegistration
      visitRegistration={registration}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  ) : (
    <CreateVisitRegistration
      visitId={registration.visitId}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default CreateUpdateVisitRegistration;
