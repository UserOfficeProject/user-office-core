import React from 'react';

import { VisitBasic } from 'models/VisitSubmissionState';

import CreateVisit from './CreateVisit';
import UpdateVisit from './UpdateVisit';

type CreateUpdateVisitProps = {
  onCreate?: (visit: VisitBasic) => void;
  onUpdate?: (visit: VisitBasic) => void;
  visit: VisitBasic | null;
};

function CreateUpdateVisit({
  visit,
  onCreate,
  onUpdate,
}: CreateUpdateVisitProps) {
  return visit ? (
    <UpdateVisit visit={visit} onUpdate={onUpdate} />
  ) : (
    <CreateVisit onCreate={onCreate} onUpdate={onUpdate} />
  );
}

export default CreateUpdateVisit;
