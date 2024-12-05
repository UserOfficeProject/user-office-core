import { Button, DialogContent, Grid, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import PromptIfDirty from 'components/common/PromptIfDirty';
import Editor from 'components/common/TinyEditor';
import UOLoader from 'components/common/UOLoader';
import { ProposalScientistComment as ProposalScientistCommentType } from 'generated/sdk';
import { useProposalScientistCommentData } from 'hooks/proposal/useProposalScientistCommentData';
import { StyledButtonContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type ProposalScientistCommentProps = {
  proposalPk: number;
  confirm: WithConfirmType;
};

const ProposalScientistComment = (props: ProposalScientistCommentProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { loading, scientistCommentData, setScientistCommentData } =
    useProposalScientistCommentData(props.proposalPk);
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
            validationSchema={Yup.object().shape({
              comment: Yup.string().min(1).required('Comment is required'),
            })}
            onSubmit={async (values): Promise<void> => {
              if (scientistCommentData) {
                if (values.comment) {
                  const response = await api({
                    toastSuccessMessage:
                      'Proposal scientist comment successfully updated',
                  }).updateProposalScientistComment({
                    commentId: scientistCommentData.commentId,
                    comment: values.comment,
                  });

                  setScientistCommentData({
                    ...response.updateProposalScientistComment,
                    proposalPk: props.proposalPk,
                  });
                }
              } else {
                if (values.comment) {
                  const response = await api({
                    toastSuccessMessage:
                      'Proposal scientist comment successfully created',
                  }).createProposalScientistComment({
                    proposalPk: props.proposalPk,
                    comment: values.comment,
                  });

                  setScientistCommentData({
                    ...response.createProposalScientistComment,
                    proposalPk: props.proposalPk,
                  });
                }
              }
            }}
          >
            {({ isSubmitting, setFieldValue, isValid }) => (
              <Form>
                <PromptIfDirty />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {/* NOTE: We are using Editor directly instead of FormikUICustomEditor with Formik Field component.
                        This is because FormikUICustomEditor is not updated properly when we set form field onEditorChange.
                        It works when we use onBlur on Editor but it is problematic to test that with Cypress,
                        because for some reason it is not firing the onBlur event and form is not updated.
                    */}
                    <Editor
                      initialValue={scientistCommentData?.comment || ''}
                      id={`${props.proposalPk}-scientist-comment`}
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
                          setFieldValue('comment', content);
                        }
                      }}
                      disabled={isSubmitting}
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
                                await api({
                                  toastSuccessMessage:
                                    'Proposal scientist comment successfully deleted',
                                }).deleteProposalScientistComment({
                                  commentId: scientistCommentData.commentId,
                                });

                                setScientistCommentData(null);
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
                        disabled={isExecutingCall || isSubmitting || !isValid}
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
