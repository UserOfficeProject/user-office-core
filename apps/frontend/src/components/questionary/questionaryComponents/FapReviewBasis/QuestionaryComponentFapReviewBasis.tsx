import {
  Box,
  CssBaseline,
  FormHelperText,
  InputLabel,
  useTheme,
} from '@mui/material';
import { ErrorMessage, Field } from 'formik';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import Editor from 'components/common/TinyEditor';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { ReviewContextType } from 'components/review/ReviewQuestionary';
import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';

function QuestionaryComponentFapReviewBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
  } = props;

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

  useEffect(() => {
    setLocalGrade(state?.fapReview.grade || undefined);
  }, [state]);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { settingsMap } = useContext(SettingsContext);

  const gradeDecimalPoints = parseFloat(
    settingsMap.get(SettingsId.GRADE_PRECISION)?.settingsValue?.valueOf() ?? '1'
  );

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
        <Box marginTop={1} width={150}>
          <Field
            name={gradeFieldId}
            label="Grade"
            value={localGrade}
            component={gradeDecimalPoints === 1 ? Select : TextField}
            MenuProps={{ 'data-cy': 'grade-proposal-options' }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              dispatch({
                type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                itemWithQuestionary: { grade: +event.target.value },
              });
            }}
            formControl={{
              fullWidth: true,
              required: true,
              margin: 'normal',
            }}
            inputProps={
              gradeDecimalPoints === 1
                ? {
                    id: 'grade-proposal',
                  }
                : {
                    id: 'grade-proposal',
                    step: gradeDecimalPoints,
                    inputMode: 'decimal',
                    type: 'number',
                    min: '1',
                    max: '10',
                  }
            }
            data-cy="grade-proposal"
            labelId="grade-proposal-label"
            options={
              gradeDecimalPoints === 1
                ? [...Array(10)].map((e, i) => ({
                    text: (i + 1).toString(),
                    value: i + 1,
                  }))
                : undefined
            }
          />
        </Box>
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
        grade: grade || 0,
        comment: comment || '',
      });
    }

    return returnValue;
  };

export { fapReviewBasisPreSubmit, QuestionaryComponentFapReviewBasis };
