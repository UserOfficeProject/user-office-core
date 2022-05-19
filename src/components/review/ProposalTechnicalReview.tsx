import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import { proposalTechnicalReviewValidationSchema } from '@user-office-software/duo-validation/lib/Review';
import { Formik, Form, Field, useFormikContext } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-mui';
import React, { useContext, useEffect, useState } from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import {
  FileIdWithCaptionAndFigure,
  FileUploadComponent,
} from 'components/common/FileUploadComponent';
import { UserContext } from 'context/UserContextProvider';
import {
  TechnicalReviewStatus,
  CoreTechnicalReviewFragment,
  UserRole,
  Proposal,
} from 'generated/sdk';
import { StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import { Option } from 'utils/utilTypes';
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
  files: string;
};

type ProposalTechnicalReviewProps = {
  data: CoreTechnicalReviewFragment | null | undefined;
  setReview: (data: CoreTechnicalReviewFragment) => void;
  proposal: Proposal;
  confirm: WithConfirmType;
};

const ProposalTechnicalReview = ({
  proposal,
  data,
  setReview,
  confirm,
}: ProposalTechnicalReviewProps) => {
  const { api } = useDataApiWithFeedback();
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const classes = useStyles();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);
  const { user } = useContext(UserContext);
  const [fileList, setFileList] = useState<FileIdWithCaptionAndFigure[]>([]);

  useEffect(() => {
    if (data?.files) {
      setFileList(JSON.parse(data.files));
    }
  }, [data?.files]);

  const initialValues: TechnicalReviewFormType = {
    status: data?.status || '',
    timeAllocation: data?.timeAllocation || '',
    comment: data?.comment || '',
    publicComment: data?.publicComment || '',
    submitted: data?.submitted || false,
    files: data?.files || '',
  };

  const statusOptions: Option[] = [
    { text: 'Feasible', value: TechnicalReviewStatus.FEASIBLE },
    {
      text: 'Partially feasible',
      value: TechnicalReviewStatus.PARTIALLY_FEASIBLE,
    },
    {
      text: 'Unfeasible',
      value: TechnicalReviewStatus.UNFEASIBLE,
    },
  ];

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
    method: 'submitTechnicalReviews' | 'addTechnicalReview'
  ) => {
    const shouldSubmit =
      method === 'submitTechnicalReviews' ||
      (isUserOfficer && values.submitted);
    const toastSuccessMessage = isUserOfficer
      ? `Technical review updated successfully!`
      : `Technical review ${
          shouldSubmit ? 'submitted' : 'updated'
        } successfully!`;

    let result;

    if (method === 'submitTechnicalReviews') {
      result = await api({ toastSuccessMessage })[method]({
        technicalReviews: [
          {
            proposalPk: proposal.primaryKey,
            timeAllocation: +values.timeAllocation,
            comment: values.comment,
            publicComment: values.publicComment,
            status:
              TechnicalReviewStatus[values.status as TechnicalReviewStatus],
            submitted: shouldSubmit,
            reviewerId: user.id,
            files: fileList ? JSON.stringify(fileList) : null,
          },
        ],
      });
    } else {
      result = await api({ toastSuccessMessage })[method]({
        proposalPk: proposal.primaryKey,
        timeAllocation: +values.timeAllocation,
        comment: values.comment,
        publicComment: values.publicComment,
        status: TechnicalReviewStatus[values.status as TechnicalReviewStatus],
        submitted: shouldSubmit,
        reviewerId: user.id,
        files: fileList ? JSON.stringify(fileList) : null,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(result as any)[method].rejection) {
      setReview({
        proposalPk: data?.proposalPk,
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
      <Typography variant="h6" component="h2" gutterBottom>
        Technical Review
      </Typography>
      {proposal.technicalReview?.reviewer && (
        <Typography variant="subtitle2" data-cy="reviewed-by-info">
          {`Reviewed by ${getFullUserName(proposal.technicalReview?.reviewer)}`}
        </Typography>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={proposalTechnicalReviewValidationSchema}
        onSubmit={async (values): Promise<void> => {
          if (shouldSubmit) {
            if (!isUserOfficer) {
              confirm(
                async () => {
                  await handleUpdateOrSubmit(values, 'submitTechnicalReviews');
                },
                {
                  title: 'Please confirm',
                  description:
                    'I am aware that no further changes to the technical review are possible after submission.',
                }
              )();
            } else {
              await handleUpdateOrSubmit(values, 'submitTechnicalReviews');
            }
          } else {
            await handleUpdateOrSubmit(values, 'addTechnicalReview');
          }
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <PromptIfDirty />
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel
                    htmlFor="status"
                    shrink={!!values.status}
                    required
                  >
                    Status
                  </InputLabel>
                  <Field
                    name="status"
                    type="text"
                    component={Select}
                    data-cy="technical-review-status"
                    disabled={shouldDisableForm(isSubmitting)}
                    MenuProps={{ 'data-cy': 'technical-review-status-options' }}
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
                <Field
                  name="timeAllocation"
                  label={`Time allocation(${proposal.call?.allocationTimeUnit}s)`}
                  id="time-allocation-input"
                  type="number"
                  component={TextField}
                  fullWidth
                  autoComplete="off"
                  data-cy="timeAllocation"
                  disabled={shouldDisableForm(isSubmitting)}
                  required
                />
              </Grid>
              {(isUserOfficer || isInstrumentScientist) && (
                <Grid item xs={12}>
                  <InputLabel htmlFor="comment" shrink margin="dense">
                    Internal comment
                  </InputLabel>
                  {/* NOTE: We are using Editor directly instead of FormikUICustomEditor with Formik Field component.
                    This is because FormikUICustomEditor is not updated properly when we set form field onEditorChange.
                    It works when we use onBlur on Editor but it is problematic to test that with Cypress,
                    because for some reason it is not firing the onBlur event and form is not updated.
                */}
                  <Editor
                    id="comment"
                    initialValue={initialValues.comment}
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
                    disabled={shouldDisableForm(isSubmitting)}
                  />
                </Grid>
              )}
              {(isUserOfficer || isInstrumentScientist) && (
                <Grid item xs={12}>
                  <InputLabel htmlFor="comment" shrink margin="dense">
                    Internal documents
                  </InputLabel>
                  <FileUploadComponent
                    maxFiles={5}
                    fileType={'.pdf'}
                    onChange={(
                      fileMetaDataList: FileIdWithCaptionAndFigure[]
                    ) => {
                      const newStateValue = fileMetaDataList.map((file) => ({
                        ...file,
                      }));
                      setFileList(newStateValue);
                      setFieldValue('pdfUpload', newStateValue);
                    }}
                    value={
                      initialValues.files
                        ? JSON.parse(initialValues.files) || []
                        : []
                    }
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <InputLabel htmlFor="publicComment" shrink margin="dense">
                  Comments for the review panel
                </InputLabel>
                <Editor
                  id="publicComment"
                  initialValue={initialValues.publicComment}
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
                      setFieldValue('publicComment', content);
                    }
                  }}
                  disabled={shouldDisableForm(isSubmitting)}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledButtonContainer>
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
                    color={isUserOfficer ? 'primary' : 'secondary'}
                    data-cy="save-technical-review"
                  >
                    Save
                  </Button>
                  {!isUserOfficer && (
                    <Button
                      disabled={isSubmitting || data?.submitted}
                      type="submit"
                      className={classes.submitButton}
                      onClick={() => setShouldSubmit(true)}
                      data-cy="submit-technical-review"
                    >
                      {data?.submitted ? 'Submitted' : 'Submit'}
                    </Button>
                  )}
                </StyledButtonContainer>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default withConfirm(ProposalTechnicalReview);
