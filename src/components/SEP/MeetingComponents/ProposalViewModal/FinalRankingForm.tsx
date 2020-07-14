import {
  Typography,
  makeStyles,
  Grid,
  TextField,
  Button,
} from '@material-ui/core';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

import { Proposal, ProposalEndStatus } from '../../../../generated/sdk';
import {
  StyledPaper,
  ButtonContainer,
} from '../../../../styles/StyledComponents';
import FormikDropdown from '../../../common/FormikDropdown';

type FinalRankingFormProps = {
  closeModal: () => void;
  proposalData: Proposal;
};

const FinalRankingForm: React.FC<FinalRankingFormProps> = ({
  closeModal,
  proposalData,
}) => {
  const classes = makeStyles(() => ({
    button: {
      marginTop: '25px',
      marginLeft: '10px',
    },
  }))();

  const initialData = {
    finalStatus: proposalData.finalStatus || ProposalEndStatus.UNSET,
    commentForUser: proposalData.commentForUser,
    commentForManagement: proposalData.commentForManagement,
    finalRank: '',
  };

  const handleSubmit = (
    values: {
      commentForUser: string | null | undefined;
      commentForManagement: string | null | undefined;
      finalStatus: string;
      finalRank: string;
    },
    setSubmitting: Function,
    shouldClose: boolean
  ) => {
    console.log(values);

    setSubmitting(false);

    if (shouldClose) {
      closeModal();
    }
  };

  return (
    <div data-cy="SEP-meeting-components-final-ranking-form">
      <StyledPaper margin={[0, 0, 2, 0]}>
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={initialData}
          onSubmit={(values, actions): void => {
            handleSubmit(values, actions.setSubmitting, false);
          }}
        >
          {({
            isSubmitting,
            values,
            errors,
            touched,
            handleChange,
            setSubmitting,
            isValid,
          }): JSX.Element => (
            <Form>
              <Typography variant="h6" gutterBottom>
                SEP Meeting form
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Field
                    name="commentForUser"
                    id="commentForUser"
                    label="Comment for user"
                    type="text"
                    value={values.commentForUser}
                    onChange={handleChange}
                    component={TextField}
                    margin="normal"
                    fullWidth
                    multiline
                    rowsMax="16"
                    rows="3"
                    data-cy="commentForUser"
                    error={
                      touched.commentForUser &&
                      errors.commentForUser !== undefined
                    }
                    helperText={
                      touched.commentForUser &&
                      errors.commentForUser &&
                      errors.commentForUser
                    }
                    required
                  />
                  <FormikDropdown
                    name="finalStatus"
                    label="Recommendation"
                    data-cy="proposalFinalStatus"
                    items={[
                      { text: 'Unset', value: ProposalEndStatus.UNSET },
                      { text: 'Accepted', value: ProposalEndStatus.ACCEPTED },
                      { text: 'Reserved', value: ProposalEndStatus.RESERVED },
                      { text: 'Rejected', value: ProposalEndStatus.REJECTED },
                    ]}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    id="commentForManagement"
                    name="commentForManagement"
                    label="Comment for management"
                    type="text"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    multiline
                    rowsMax="16"
                    rows="3"
                    onChange={handleChange}
                    value={values.commentForManagement}
                    data-cy="commentForManagement"
                    error={
                      touched.commentForManagement &&
                      errors.commentForManagement !== undefined
                    }
                    helperText={
                      touched.commentForManagement &&
                      errors.commentForManagement &&
                      errors.commentForManagement
                    }
                    required
                  />
                  <Field
                    id="finalRank"
                    name="finalRank"
                    label="Final rank"
                    type="number"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    onChange={handleChange}
                    value={values.finalRank}
                    data-cy="finalRank"
                    error={touched.finalRank && errors.finalRank !== undefined}
                    helperText={
                      touched.finalRank && errors.finalRank && errors.finalRank
                    }
                    required
                  />
                </Grid>
              </Grid>
              <ButtonContainer>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  data-cy="save"
                >
                  Save
                </Button>
                <Button
                  disabled={isSubmitting}
                  type="button"
                  variant="contained"
                  onClick={() => {
                    if (isValid) {
                      handleSubmit(values, setSubmitting, true);
                    }
                  }}
                  color="primary"
                  className={classes.button}
                  data-cy="saveAndContinue"
                >
                  Save and continue
                </Button>
                <Button
                  disabled={isSubmitting}
                  type="button"
                  onClick={closeModal}
                  variant="contained"
                  className={classes.button}
                  data-cy="close"
                >
                  Close
                </Button>
              </ButtonContainer>
            </Form>
          )}
        </Formik>
      </StyledPaper>
    </div>
  );
};

FinalRankingForm.propTypes = {
  closeModal: PropTypes.func.isRequired,
  proposalData: PropTypes.any.isRequired,
};

export default FinalRankingForm;
