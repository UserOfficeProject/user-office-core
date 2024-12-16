import {
  Box,
  CssBaseline,
  FormHelperText,
  InputLabel,
  useTheme,
} from '@mui/material';
import { ErrorMessage } from 'formik';
import React, { useContext, useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import Editor from 'components/common/TinyEditor';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { TechnicalReviewContextType } from 'components/review/TechnicalReviewQuestionary';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { TechnicalReviewSubmissionState } from 'models/questionary/technicalReview/TechnicalReviewSubmissionState';

function QuestionaryComponentTechnicalReviewBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
  } = props;

  const theme = useTheme();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as TechnicalReviewContextType;

  const [localComment, setLocalComment] = useState(
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
  );
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
