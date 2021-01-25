import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import UOLoader from 'components/common/UOLoader';
import { AdministrationFormData } from 'components/proposal/ProposalAdmin';
import { Proposal, ProposalEndStatus } from 'generated/sdk';
import { StyledPaper, ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(2, 0, 1, 1),
  },
}));

type FinalRankingFormProps = {
  proposalData: Proposal;
  hasWriteAccess: boolean;
  closeModal: () => void;
  meetingSubmitted: (data: AdministrationFormData) => void;
};

const FinalRankingForm: React.FC<FinalRankingFormProps> = ({
  proposalData,
  hasWriteAccess,
  closeModal,
  meetingSubmitted,
}) => {
  const classes = useStyles();
  const [shouldClose, setShouldClose] = useState<boolean>(false);
  const { api } = useDataApiWithFeedback();

  const initialData = {
    finalStatus: proposalData.finalStatus || ProposalEndStatus.UNSET,
    commentForUser: proposalData.commentForUser || '',
    commentForManagement: proposalData.commentForManagement || '',
    rankOrder: proposalData.rankOrder || '',
  };

  const handleSubmit = async (values: AdministrationFormData) => {
    const administrationProposalVales = {
      id: values.id,
      finalStatus: ProposalEndStatus[values.finalStatus as ProposalEndStatus],
      commentForUser: values.commentForUser,
      commentForManagement: values.commentForManagement,
      rankOrder: values.rankOrder,
    };

    const data = await api('Saved!').administrationProposal(
      administrationProposalVales
    );

    const isError = !!data.administrationProposal.error;

    meetingSubmitted(administrationProposalVales);

    if (shouldClose && !isError) {
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
          onSubmit={async (values): Promise<void> => {
            if (!hasWriteAccess) {
              return;
            }

            await handleSubmit({
              id: proposalData.id,
              ...values,
              rankOrder: +values.rankOrder,
            });
          }}
        >
          {({
            values,
            errors,
            touched,
            isSubmitting,
            handleChange,
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
                    disabled={!hasWriteAccess}
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
                    disabled={!hasWriteAccess}
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
                    disabled={!hasWriteAccess}
                  />
                  <Field
                    id="rankOrder"
                    name="rankOrder"
                    label="Rank"
                    type="number"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    onChange={handleChange}
                    value={values.rankOrder}
                    data-cy="rankOrder"
                    error={touched.rankOrder && errors.rankOrder !== undefined}
                    helperText={
                      touched.rankOrder && errors.rankOrder && errors.rankOrder
                    }
                    required
                    disabled={!hasWriteAccess}
                  />
                </Grid>
              </Grid>
              <ButtonContainer>
                {hasWriteAccess && (
                  <>
                    {isSubmitting && (
                      <Box
                        display="flex"
                        alignItems="center"
                        className={classes.button}
                      >
                        <UOLoader buttonSized />
                      </Box>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      onClick={() => {
                        setShouldClose(false);
                      }}
                      color="primary"
                      className={classes.button}
                      data-cy="save"
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      onClick={() => {
                        setShouldClose(true);
                      }}
                      color="primary"
                      className={classes.button}
                      data-cy="saveAndContinue"
                      disabled={isSubmitting}
                    >
                      Save and continue
                    </Button>
                  </>
                )}
                <Button
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
  meetingSubmitted: PropTypes.func.isRequired,
  hasWriteAccess: PropTypes.bool.isRequired,
};

export default FinalRankingForm;
