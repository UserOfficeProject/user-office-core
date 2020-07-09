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

import {
  StyledPaper,
  ButtonContainer,
} from '../../../../styles/StyledComponents';

type FinalRankingFormProps = {
  closeModal: () => void;
};

const FinalRankingForm: React.FC<FinalRankingFormProps> = ({ closeModal }) => {
  const classes = makeStyles(() => ({
    button: {
      marginTop: '25px',
      marginLeft: '10px',
    },
  }))();

  const handleSubmit = (
    values: {
      commentForUser: string;
      commentForManagement: string;
      recommendation: string;
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
          initialValues={{
            commentForUser: '',
            commentForManagement: '',
            recommendation: '',
            finalRank: '',
          }}
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
          }): JSX.Element => (
            <Form>
              <Typography variant="h6" gutterBottom>
                Scientific evaluation panel
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
                  />
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
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    id="recommendation"
                    name="recommendation"
                    label="Recommendation"
                    type="text"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    multiline
                    rowsMax="16"
                    rows="3"
                    onChange={handleChange}
                    value={values.recommendation}
                    data-cy="recommendation"
                    error={
                      touched.recommendation &&
                      errors.recommendation !== undefined
                    }
                    helperText={
                      touched.recommendation &&
                      errors.recommendation &&
                      errors.recommendation
                    }
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
                  onClick={() => handleSubmit(values, setSubmitting, true)}
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
};

export default FinalRankingForm;
