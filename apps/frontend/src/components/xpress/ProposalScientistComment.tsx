import { Button, DialogContent, Grid, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import PromptIfDirty from 'components/common/PromptIfDirty';
import UOLoader from 'components/common/UOLoader';
import { ProposalScientistComment as ProposalScientistCommentType } from 'generated/sdk';
import { useProposalScientistCommentData } from 'hooks/proposal/useProposalScientistCommentData';
import { StyledButtonContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type ProposalScientistCommentProps = {
  proposalPk: number;
  close: () => void;
  confirm: WithConfirmType;
};

const ProposalScientistComment = (props: ProposalScientistCommentProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { loading, scientistCommentData } = useProposalScientistCommentData(
    props.proposalPk
  );
  const isNotCreate = (
    scientistCommentData: ProposalScientistCommentType | null
  ) => !!scientistCommentData;

  return (
    <StyledPaper margin={[0]}>
      {loading ? (
        <DialogContent sx={{ textAlign: 'center' }}>
          <UOLoader />
        </DialogContent>
      ) : (
        <>
          <Typography
            variant="h6"
            component="h2"
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
            gutterBottom
          >
            Proposal Scientist Comment
          </Typography>
          <Formik
            initialValues={{ comment: scientistCommentData?.comment }}
            onSubmit={async (values): Promise<void> => {
              if (scientistCommentData) {
                if (values.comment) {
                  await api({
                    toastSuccessMessage:
                      'Proposal scientist comment successfully updated',
                  }).updateProposalScientistComment({
                    commentId: scientistCommentData.commentId,
                    comment: values.comment,
                  });
                }
              } else {
                if (values.comment) {
                  await api({
                    toastSuccessMessage:
                      'Proposal scientist comment successfully created',
                  }).createProposalScientistComment({
                    proposalPk: props.proposalPk,
                    comment: values.comment,
                  });
                }
              }

              props.close();
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <PromptIfDirty />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      name="comment"
                      type="text"
                      component={FormikUICustomEditor}
                      fullWidth
                      init={{
                        skin: false,
                        content_css: false,
                        plugins: ['link', 'preview', 'image', 'code'],
                        toolbar: 'bold italic',
                        branding: false,
                      }}
                      data-cy="html"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledButtonContainer>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={(theme) => ({
                          margin: theme.spacing(3, 2, 2),
                        })}
                        disabled={isExecutingCall || isSubmitting}
                        data-cy="delete-proposal-scientist-comment"
                        onClick={() => {
                          if (scientistCommentData) {
                            props.confirm(
                              async () => {
                                await api().deleteProposalScientistComment({
                                  commentId: scientistCommentData.commentId,
                                });
                                props.close();
                              },
                              {
                                title: 'Are you sure?',
                                description: `Are you sure you want to delete comment.This action cannot be undone.`,
                                confirmationText: 'Yes',
                                cancellationText: 'Cancel',
                              }
                            )();
                          }
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        type="submit"
                        sx={(theme) => ({ margin: theme.spacing(3, 2, 2) })}
                        data-cy="submit-proposal-scientist-comment"
                        disabled={isExecutingCall || isSubmitting}
                      >
                        {isExecutingCall && <UOLoader size={14} />}
                        {isNotCreate(scientistCommentData)
                          ? 'Update'
                          : 'Create'}
                      </Button>
                    </StyledButtonContainer>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </>
      )}
    </StyledPaper>
  );
};

export default withConfirm(ProposalScientistComment);
