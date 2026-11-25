import React from 'react';
import * as Yup from 'yup';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import {
  proposalBasisLengthConfigSchema,
  ProposalBasisLengthFields,
} from './ProposalBasisLengthFields';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationProposalBasisForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: proposalBasisLengthConfigSchema,
      })}
    >
      {() => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <ProposalBasisLengthFields />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
