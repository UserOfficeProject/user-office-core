import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useVisit } from 'hooks/visit/useVisit';
import { VisitBasic } from 'models/VisitSubmissionState';

import VisitContainer from './VisitContainer';

interface UpdateVisitProps {
  visit: VisitBasic;
  onUpdate?: (visit: VisitBasic) => void;
}

function UpdateVisit({ onUpdate, visit: { id } }: UpdateVisitProps) {
  const { visit } = useVisit(id);

  if (!visit) {
    return <UOLoader />;
  }

  return <VisitContainer visit={visit} onUpdate={onUpdate} />;
}

export default UpdateVisit;
