import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { saveFapMeetingDecisionValidationSchema } from '@user-office-software/duo-validation';
import { Formik, Form, Field } from 'formik';
import React, { useState } from 'react';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import PromptIfDirty from 'components/common/PromptIfDirty';
import Editor from 'components/common/TinyEditor';
import UOLoader from 'components/common/UOLoader';
import {
  Proposal,
  ProposalEndStatus,
  FapMeetingDecision,
  UserRole,
} from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { StyledPaper, StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { Option } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type FinalRankingFormProps = {
  proposalData: Proposal;
  hasWriteAccess: boolean;
  closeModal: () => void;
  meetingSubmitted: (data: FapMeetingDecision) => void;
  confirm: WithConfirmType;
  instrumentId: number;
  fapId: number;
};

const FinalRankingForm = ({
  proposalData,
  hasWriteAccess,
  closeModal,
  meetingSubmitted,
  confirm,
  instrumentId,
  fapId,
}: FinalRankingFormProps) => {
  const [shouldClose, setShouldClose] = useState<boolean>(false);
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  const fapMeetingDecision = proposalData.fapMeetingDecisions?.find(
    (fmd) => fmd.instrumentId === instrumentId
  );

  const initialData = {
    proposalPk: proposalData.primaryKey,
    commentForUser: fapMeetingDecision?.commentForUser ?? '',
    commentForManagement: fapMeetingDecision?.commentForManagement ?? '',
    recommendation:
      fapMeetingDecision?.recommendation ?? ProposalEndStatus.UNSET,
    submitted: fapMeetingDecision?.submitted ?? false,
  };

  const statusOptions: Option[] = [
    { text: 'Unset', value: ProposalEndStatus.UNSET },
    { text: 'Accepted', value: ProposalEndStatus.ACCEPTED },
    { text: 'Reserved', value: ProposalEndStatus.RESERVED },
    { text: 'Rejected', value: ProposalEndStatus.REJECTED },
  ];

  const handleSubmit = async (values: typeof initialData) => {
    const shouldSubmitMeetingDecision =
      (!isUserOfficer && shouldSubmit) || (isUserOfficer && values.submitted);

    const saveFapMeetingDecisionInput = {
      proposalPk: values.proposalPk,
      recommendation:
        ProposalEndStatus[values.recommendation as ProposalEndStatus],
      commentForUser: values.commentForUser || null,
      commentForManagement: values.commentForManagement || null,
      submitted: shouldSubmitMeetingDecision || false,
      instrumentId: instrumentId,
      fapId: fapId,
    };

    await api({
      toastSuccessMessage: `Fap meeting decision ${
        shouldSubmitMeetingDecision ? 'submitted' : 'saved'
      } successfully!`,
    }).saveFapMeetingDecision({ saveFapMeetingDecisionInput });

    meetingSubmitted({
      ...saveFapMeetingDecisionInput,
      submittedBy: fapMeetingDecision?.submittedBy || null,
      rankOrder: fapMeetingDecision?.rankOrder || null,
    });

    if (shouldClose) {
      closeModal();
    }
  };

  const shouldDisableForm = (isSubmitting: boolean) =>
    (isSubmitting || fapMeetingDecision?.submitted) && !isUserOfficer;

  return (
    <div data-cy="Fap-meeting-components-final-ranking-form">
      <StyledPaper margin={[0, 0, 2, 0]}>
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={initialData}
          validationSchema={saveFapMeetingDecisionValidationSchema}
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
                      'I am aware that no further changes to the Fap meeting are possible after submission.',
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
          {({ isSubmitting, setFieldValue, values }): JSX.Element => (
            <Form>
              <PromptIfDirty />
              <Typography variant="h6" gutterBottom>
                Fap Meeting form
              </Typography>
              <Grid container spacing={3}>
                <Grid item sm={6} xs={12}>
                  <InputLabel htmlFor="commentForUser" shrink margin="dense">
                    Comment for user
                  </InputLabel>
                  <Editor
                    id="commentForUser"
                    initialValue={initialData.commentForUser}
                    init={{
                      skin: false,
                      content_css: false,
                      plugins: [
                        'link',
                        'preview',
                        'code',
                        'charmap',
                        'wordcount',
                      ],
                      toolbar: 'bold italic',
                      branding: false,
                    }}
                    onEditorChange={(content, editor) => {
                      const isStartContentDifferentThanCurrent =
                        editor.startContent !==
                        editor.contentDocument.body.innerHTML;

                      if (
                        isStartContentDifferentThanCurrent ||
                        editor.isDirty()
                      ) {
                        setFieldValue('commentForUser', content);
                      }
                    }}
                    disabled={
                      !hasWriteAccess || shouldDisableForm(isSubmitting)
                    }
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel
                      htmlFor="recommendation"
                      shrink={!!values.recommendation}
                      required
                    >
                      Recommendation
                    </InputLabel>
                    <Field
                      name="recommendation"
                      component={Select}
                      data-cy="proposalFapMeetingRecommendation"
                      disabled={
                        !hasWriteAccess || shouldDisableForm(isSubmitting)
                      }
                      MenuProps={{
                        'data-cy': 'proposalFapMeetingRecommendation-options',
                      }}
                      required
                    >
                      {statusOptions.map(({ value, text }) => (
                        <MenuItem value={value} key={value}>
                          {text}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <InputLabel
                    htmlFor="commentForManagement"
                    shrink
                    margin="dense"
                  >
                    Comment for management
                  </InputLabel>
                  <Editor
                    id="commentForManagement"
                    initialValue={initialData.commentForManagement}
                    init={{
                      skin: false,
                      content_css: false,
                      plugins: [
                        'link',
                        'preview',
                        'code',
                        'charmap',
                        'wordcount',
                      ],
                      toolbar: 'bold italic',
                      branding: false,
                    }}
                    onEditorChange={(content, editor) => {
                      const isStartContentDifferentThanCurrent =
                        editor.startContent !==
                        editor.contentDocument.body.innerHTML;

                      if (
                        isStartContentDifferentThanCurrent ||
                        editor.isDirty()
                      ) {
                        setFieldValue('commentForManagement', content);
                      }
                    }}
                    disabled={
                      !hasWriteAccess || shouldDisableForm(isSubmitting)
                    }
                  />
                  <StyledButtonContainer style={{ margin: '2rem 0 0' }}>
                    {hasWriteAccess && (
                      <>
                        {isSubmitting && (
                          <Box
                            display="flex"
                            alignItems="center"
                            sx={(theme) => ({
                              margin: theme.spacing(0, 0, 0, 1),
                            })}
                          >
                            <UOLoader buttonSized />
                          </Box>
                        )}
                        {isUserOfficer && (
                          <Field
                            id="submitted"
                            name="submitted"
                            component={CheckboxWithLabel}
                            type="checkbox"
                            Label={{
                              label: 'Submitted',
                            }}
                            disabled={isSubmitting}
                            data-cy="is-fap-meeting-submitted"
                          />
                        )}
                        <Button
                          type="submit"
                          onClick={() => {
                            setShouldClose(false);
                            setShouldSubmit(false);
                          }}
                          color={isUserOfficer ? 'primary' : 'secondary'}
                          sx={(theme) => ({
                            margin: theme.spacing(0, 0, 0, 1),
                          })}
                          data-cy="save"
                          disabled={shouldDisableForm(isSubmitting)}
                        >
                          Save
                        </Button>
                        <Button
                          type="submit"
                          onClick={() => {
                            setShouldClose(true);
                            setShouldSubmit(false);
                          }}
                          color={isUserOfficer ? 'primary' : 'secondary'}
                          sx={(theme) => ({
                            margin: theme.spacing(0, 0, 0, 1),
                          })}
                          data-cy="saveAndContinue"
                          disabled={shouldDisableForm(isSubmitting)}
                        >
                          Save and continue
                        </Button>
                        {!isUserOfficer && (
                          <Button
                            type="submit"
                            onClick={() => {
                              setShouldClose(false);
                              setShouldSubmit(true);
                            }}
                            sx={(theme) => ({
                              margin: theme.spacing(0, 0, 0, 1),
                            })}
                            data-cy="submitFapMeeting"
                            disabled={shouldDisableForm(isSubmitting)}
                          >
                            Submit
                          </Button>
                        )}
                      </>
                    )}
                  </StyledButtonContainer>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </StyledPaper>
    </div>
  );
};

export default withConfirm(FinalRankingForm);
