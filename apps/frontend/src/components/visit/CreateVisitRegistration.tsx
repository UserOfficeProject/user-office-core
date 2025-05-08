import Alert from '@mui/material/Alert'; // Added Alert for error display
import React from 'react'; // Removed useContext, useEffect, useState

import UOLoader from 'components/common/UOLoader';
import { useBlankVisitRegistration } from 'hooks/visit/useBlankVisitRegistration'; // Added import for the new hook
import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';

import VisitRegistrationContainer from './VisitRegistrationContainer';

interface CreateVisitProps {
  onCreate?: (visit: VisitRegistrationCore) => void;
  onUpdate?: (visit: VisitRegistrationCore) => void;
  onSubmitted?: (visit: VisitRegistrationCore) => void;
  visitId: number;
}
function CreateVisit({ onSubmitted, visitId }: CreateVisitProps) {
  const { blankRegistration, error: blankRegistrationError } =
    useBlankVisitRegistration(visitId);

  if (blankRegistrationError) {
    return (
      <Alert severity="error">
        <strong>Error:</strong>
        {blankRegistrationError}
      </Alert>
    );
  }

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
