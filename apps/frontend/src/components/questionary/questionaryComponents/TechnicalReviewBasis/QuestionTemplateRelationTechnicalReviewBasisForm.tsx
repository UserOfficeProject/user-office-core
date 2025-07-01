import React from 'react';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionReadPermissionsConfig } from 'components/questionary/QuestionReadPermissionsConfig';

import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationTechnicalReviewBasisForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell {...props} validationSchema={null}>
      {() => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <QuestionReadPermissionsConfig
            config={props.questionRel.config}
            rolesData={props.rolesData}
          />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
