import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import { proposalTechnicalReviewValidationSchema } from '@user-office-software/duo-validation/lib/Review';
import { Formik, Form, Field } from 'formik';
import React, { useContext, useEffect, useState } from 'react';

import {
  FileIdWithCaptionAndFigure,
  FileUploadComponent,
} from 'components/common/FileUploadComponent';
import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import PromptIfDirty from 'components/common/PromptIfDirty';
import Editor from 'components/common/TinyEditor';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import {
  TechnicalReviewStatus,
  CoreTechnicalReviewFragment,
  UserRole,
  Proposal,
  SettingsId,
} from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import { Option } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type TechnicalReviewFormType = {
  status: string;
  timeAllocation: string | number;
  comment: string;
  publicComment: string;
  submitted: boolean;
  files: string;
};

type ProposalTechnicalReviewProps = {
  data: CoreTechnicalReviewFragment;
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
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isFapSec = useCheckAccess([UserRole.FAP_SECRETARY]);
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const { user } = useContext(UserContext);
  const [fileList, setFileList] = useState<FileIdWithCaptionAndFigure[]>([]);
  const { settingsMap } = useContext(SettingsContext);

  useEffect(() => {
    if (data.files) {
      setFileList(JSON.parse(data.files));
    }
  }, [data.files]);

  const fapSecCanEdit =
    isFapSec &&
    settingsMap.get(SettingsId.FAP_SECS_EDIT_TECH_REVIEWS)?.settingsValue ===
      'true';

  const initialValues: TechnicalReviewFormType = {
    status: data.status || '',
    timeAllocation:
      typeof data.timeAllocation === 'number' ? data.timeAllocation : '',
    comment: data.comment || '',
    publicComment: data.publicComment || '',
    submitted: data.submitted || false,
    files: data.files || '',
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

  const handleUpdateOrSubmit = async (
    values: TechnicalReviewFormType,
    method: 'submitTechnicalReviews' | 'addTechnicalReview'
  ) => {
    const shouldSubmit =
      method === 'submitTechnicalReviews' ||
      ((isUserOfficer || fapSecCanEdit) && values.submitted);
    const toastSuccessMessage = isUserOfficer
      ? `Technical review updated successfully!`
      : `Technical review ${
          shouldSubmit ? 'submitted' : 'updated'
        } successfully!`;

    if (method === 'submitTechnicalReviews') {
      await api({ toastSuccessMessage })[method]({
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
            instrumentId: data.instrumentId,
            questionaryId: 0,
          },
        ],
      });
    } else {
      await api({ toastSuccessMessage })[method]({
        proposalPk: proposal.primaryKey,
        timeAllocation: +values.timeAllocation,
        comment: values.comment,
        publicComment: values.publicComment,
        status: TechnicalReviewStatus[values.status as TechnicalReviewStatus],
        submitted: shouldSubmit,
        reviewerId: user.id,
        files: fileList ? JSON.stringify(fileList) : null,
        instrumentId: data.instrumentId,
        questionaryId: 0,
      });
    }

    setReview({
      id: data.id,
      proposalPk: data.proposalPk,
      timeAllocation: +values.timeAllocation,
      comment: values.comment,
      publicComment: values.publicComment,
      status: TechnicalReviewStatus[values.status as TechnicalReviewStatus],
      submitted: shouldSubmit,
      instrumentId: data.instrumentId,
    } as CoreTechnicalReviewFragment);
  };

  const shouldDisableForm = (isSubmitting: boolean) =>
    ((isSubmitting || data.submitted) && !(isUserOfficer || fapSecCanEdit)) ||
    isInternalReviewer;

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        Technical Review
      </Typography>
      {data.technicalReviewAssignee && (
        <Typography variant="subtitle2" data-cy="reviewed-by-info">
          {`Reviewed by ${getFullUserName(data.technicalReviewAssignee)}`}
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
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <PromptIfDirty />
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <Field
                  name="status"
                  options={statusOptions}
                  component={Select}
                  inputLabel={{ htmlFor: 'status', required: true }}
                  label="Status"
                  data-cy="technical-review-status"
                  required
                  disabled={fapSecCanEdit}
                  formControl={{ margin: 'normal' }}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Field
                  name="timeAllocation"
                  label={`Time allocation(${proposal.call?.allocationTimeUnit}s)`}
                  id="time-allocation-input"
                  type="number"
                  data-cy="timeAllocation"
                  disabled={fapSecCanEdit || shouldDisableForm(isSubmitting)}
                  component={TextField}
                  required
                  autoComplete="off"
                />
              </Grid>
              {(isUserOfficer || isInstrumentScientist || fapSecCanEdit) && (
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
              {(isUserOfficer || isInstrumentScientist || fapSecCanEdit) && (
                <Grid item xs={12}>
                  <InputLabel htmlFor="comment" shrink margin="dense">
                    Internal documents
                  </InputLabel>
                  <FileUploadComponent
                    maxFiles={5}
                    fileType={'.pdf'}
                    pdfPageLimit={0}
                    omitFromPdf={false}
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
                  {(isUserOfficer || fapSecCanEdit) && (
                    <Field
                      id="submitted"
                      name="submitted"
                      component={CheckboxWithLabel}
                      type="checkbox"
                      data-cy="is-review-submitted"
                      Label={{ label: 'Submitted' }}
                      disabled={isSubmitting}
                    />
                  )}
                  <Button
                    disabled={
                      shouldDisableForm(isSubmitting) ||
                      ((isUserOfficer || fapSecCanEdit) && isSubmitting)
                    }
                    type="submit"
                    onClick={() => setShouldSubmit(false)}
                    color={
                      isUserOfficer || fapSecCanEdit ? 'primary' : 'secondary'
                    }
                    data-cy="save-technical-review"
                  >
                    Save
                  </Button>
                  {!(isUserOfficer || fapSecCanEdit) && (
                    <Button
                      disabled={
                        isSubmitting || data.submitted || isInternalReviewer
                      }
                      type="submit"
                      sx={(theme) => ({ marginLeft: theme.spacing(1) })}
                      onClick={() => setShouldSubmit(true)}
                      data-cy="submit-technical-review"
                    >
                      {data.submitted ? 'Submitted' : 'Save and Submit'}
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
