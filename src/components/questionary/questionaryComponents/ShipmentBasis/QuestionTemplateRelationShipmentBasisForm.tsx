import React from 'react';

import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation } from 'generated/sdk';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationShipmentBasisForm: FormComponent<QuestionTemplateRelation> = (
  props
) => {
  return (
    <QuestionTemplateRelationFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      template={props.template}
    ></QuestionTemplateRelationFormShell>
  );
};
