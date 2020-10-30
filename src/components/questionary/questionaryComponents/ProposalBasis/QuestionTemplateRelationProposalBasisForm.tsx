import React from 'react';
import * as Yup from 'yup';

import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation } from 'generated/sdk';

import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationProposalBasisForm: FormComponent<QuestionTemplateRelation> = props => {
  return (
    <QuestionTemplateRelationFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      label="Proposal basis"
      template={props.template}
      validationSchema={Yup.object().shape({})}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
