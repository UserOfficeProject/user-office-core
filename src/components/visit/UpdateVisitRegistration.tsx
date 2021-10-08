import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useVisitRegistration } from 'hooks/visit/useVisitRegistration';
import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';

import VisitRegistrationContainer from './VisitRegistrationContainer';

interface UpdateVisitRegistrationProps {
  visitRegistration: VisitRegistrationCore;
  onUpdate?: (registration: VisitRegistrationCore) => void;
  onSubmitted?: (registration: VisitRegistrationCore) => void;
}

function UpdateVisitRegistration({
  visitRegistration,
  onUpdate,
  onSubmitted,
}: UpdateVisitRegistrationProps) {
  const { registration } = useVisitRegistration(visitRegistration.visitId);

  if (!registration) {
    return <UOLoader />;
  }

  return (
    <VisitRegistrationContainer
      registration={registration}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default UpdateVisitRegistration;
