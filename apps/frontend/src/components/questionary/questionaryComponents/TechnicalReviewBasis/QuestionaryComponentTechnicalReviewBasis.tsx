import {
  Box,
  CssBaseline,
  Grid,
  InputLabel,
  Typography,
  useTheme,
} from '@mui/material';
import { Field } from 'formik';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import {
  FileUploadComponent,
  FileIdWithCaptionAndFigure,
} from 'components/common/FileUploadComponent';
import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import PromptIfDirty from 'components/common/PromptIfDirty';
import Editor from 'components/common/TinyEditor';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { TechnicalReviewContextType } from 'components/review/TechnicalReviewQuestionary';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId, TechnicalReviewStatus, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { TechnicalReviewSubmissionState } from 'models/questionary/technicalReview/TechnicalReviewSubmissionState';
import { getFullUserName } from 'utils/user';
import { Option } from 'utils/utilTypes';

function QuestionaryComponentTechnicalReviewBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
    formikProps,
  } = props;

  const theme = useTheme();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as TechnicalReviewContextType;

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isFapChairOrSec = useCheckAccess([
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const { user } = useContext(UserContext);
  const { settingsMap } = useContext(SettingsContext);

  const fapSecOrChairCanEdit =
    isFapChairOrSec &&
    settingsMap.get(SettingsId.FAP_SECS_EDIT_TECH_REVIEWS)?.settingsValue ===
      'true';

  const [localStatus, setLocalStatus] = useState(
    state?.technicalReview.status || ''
  );

  const [localTimeAllocation, setLocalTimeAllocation] = useState(
    typeof state?.technicalReview.timeAllocation === 'number'
      ? state?.technicalReview.timeAllocation
      : ''
  );

  const [localComment, setLocalComment] = useState(
    state?.technicalReview.comment || ''
  );

  const [localPublicComment, setLocalPublicComment] = useState(
    state?.technicalReview.publicComment || ''
  );

  const [localFiles, setLocalFiles] = useState<FileIdWithCaptionAndFigure[]>(
    []
  );

  useEffect(() => {
    if (state?.technicalReview.files) {
      setLocalFiles(JSON.parse(state?.technicalReview.files));
    }
  }, [state?.technicalReview.files]);

  useEffect(() => {
    setLocalStatus(state?.technicalReview.status || '');
  }, [state]);

  useEffect(() => {
    setLocalTimeAllocation(
      typeof state?.technicalReview.timeAllocation === 'number'
        ? state?.technicalReview.timeAllocation
        : ''
    );
  }, [state]);

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

  const shouldDisableForm =
    !(isUserOfficer || fapSecOrChairCanEdit) || isInternalReviewer;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const statusFieldId = `${id}.status`;
  //const publicCommentFieldId = `${id}.publicComment`;
  //const commentFieldId = `${id}.comment`;
  const timeAllocationFieldId = `${id}.timeAllocation`;

  return (
    <>
      {state?.technicalReview.technicalReviewAssignee && (
        <Typography variant="subtitle2" data-cy="reviewed-by-info">
          {`Reviewed by ${getFullUserName(state?.technicalReview.technicalReviewAssignee)}`}
        </Typography>
      )}

      <div>
        <Box sx={{ margin: theme.spacing(2, 0) }}>
          <CssBaseline />
          <PromptIfDirty />
          <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
              <Field
                name={statusFieldId}
                value={localStatus}
                options={statusOptions}
                component={Select}
                inputLabel={{ htmlFor: 'status', required: true }}
                label="Status"
                data-cy="technical-review-status"
                disabled={fapSecOrChairCanEdit}
                formControl={{ margin: 'normal' }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                    itemWithQuestionary: {
                      status: event?.target.value,
                      reviewerId: user.id,
                    },
                  });
                }}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <Field
                name={timeAllocationFieldId}
                value={localTimeAllocation}
                //label={`Time allocation(${state?.technicalReview?.proposal?.ca2ll?.allocationTimeUnit}s)`}
                label="Heka"
                id="time-allocation-input"
                type="number"
                data-cy="timeAllocation"
                disabled={fapSecOrChairCanEdit || shouldDisableForm}
                component={TextField}
                autoComplete="off"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                    itemWithQuestionary: {
                      timeAllocation: +event.target.value,
                      reviewerId: user.id,
                    },
                  });
                }}
              />
            </Grid>
            {(isUserOfficer ||
              isInstrumentScientist ||
              fapSecOrChairCanEdit) && (
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
                  initialValue={state?.technicalReview.comment || ''}
                  value={localComment}
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
                      setLocalComment(content);
                    }
                  }}
                  onBlur={() =>
                    dispatch({
                      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                      itemWithQuestionary: {
                        comment: localComment,
                        reviewerId: user.id,
                      },
                    })
                  }
                  disabled={shouldDisableForm}
                />
              </Grid>
            )}
            {(isUserOfficer ||
              isInstrumentScientist ||
              fapSecOrChairCanEdit) && (
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
                    setLocalFiles(newStateValue);
                    formikProps.setFieldValue('pdfUpload', newStateValue);
                    dispatch({
                      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                      itemWithQuestionary: {
                        files: newStateValue,
                        reviewerId: user.id,
                      },
                    });
                  }}
                  value={localFiles}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <InputLabel htmlFor="publicComment" shrink margin="dense">
                Comments for the review panel
              </InputLabel>
              <Editor
                id="publicComment"
                initialValue={state?.technicalReview.publicComment || ''}
                value={localPublicComment}
                init={{
                  skin: false,
                  content_css: false,
                  plugins: ['link', 'preview', 'code', 'charmap', 'wordcount'],
                  toolbar: 'bold italic',
                  branding: false,
                }}
                onEditorChange={(content, editor) => {
                  const isStartContentDifferentThanCurrent =
                    editor.startContent !==
                    editor.contentDocument.body.innerHTML;

                  if (isStartContentDifferentThanCurrent || editor.isDirty()) {
                    setLocalPublicComment(content);
                  }
                }}
                onBlur={() =>
                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                    itemWithQuestionary: {
                      publicComment: localPublicComment,
                      reviewerId: user.id,
                    },
                  })
                }
                disabled={shouldDisableForm}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  );

  /*const [localComment, setLocalComment] = useState(
    state?.technicalReview.comment || ''
  );
  const [numberOfChars, setNumberOfChars] = useState(0);

  const [localPublicComment, setLocalPublicComment] = useState(
    state?.technicalReview.publicComment || ''
  );

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const handleCharacterCount = (editor: TinyMCEEditor) => {
    const wordCount = editor.plugins.wordcount;
    setNumberOfChars(wordCount.body.getCharacterCount());
  };

  const commentFieldId = `${id}.comment`;
  const publicCommentField = `${id}.publicComment`;

  return (
    <div>
      <Box sx={{ margin: theme.spacing(2, 0) }}>
        <CssBaseline />
        <InputLabel htmlFor="comment" shrink margin="dense" required>
          Comment
        </InputLabel>

        <Editor
          id="comment"
          initialValue={state?.technicalReview.comment || ''}
          value={localComment}
          init={{
            skin: false,
            content_css: false,
            plugins: ['link', 'preview', 'code', 'charmap', 'wordcount'],
            toolbar: 'bold italic',
            branding: false,
            init_instance_callback: (editor) => {
              handleCharacterCount(editor);
            },
          }}
          onEditorChange={(content, editor) => {
            const isStartContentDifferentThanCurrent =
              editor.startContent !== editor.contentDocument.body.innerHTML;

            if (isStartContentDifferentThanCurrent || editor.isDirty()) {
              handleCharacterCount(editor);
            }
            setLocalComment(content);
          }}
          onBlur={() =>
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
              itemWithQuestionary: { comment: localComment },
            })
          }
        />
        <FormHelperText>
          Characters: {numberOfChars} / {6000}
        </FormHelperText>
        <ErrorMessage name={commentFieldId} />
      </Box>
      <Box sx={{ margin: theme.spacing(2, 0) }}>
        <CssBaseline />
        <InputLabel htmlFor="publicComment" shrink margin="dense" required>
          Public Comment
        </InputLabel>

        <Editor
          id="comment"
          initialValue={state?.technicalReview.publicComment || ''}
          value={localPublicComment}
          init={{
            skin: false,
            content_css: false,
            plugins: ['link', 'preview', 'code', 'charmap', 'wordcount'],
            toolbar: 'bold italic',
            branding: false,
            init_instance_callback: (editor) => {
              handleCharacterCount(editor);
            },
          }}
          onEditorChange={(content, editor) => {
            const isStartContentDifferentThanCurrent =
              editor.startContent !== editor.contentDocument.body.innerHTML;

            if (isStartContentDifferentThanCurrent || editor.isDirty()) {
              handleCharacterCount(editor);
            }
            setLocalPublicComment(content);
          }}
          onBlur={() =>
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
              itemWithQuestionary: { publicComment: localPublicComment },
            })
          }
        />
        <FormHelperText>
          Characters: {numberOfChars} / {6000}
        </FormHelperText>
        <ErrorMessage name={publicCommentField} />
      </Box>
    </div>
  );*/
}

const technicalReviewBasisPreSubmit =
  () =>
  async ({ api, state }: SubmitActionDependencyContainer) => {
    const technicalReview = (state as TechnicalReviewSubmissionState)
      .technicalReview;
    const {
      id,
      status,
      comment,
      publicComment,
      submitted,
      reviewerId,
      questionaryId,
      timeAllocation,
      proposalPk,
      files,
      instrumentId,
    } = technicalReview;

    const returnValue = state.questionary.questionaryId;

    console.log(technicalReview);

    if (id > 0) {
      await api.addTechnicalReview({
        proposalPk: proposalPk,
        timeAllocation: +(timeAllocation || 0),
        comment: comment,
        publicComment: publicComment,
        status: status,
        submitted: submitted,
        reviewerId: reviewerId,
        files: files,
        instrumentId: instrumentId,
        questionaryId: questionaryId,
      });
    }

    return returnValue;
  };

export {
  technicalReviewBasisPreSubmit,
  QuestionaryComponentTechnicalReviewBasis,
};
