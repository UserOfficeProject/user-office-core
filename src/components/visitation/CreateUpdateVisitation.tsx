import React from 'react';

import { VisitationBasic } from 'models/VisitationSubmissionState';

import CreateVisitation from './CreateVisitation';
import UpdateVisitation from './UpdateVisitation';

type CreateUpdateVisitationProps = {
  onCreate?: (visitation: VisitationBasic) => void;
  onUpdate?: (visitation: VisitationBasic) => void;
  visitation: VisitationBasic | null;
};

function CreateUpdateVisitation({
  visitation,
  onCreate,
  onUpdate,
}: CreateUpdateVisitationProps) {
  return visitation ? (
    <UpdateVisitation visitation={visitation} onUpdate={onUpdate} />
  ) : (
    <CreateVisitation onCreate={onCreate} onUpdate={onUpdate} />
  );
}

export default CreateUpdateVisitation;
