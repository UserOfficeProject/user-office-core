import { Box, CssBaseline, FormHelperText, InputLabel } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import makeStyles from '@mui/styles/makeStyles';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Select, TextField } from 'formik-mui';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import Editor from 'components/common/TinyEditor';
import GradeGuidePage from 'components/pages/GradeGuidePage';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { ReviewContextType } from 'components/review/ReviewQuestionary';
import { SettingsContext } from 'context/SettingsContextProvider';
import { BasicUserDetails, ReviewStatus, SettingsId } from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useFapData } from 'hooks/fap/useFapData';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { useBasicUserData } from 'hooks/user/useUserData';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';

// const TextFieldNoSubmit = withPreventSubmit(TextField);

const useStyles = makeStyles((theme) => ({
  disabled: {
    pointerEvents: 'none',
    opacity: 0.7,
  },
  container: {
    margin: theme.spacing(2, 0),
  },
}));

function QuestionaryComponentFapReviewBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
  } = props;

  const classes = useStyles();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ReviewContextType;

  const [localComment, setLocalComment] = useState(state?.fapReview.comment);
  const [localGrade, setLocalGrade] = useState(state?.fapReview.grade);
  const [numberOfChars, setNumberOfChars] = useState(0);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { userData } = useBasicUserData(state?.fapReview.reviewer?.id);
  const [, setPIData] = useState<BasicUserDetails | null>(null);
  const { settingsMap } = useContext(SettingsContext);
  const { fap } = useFapData(state?.fapReview.fapID);

  useEffect(() => {
    if (userData !== null) {
      setPIData(userData);
    }
  }, [userData]);

  const gradeDecimalPoints = parseFloat(
    settingsMap.get(SettingsId.GRADE_PRECISION)?.settingsValue?.valueOf() ?? '1'
  );

  const initialValues = {
    grade: state?.fapReview.grade?.toString() || '',
    comment: state?.fapReview.comment || '',
    submitted: state?.fapReview.status === ReviewStatus.SUBMITTED,
    saveOnly: true,
    gradeGuide: fap?.gradeGuide,
  };

  const handleCharacterCount = (editor: TinyMCEEditor) => {
    const wordCount = editor.plugins.wordcount;
    setNumberOfChars(wordCount.body.getCharacterCount());
  };

  // @TODO: check if TextFieldNoSubmit can be applied
  return (
    <div>
      <div className={classes.container}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (): Promise<void> => {}}
        >
          {({ setFieldValue }) => (
            <Form>
              <CssBaseline />
              <InputLabel htmlFor="comment" shrink margin="dense" required>
                Comment
              </InputLabel>
              <Editor
                id={`${id}.comment`}
                initialValue={initialValues.comment}
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
                    editor.startContent !==
                    editor.contentDocument.body.innerHTML;

                  if (isStartContentDifferentThanCurrent || editor.isDirty()) {
                    handleCharacterCount(editor);
                    setFieldValue(`${id}.grade`, content);
                    setLocalComment(content);
                  }
                }}
                onBlur={() => {
                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                    itemWithQuestionary: { comment: localComment },
                  });
                }}
              />
              <FormHelperText>
                Characters: {numberOfChars} / {6000}
              </FormHelperText>
              <ErrorMessage name="comment" />
              <Box marginTop={1} width={150}>
                <Field
                  name={`${id}.grade`}
                  label="Grade"
                  component={gradeDecimalPoints === 1 ? Select : TextField}
                  MenuProps={{ 'data-cy': 'grade-proposal-options' }}
                  formControl={{
                    fullWidth: true,
                    required: true,
                    margin: 'normal',
                  }}
                  inputProps={
                    gradeDecimalPoints === 1
                      ? {
                          id: 'grade-proposal',
                          onChange: (event: ChangeEvent<HTMLInputElement>) =>
                            setLocalGrade(+event.target.value),
                          onBlur: () => {
                            dispatch({
                              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                              itemWithQuestionary: { grade: localGrade },
                            });
                          },
                        }
                      : {
                          id: 'grade-proposal',
                          step: gradeDecimalPoints,
                          inputMode: 'decimal',
                          type: 'number',
                          min: '1',
                          max: '10',
                          onChange: (event: ChangeEvent<HTMLInputElement>) =>
                            setLocalGrade(+event.target.value),
                          onBlur: () => {
                            dispatch({
                              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                              itemWithQuestionary: { grade: localGrade },
                            });
                          },
                        }
                  }
                  data-cy="grade-proposal"
                  labelId="grade-proposal-label"
                >
                  {gradeDecimalPoints === 1 &&
                    [...Array(10)].map((e, i) => {
                      return (
                        <MenuItem value={i + 1} key={i}>
                          {(i + 1).toString()}
                        </MenuItem>
                      );
                    })}
                </Field>
              </Box>
              <NavigationFragment>
                <ButtonWithDialog label="Grading guide" data-cy="grade-guide">
                  {fap ? <GradeGuidePage fap={fap} /> : <GradeGuidePage />}
                </ButtonWithDialog>
              </NavigationFragment>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

const fapReviewBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const fapReview = (state as FapReviewSubmissionState).fapReview;
    const { id, comment, grade, fapID, status, questionaryID } = fapReview;

    const returnValue = state.questionary.questionaryId;

    if (id > 0) {
      const result = await api.updateReview({
        reviewID: id,
        status: status,
        fapID: fapID,
        questionaryID: questionaryID,
        grade: grade!,
        comment: comment!,
      });

      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: {
          ...fapReview,
          ...result.updateReview,
        },
      });
    } else {
    }

    return returnValue;
  };

export { fapReviewBasisPreSubmit, QuestionaryComponentFapReviewBasis };
