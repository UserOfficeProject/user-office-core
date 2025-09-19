import {
  Box,
  CssBaseline,
  FormHelperText,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { ErrorMessage, Field } from 'formik';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import Editor from 'components/common/TinyEditor';
import TitledContainer from 'components/common/TitledContainer';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { ReviewContextType } from 'components/review/ReviewQuestionary';
import { FapReviewBasisConfig } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';

function QuestionaryComponentFapReviewBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
  } = props;

  const config = props.answer.config as FapReviewBasisConfig;

  const theme = useTheme();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ReviewContextType;

  const [localComment, setLocalComment] = useState(
    state?.fapReview.comment || ''
  );
  const [numberOfChars, setNumberOfChars] = useState(0);

  const [localGrade, setLocalGrade] = useState(
    state?.fapReview.grade || undefined
  );

  const [gradeType, setGradeType] = useState<'Number' | 'Classification'>(
    config.nonNumericOptions.length > 0 &&
      config.nonNumericOptions.find((v) => v === state?.fapReview.grade)
      ? 'Classification'
      : 'Number'
  );

  useEffect(() => {
    setLocalGrade(state?.fapReview.grade || undefined);
  }, [state]);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const handleCharacterCount = (editor: TinyMCEEditor) => {
    const wordCount = editor.plugins.wordcount;
    setNumberOfChars(wordCount.body.getCharacterCount());
  };

  const gradeFieldId = `${id}.grade`;
  const commentFieldId = `${id}.comment`;

  return (
    <div>
      <Box sx={{ margin: theme.spacing(2, 0) }}>
        <CssBaseline />
        <InputLabel htmlFor="comment" shrink margin="dense" required>
          Comment
        </InputLabel>

        <Editor
          id="comment"
          initialValue={state?.fapReview.comment || ''}
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
          onBlur={() => {
            return dispatch({
              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
              itemWithQuestionary: { comment: localComment },
            });
          }}
        />
        <FormHelperText>
          Characters: {numberOfChars} / {6000}
        </FormHelperText>
        <ErrorMessage name={commentFieldId} />
        <>localComment: {localComment}</>
        <TitledContainer label="Grade">
          {config.nonNumericOptions.length > 0 && (
            <ToggleButtonGroup
              color="primary"
              value={gradeType}
              exclusive
              onChange={(_, v) => {
                setGradeType(v);
                setLocalGrade(undefined);
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                  itemWithQuestionary: { grade: undefined },
                });
              }}
              title="Select grade type"
              size="small"
            >
              <ToggleButton value="Number">Number</ToggleButton>
              <ToggleButton value="Classification">Classification</ToggleButton>
            </ToggleButtonGroup>
          )}

          <Box marginTop={1} width={150}>
            <Field
              name={gradeFieldId}
              label={
                gradeType === 'Classification' ? 'Classification' : 'Grade'
              }
              value={localGrade || ''}
              component={
                gradeType === 'Classification' || config.decimalPoints === 0
                  ? Select
                  : TextField
              }
              MenuProps={{ 'data-cy': 'grade-proposal-options' }}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                  itemWithQuestionary: { grade: event.target.value },
                });
              }}
              formControl={{
                fullWidth: true,
                required: true,
                margin: 'normal',
              }}
              inputProps={
                gradeType === 'Classification' || config.decimalPoints === 0
                  ? {
                      id: 'grade-proposal',
                    }
                  : {
                      id: 'grade-proposal',
                      step: Math.pow(10, -config.decimalPoints).toString(),
                      inputMode: 'decimal',
                      type: 'number',
                      min: '1',
                      max: '10',
                    }
              }
              data-cy="grade-proposal"
              labelId="grade-proposal-label"
              options={
                gradeType === 'Classification'
                  ? config.nonNumericOptions.map((option) => ({
                      text: option,
                      value: option,
                    }))
                  : config.decimalPoints === 0
                    ? [...Array(10)].map((e, i) => ({
                        text: (i + 1).toString(),
                        value: (i + 1).toString(),
                      }))
                    : undefined
              }
            />
          </Box>
        </TitledContainer>
      </Box>
    </div>
  );
}

const fapReviewBasisPreSubmit =
  () =>
  async ({ api, state }: SubmitActionDependencyContainer) => {
    const fapReview = (state as FapReviewSubmissionState).fapReview;
    const { id, comment, grade, fapID, status, questionaryID } = fapReview;

    const returnValue = state.questionary.questionaryId;

    if (id > 0) {
      await api.updateReview({
        reviewID: id,
        status: status,
        fapID: fapID,
        questionaryID: questionaryID,
        grade: grade || '0',
        comment: comment || '',
      });
    }

    return returnValue;
  };

export { fapReviewBasisPreSubmit, QuestionaryComponentFapReviewBasis };
