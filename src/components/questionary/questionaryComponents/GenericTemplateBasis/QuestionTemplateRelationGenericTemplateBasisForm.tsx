import React, { FC } from 'react';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationGenericTemplateBasisForm: FC<QuestionTemplateRelationFormProps> = (
  props
) => {
  return (
    <QuestionTemplateRelationFormShell {...props} validationSchema={null} />
  );
};
