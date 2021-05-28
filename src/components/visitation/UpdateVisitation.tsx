import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useVisitation } from 'hooks/visitation/useVisitation';
import { VisitationBasic } from 'models/VisitationSubmissionState';

import VisitationContainer from './VisitationContainer';

interface UpdateVisitationProps {
  visitation: VisitationBasic;
  onUpdate?: (visitation: VisitationBasic) => void;
}

function UpdateVisitation({
  onUpdate,
  visitation: { id },
}: UpdateVisitationProps) {
  const { visitation } = useVisitation(id);

  if (!visitation) {
    return <UOLoader />;
  }

  return <VisitationContainer visitation={visitation} onUpdate={onUpdate} />;
}

export default UpdateVisitation;
