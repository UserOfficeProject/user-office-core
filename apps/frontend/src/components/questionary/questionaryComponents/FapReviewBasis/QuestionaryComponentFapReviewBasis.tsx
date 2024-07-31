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

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
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
import { BasicUserDetails, SettingsId, UserRole } from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useFapData } from 'hooks/fap/useFapData';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { useBasicUserData } from 'hooks/user/useUserData';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';

// const TextFieldNoSubmit = withPreventSubmit(TextField);

function QuestionaryComponentFapReviewBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
    formikProps,
  } = props;

  const theme = useTheme();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ReviewContextType;

  const [localComment, setLocalComment] = useState(state?.fapReview?.comment);
  const [localGrade, setLocalGrade] = useState(state?.fapReview?.grade);
  const [numberOfChars, setNumberOfChars] = useState(0);
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { userData } = useBasicUserData(state?.fapReview?.reviewer?.id);
  const [, setPIData] = useState<BasicUserDetails | null>(null);
  const { settingsMap } = useContext(SettingsContext);
  const { fap } = useFapData(state?.fapReview?.fapID);

  useEffect(() => {
    if (userData !== null) {
      setPIData(userData);
    }
  }, [userData]);

  const gradeDecimalPoints = parseFloat(
    settingsMap.get(SettingsId.GRADE_PRECISION)?.settingsValue?.valueOf() ?? '1'
  );

  const handleCharacterCount = (editor: TinyMCEEditor) => {
    const wordCount = editor.plugins.wordcount;
    setNumberOfChars(wordCount.body.getCharacterCount());
  };

  // @TODO: check if TextFieldNoSubmit can be applied
  return (
    <div>
      <Box sx={{ margin: theme.spacing(2, 0) }}>
        {/* <Formik
          initialValues={initialValues}
          onSubmit={async (): Promise<void> => { }}
        >
          {({ setFieldValue }) => ( */}
        <>
          <CssBaseline />
          <InputLabel htmlFor="comment" shrink margin="dense" required>
            Comment
          </InputLabel>
          <Editor
            id={`${id}.comment`}
            initialValue={formikProps.initialValues[id]['comment']}
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
                //setFieldValue(`${id}.comment`, content); @TODO: fix
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
          <NavigationFragment>
            <ButtonWithDialog label="Grading guide" data-cy="grade-guide">
              {fap ? <GradeGuidePage fap={fap} /> : <GradeGuidePage />}
            </ButtonWithDialog>
            {hasAccessRights && (
              <Field
                id="submitted"
                name="submitted"
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Submitted',
                }}
                data-cy="is-grade-submitted"
              />
            )}
          </NavigationFragment>
        </>
        {/* )}
      </Formik> */}
      </Box>
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
