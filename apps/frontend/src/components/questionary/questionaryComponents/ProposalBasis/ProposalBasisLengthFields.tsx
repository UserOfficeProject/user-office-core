import { PROPOSAL_TITLE_DB_MAX_LENGTH } from '@user-office-software/duo-validation';
import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';

export const proposalBasisLengthConfigSchema = Yup.object({
  maxTitleLength: Yup.number()
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1')
    .max(
      PROPOSAL_TITLE_DB_MAX_LENGTH,
      `Must be at most ${PROPOSAL_TITLE_DB_MAX_LENGTH}`
    )
    .required('Max title length is required'),
  maxAbstractLength: Yup.number()
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1')
    .required('Max abstract length is required'),
});

export const ProposalBasisLengthFields = () => (
  <TitledContainer label="Constraints">
    <Field
      name="config.maxTitleLength"
      id="max-title-length-input"
      label="Max title length (characters)"
      type="number"
      component={TextField}
      fullWidth
      inputProps={{
        min: 1,
        max: PROPOSAL_TITLE_DB_MAX_LENGTH,
        'data-cy': 'max-title-length',
      }}
    />
    <Field
      name="config.maxAbstractLength"
      id="max-abstract-length-input"
      label="Max abstract length (characters)"
      type="number"
      component={TextField}
      fullWidth
      inputProps={{ min: 1, 'data-cy': 'max-abstract-length' }}
    />
  </TitledContainer>
);
