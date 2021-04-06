import { proposalTechnicalReviewValidationSchema } from '@esss-swap/duo-validation/lib/Review';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import {
  TechnicalReviewStatus,
  CoreTechnicalReviewFragment,
  UserRole,
} from 'generated/sdk';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

const useStyles = makeStyles((theme) => ({
  submitButton: {
    marginLeft: theme.spacing(1),
  },
}));

type TechnicalReviewFormType = {
  status: string;
  timeAllocation: string | number;
  comment: string;
  publicComment: string;
  submitted: boolean;
};

type ProposalTechnicalReviewProps = {
  data: CoreTechnicalReviewFragment | null | undefined;
  setReview: (data: CoreTechnicalReviewFragment) => void;
  id: number;
  confirm: WithConfirmType;
};

const ProposalTechnicalReview = ({
  id,
  data,
  setReview,
  confirm,
}: ProposalTechnicalReviewProps) => {
  const { api } = useDataApiWithFeedback();
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const classes = useStyles();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const initialValues: TechnicalReviewFormType = {
    status: data?.status || '',
    timeAllocation: data?.timeAllocation || '',
    comment: data?.comment || '',
    publicComment: data?.publicComment || '',
    submitted: data?.submitted || false,
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

  const handleUpdateOrSubmit = async (
    values: TechnicalReviewFormType,
    method: 'submitTechnicalReview' | 'addTechnicalReview'
  ) => {
    const shouldSubmit =
      method === 'submitTechnicalReview' || (isUserOfficer && values.submitted);
    const successMessage = isUserOfficer
      ? `Technical review updated successfully!`
      : `Technical review ${
          shouldSubmit ? 'submitted' : 'updated'
        } successfully!`;

    const result = await api(successMessage)[method]({
      proposalID: id,
      timeAllocation: +values.timeAllocation,
      comment: values.comment,
      publicComment: values.publicComment,
      status: TechnicalReviewStatus[values.status as TechnicalReviewStatus],
      submitted: shouldSubmit,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(result as any)[method].error) {
      setReview({
        proposalID: data?.proposalID,
        timeAllocation: +values.timeAllocation,
        comment: values.comment,
        publicComment: values.publicComment,
        status: TechnicalReviewStatus[values.status as TechnicalReviewStatus],
        submitted: shouldSubmit,
      } as CoreTechnicalReviewFragment);
    }
  };

  const shouldDisableForm = (isSubmitting: boolean) =>
    (isSubmitting || data?.submitted) && !isUserOfficer;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Technical Review
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={proposalTechnicalReviewValidationSchema}
        onSubmit={async (values): Promise<void> => {
          if (shouldSubmit) {
            if (!isUserOfficer) {
              confirm(
                async () => {
                  await handleUpdateOrSubmit(values, 'submitTechnicalReview');
                },
                {
                  title: 'Please confirm',
                  description:
                    'I am aware that no further changes to the technical review are possible after submission.',
                }
              )();
            } else {
              await handleUpdateOrSubmit(values, 'submitTechnicalReview');
            }
          } else {
            await handleUpdateOrSubmit(values, 'addTechnicalReview');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <PromptIfDirty />
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormikDropdown
                  name="status"
                  label="Status"
                  items={[
                    { text: 'Feasible', value: TechnicalReviewStatus.FEASIBLE },
                    {
                      text: 'Partially feasible',
                      value: TechnicalReviewStatus.PARTIALLY_FEASIBLE,
                    },
                    {
                      text: 'Unfeasible',
                      value: TechnicalReviewStatus.UNFEASIBLE,
                    },
                  ]}
                  disabled={shouldDisableForm(isSubmitting)}
                  InputProps={{
                    'data-cy': 'technical-review-status',
                  }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  name="timeAllocation"
                  label="Time Allocation(Days)"
                  type="number"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="timeAllocation"
                  disabled={shouldDisableForm(isSubmitting)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="comment"
                  label="Internal comment"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="comment"
                  multiline
                  rowsMax="16"
                  rows="4"
                  disabled={shouldDisableForm(isSubmitting)}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="publicComment"
                  label="Public comment"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="publicComment"
                  multiline
                  rowsMax="16"
                  rows="4"
                  disabled={shouldDisableForm(isSubmitting)}
                />
              </Grid>
            </Grid>
            <ButtonContainer>
              {isUserOfficer && (
                <Field
                  id="submitted"
                  name="submitted"
                  component={FormikUICustomCheckbox}
                  label="Submitted"
                  color="primary"
                  disabled={isSubmitting}
                  data-cy="is-review-submitted"
                />
              )}
              <Button
                disabled={
                  shouldDisableForm(isSubmitting) ||
                  (isUserOfficer && isSubmitting)
                }
                type="submit"
                onClick={() => setShouldSubmit(false)}
                variant="contained"
                color={isUserOfficer ? 'primary' : 'secondary'}
                data-cy="update-technical-review"
              >
                Update
              </Button>
              {!isUserOfficer && (
                <Button
                  disabled={isSubmitting || data?.submitted}
                  type="submit"
                  className={classes.submitButton}
                  onClick={() => setShouldSubmit(true)}
                  variant="contained"
                  color="primary"
                  data-cy="submit-technical-review"
                >
                  {data?.submitted ? 'Submitted' : 'Submit'}
                </Button>
              )}
            </ButtonContainer>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default withConfirm(ProposalTechnicalReview);
