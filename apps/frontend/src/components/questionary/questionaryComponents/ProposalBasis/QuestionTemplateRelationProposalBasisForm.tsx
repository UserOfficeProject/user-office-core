import React from 'react';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionReadPermissionsConfig } from 'components/questionary/QuestionReadPermissionsConfig';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationProposalBasisForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell {...props} validationSchema={null}>
      {() => (
        <QuestionReadPermissionsConfig
          config={props.questionRel.config}
          rolesData={props.rolesData}
        />
      )}
    </QuestionTemplateRelationFormShell>
  );
};
