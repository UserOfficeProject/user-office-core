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

// Whole-number grades are always 1 to 10 and do not depend on the config, so
// the list is built once rather than on every render.
const WHOLE_NUMBER_GRADES = Array.from({ length: 10 }, (_, i) => ({
  text: (i + 1).toString(),
  value: (i + 1).toString(),
}));

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

  // A classification, or a whole-number grade, is picked from a list;
  // anything else is typed into a numeric field.
  const isGradePickedFromList =
    gradeType === 'Classification' || config.decimalPoints === 0;

  const gradeLabel =
    gradeType === 'Classification' ? 'Classification' : 'Grade';

  const handleGradeChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
      itemWithQuestionary: { grade: event.target.value },
    });
  };

  // Only the list-backed variants have options; the numeric field has none.
  const gradeOptions = !isGradePickedFromList
    ? undefined
    : gradeType === 'Classification'
      ? config.nonNumericOptions.map((option) => ({
          text: option,
          value: option,
        }))
      : WHOLE_NUMBER_GRADES;

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

          <Box
            sx={{
              marginTop: 1,
              width: 150,
            }}
          >
            {isGradePickedFromList ? (
              <Field
                name={gradeFieldId}
                label={gradeLabel}
                value={localGrade || ''}
                component={Select}
                onChange={handleGradeChange}
                formControl={{
                  fullWidth: true,
                  required: true,
                  margin: 'normal',
                }}
                inputProps={{ id: 'grade-proposal' }}
                MenuProps={{ 'data-cy': 'grade-proposal-options' }}
                labelId="grade-proposal-label"
                options={gradeOptions}
                data-cy="grade-proposal"
              />
            ) : (
              <Field
                name={gradeFieldId}
                label={gradeLabel}
                value={localGrade || ''}
                component={TextField}
                onChange={handleGradeChange}
                slotProps={{
                  htmlInput: {
                    id: 'grade-proposal',
                    step: Math.pow(10, -config.decimalPoints).toString(),
                    inputMode: 'decimal',
                    type: 'number',
                    min: '1',
                    max: '10',
                  },
                }}
                data-cy="grade-proposal"
              />
            )}
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
