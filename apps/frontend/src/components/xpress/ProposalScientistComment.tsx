import { Button, Grid, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';

import PromptIfDirty from 'components/common/PromptIfDirty';
import Editor from 'components/common/TinyEditor';
import { UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { StyledButtonContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type ProposalScientistCommentProps = {
  proposalPk: number;
  commentByScientist: string;
  close: () => void;
};

const ProposalScientistComment = (props: ProposalScientistCommentProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const initialValues = {
    commentByScientist: props.commentByScientist,
  };
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);

  return (
    <StyledPaper margin={[0]}>
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
        initialValues={initialValues}
        onSubmit={async (values): Promise<void> => {
          await api({
            toastSuccessMessage:
              'Proposal scientist comment successfully saved',
          }).updateProposalScientistComment({
            proposalPk: props.proposalPk,
            commentByScientist: values.commentByScientist,
          });
          props.close();
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
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
                  id="commentByScientist"
                  initialValue={initialValues.commentByScientist}
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
                      setFieldValue('commentByScientist', content);
                    }
                  }}
                  disabled={!isInstrumentScientist || isSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledButtonContainer>
                  <Button
                    type="submit"
                    sx={(theme) => ({
                      margin: theme.spacing(3, 0, 2),
                    })}
                    disabled={
                      !isInstrumentScientist || isExecutingCall || isSubmitting
                    }
                    data-cy="submit-proposal-scientist-comment"
                  >
                    Save
                  </Button>
                </StyledButtonContainer>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </StyledPaper>
  );
};

export default ProposalScientistComment;
