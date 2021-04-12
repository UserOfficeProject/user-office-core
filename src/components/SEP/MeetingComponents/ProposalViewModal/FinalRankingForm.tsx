import { saveSepMeetingDecisionValidationSchema } from '@esss-swap/duo-validation';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import UOLoader from 'components/common/UOLoader';
import {
  Proposal,
  ProposalEndStatus,
  SaveSepMeetingDecisionInput,
  SepMeetingDecision,
  UserRole,
} from 'generated/sdk';
import { StyledPaper, ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(0, 0, 0, 1),
  },
}));

type FinalRankingFormProps = {
  proposalData: Proposal;
  hasWriteAccess: boolean;
  closeModal: () => void;
  meetingSubmitted: (data: SepMeetingDecision) => void;
  confirm: WithConfirmType;
};

const FinalRankingForm: React.FC<FinalRankingFormProps> = ({
  proposalData,
  hasWriteAccess,
  closeModal,
  meetingSubmitted,
  confirm,
}) => {
  const classes = useStyles();
  const [shouldClose, setShouldClose] = useState<boolean>(false);
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  const initialData = {
    proposalId: proposalData.id,
    commentForUser: proposalData.sepMeetingDecision?.commentForUser ?? '',
    commentForManagement:
      proposalData.sepMeetingDecision?.commentForManagement ?? '',
    recommendation:
      proposalData.sepMeetingDecision?.recommendation ??
      ProposalEndStatus.UNSET,
    submitted: proposalData.sepMeetingDecision?.submitted ?? false,
  };

  const PromptIfDirty = () => {
    const formik = useFormikContext();

    return (
      <Prompt
        when={formik.dirty && formik.submitCount === 0}
        message="Changes you recently made in this tab will be lost! Are you sure?"
      />
    );
  };

  const handleSubmit = async (values: SaveSepMeetingDecisionInput) => {
    const shouldSubmitMeetingDecision =
      (!isUserOfficer && shouldSubmit) || (isUserOfficer && values.submitted);

    const saveSepMeetingDecisionInput = {
      proposalId: values.proposalId,
      recommendation:
        ProposalEndStatus[values.recommendation as ProposalEndStatus],
      commentForUser: values.commentForUser,
      commentForManagement: values.commentForManagement,
      submitted: shouldSubmitMeetingDecision,
    };

    const data = await api(
      `SEP meeting decision ${
        shouldSubmitMeetingDecision ? 'submitted' : 'saved'
      } successfully!`
    ).saveSepMeetingDecision({ saveSepMeetingDecisionInput });

    const isError = !!data.saveSepMeetingDecision.error;

    meetingSubmitted({
      ...(saveSepMeetingDecisionInput as SepMeetingDecision),
      submittedBy: proposalData.sepMeetingDecision?.submittedBy || null,
    });

    if (shouldClose && !isError) {
      closeModal();
    }
  };

  const shouldDisableForm = (isSubmitting: boolean) =>
    (isSubmitting || proposalData.sepMeetingDecision?.submitted) &&
    !isUserOfficer;

  return (
    <div data-cy="SEP-meeting-components-final-ranking-form">
      <StyledPaper margin={[0, 0, 2, 0]}>
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={initialData}
          validationSchema={saveSepMeetingDecisionValidationSchema}
          onSubmit={async (values): Promise<void> => {
            if (!hasWriteAccess) {
              return;
            }

            if (shouldSubmit) {
              if (!isUserOfficer) {
                confirm(
                  async () => {
                    await handleSubmit({
                      ...values,
                    });
                  },
                  {
                    title: 'Please confirm',
                    description:
                      'I am aware that no further changes to the sep meeting are possible after submission.',
                  }
                )();
              } else {
                await handleSubmit({
                  ...values,
                });
              }
            } else {
              await handleSubmit({
                ...values,
              });
            }
          }}
        >
          {({ isSubmitting }): JSX.Element => (
            <Form>
              <PromptIfDirty />
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
                    component={TextField}
                    margin="normal"
                    fullWidth
                    multiline
                    rowsMax="16"
                    rows="3"
                    data-cy="commentForUser"
                    required
                    disabled={
                      !hasWriteAccess || shouldDisableForm(isSubmitting)
                    }
                  />
                  <FormikDropdown
                    name="recommendation"
                    label="Recommendation"
                    data-cy="proposalSepMeetingRecommendation"
                    items={[
                      { text: 'Unset', value: ProposalEndStatus.UNSET },
                      { text: 'Accepted', value: ProposalEndStatus.ACCEPTED },
                      { text: 'Reserved', value: ProposalEndStatus.RESERVED },
                      { text: 'Rejected', value: ProposalEndStatus.REJECTED },
                    ]}
                    required
                    disabled={
                      !hasWriteAccess || shouldDisableForm(isSubmitting)
                    }
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
                    data-cy="commentForManagement"
                    required
                    disabled={
                      !hasWriteAccess || shouldDisableForm(isSubmitting)
                    }
                  />
                  <ButtonContainer style={{ margin: '2rem 0 0' }}>
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
                        {isUserOfficer && (
                          <Field
                            id="submitted"
                            name="submitted"
                            component={FormikUICustomCheckbox}
                            label="Submitted"
                            color="primary"
                            disabled={isSubmitting}
                            data-cy="is-sep-meeting-submitted"
                          />
                        )}
                        <Button
                          type="submit"
                          variant="contained"
                          onClick={() => {
                            setShouldClose(false);
                            setShouldSubmit(false);
                          }}
                          color={isUserOfficer ? 'primary' : 'secondary'}
                          className={classes.button}
                          data-cy="save"
                          disabled={shouldDisableForm(isSubmitting)}
                        >
                          Save
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          onClick={() => {
                            setShouldClose(true);
                            setShouldSubmit(false);
                          }}
                          color={isUserOfficer ? 'primary' : 'secondary'}
                          className={classes.button}
                          data-cy="saveAndContinue"
                          disabled={shouldDisableForm(isSubmitting)}
                        >
                          Save and continue
                        </Button>
                        {!isUserOfficer && (
                          <Button
                            type="submit"
                            variant="contained"
                            onClick={() => {
                              setShouldClose(false);
                              setShouldSubmit(true);
                            }}
                            color={'primary'}
                            className={classes.button}
                            data-cy="submitSepMeeting"
                            disabled={shouldDisableForm(isSubmitting)}
                          >
                            Submit
                          </Button>
                        )}
                      </>
                    )}
                  </ButtonContainer>
                </Grid>
              </Grid>
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

export default withConfirm(FinalRankingForm);
