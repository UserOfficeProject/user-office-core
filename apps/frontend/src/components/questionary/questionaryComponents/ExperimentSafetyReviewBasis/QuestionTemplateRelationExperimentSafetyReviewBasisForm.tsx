import React from 'react';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationExperimentSafetyReviewBasisForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell {...props} validationSchema={null} />
  );
};
