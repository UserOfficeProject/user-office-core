import { Info } from '@mui/icons-material';
import { Button, Grid, IconButton, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import PromptIfDirty from 'components/common/PromptIfDirty';
import StyledDialog from 'components/common/StyledDialog';
import Editor from 'components/common/TinyEditor';
import { StyledButtonContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type ProposalRejectionCommentProps = {
  proposalPk: number;
  confirm: WithConfirmType;
  show: boolean;
};

const ProposalRejectionComment = (props: ProposalRejectionCommentProps) => {
  const { api } = useDataApiWithFeedback();
  const [show, setShow] = useState(props.show);

  return (
    <StyledDialog open={show}>
      <StyledPaper margin={[0]}>
        <>
          <Typography
            variant="h6"
            component="h2"
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
            gutterBottom
          >
            Proposal Rejection Comment
            <IconButton>
              <Info />
            </IconButton>
          </Typography>
          <Formik
            initialValues={{ comment: '' }}
            validationSchema={Yup.object().shape({
              comment: Yup.string().min(1).required('Comment is required'),
            })}
            onSubmit={async (values): Promise<void> => {
              await api({
                toastSuccessMessage:
                  'Proposal rejection comment successfully created',
              }).createProposalRejectionComment({
                proposalPk: props.proposalPk,
                comment: values.comment ?? '',
              });
            }}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form>
                <PromptIfDirty />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Editor
                      initialValue={''}
                      id={`${props.proposalPk}-rejection-comment`}
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
                      onEditorChange={(content) => {
                        setFieldValue('comment', content);
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledButtonContainer>
                      <Button
                        type="submit"
                        sx={(theme) => ({ margin: theme.spacing(3, 2, 2) })}
                        data-cy="submit-proposal-rejection-comment"
                        onClick={() => {
                          setShow(false);
                        }}
                      >
                        {'Update Comment'}
                      </Button>
                    </StyledButtonContainer>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </>
      </StyledPaper>
    </StyledDialog>
  );
};

export default withConfirm(ProposalRejectionComment);
