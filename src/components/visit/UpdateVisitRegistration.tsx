import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useVisitRegistration } from 'hooks/visit/useVisitRegistration';
import { RegistrationBasic } from 'models/VisitSubmissionState';

import VisitRegistrationContainer from './VisitRegistrationContainer';

interface UpdateVisitRegistrationProps {
  visitRegistration: RegistrationBasic;
  onUpdate?: (registration: RegistrationBasic) => void;
  onSubmitted?: (registration: RegistrationBasic) => void;
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
