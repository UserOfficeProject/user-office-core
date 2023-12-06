import DoneAll from '@mui/icons-material/DoneAll';
import Save from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { proposalGradeValidationSchema } from '@user-office-software/duo-validation/lib/Review';
import { Field, Form, Formik, useFormikContext } from 'formik';
import { Select, TextField, CheckboxWithLabel } from 'formik-mui';
import React, { useState, useContext } from 'react';
import { Prompt } from 'react-router';
import { Editor as TinyMCEEditor } from 'tinymce';

import { useCheckAccess } from 'components/common/Can';
import ErrorMessage from 'components/common/ErrorMessage';
import Editor from 'components/common/TinyEditor';
import UOLoader from 'components/common/UOLoader';
import GradeGuidePage from 'components/pages/GradeGuidePage';
import NavigationFragment from 'components/questionary/NavigationFragment';
import { SettingsContext } from 'context/SettingsContextProvider';
import { ReviewStatus, Review, UserRole, SettingsId } from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useFapData } from 'hooks/fap/useFapData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type ProposalGradeProps = {
  review: Review | null;
  setReview: React.Dispatch<React.SetStateAction<Review | null>>;
  onChange: FunctionType;
  confirm: WithConfirmType;
  fapId: number;
};

type GradeFormType = {
  grade: string | number;
  comment: string;
  submitted: boolean;
  saveOnly: boolean;
};

const ProposalGrade = ({
  review,
  setReview,
  onChange,
  confirm,
  fapId,
}: ProposalGradeProps) => {
  const { fap } = useFapData(fapId);
  const { api } = useDataApiWithFeedback();
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numberOfChars, setNumberOfChars] = useState(0);
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);
  const { settingsMap } = useContext(SettingsContext);

  const gradeDecimalPoints = parseFloat(
    settingsMap.get(SettingsId.GRADE_PRECISION)?.settingsValue?.valueOf() ?? '1'
  );

  if (!review) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const initialValues = {
    grade: review.grade?.toString() || '',
    comment: review.comment || '',
    submitted: review.status === ReviewStatus.SUBMITTED,
    saveOnly: true,
    gradeGuide: fap?.gradeGuide,
  };

  const PromptIfDirty = () => {
    const formik = useFormikContext();

    return (
      <Prompt
        when={formik.dirty && formik.submitCount === 0}
        message="Changes you recently made in this tab will be lost! Are you sure?"
      />
    );
  };

  const isDisabled = (isSubmitting: boolean) =>
    isSubmitting ||
    (review.status === ReviewStatus.SUBMITTED && !hasAccessRights);

  const handleSubmit = async (values: GradeFormType) => {
    const { updateReview } = await api({
      toastSuccessMessage: shouldSubmit ? 'Submitted' : 'Updated',
    }).updateReview({
      reviewID: review.id,
      grade: +values.grade,
      comment: values.comment ? values.comment : '',
      status:
        shouldSubmit || values.submitted
          ? ReviewStatus.SUBMITTED
          : ReviewStatus.DRAFT,
      fapID: review.fapID,
    });

    setReview({
      ...review,
      comment: updateReview.comment,
      grade: updateReview.grade,
      status: updateReview.status,
    });
    onChange();
    setIsSubmitting(false);
  };

  const handleCharacterCount = (editor: TinyMCEEditor) => {
    const wordCount = editor.plugins.wordcount;
    setNumberOfChars(wordCount.body.getCharacterCount());
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        setIsSubmitting(true);
        if (shouldSubmit) {
          confirm(
            async () => {
              await handleSubmit(values);
            },
            {
              title: 'Please confirm',
              description:
                'I am aware that no further changes to the grade are possible after submission.',
              onCancel: () => {
                setIsSubmitting(false);
              },
            }
          )();
        } else {
          await handleSubmit(values);
        }
      }}
      validationSchema={proposalGradeValidationSchema}
    >
      {({ setFieldValue }) => (
        <Form>
          <PromptIfDirty />
          <CssBaseline />
          <InputLabel htmlFor="comment" shrink margin="dense" required>
            Comment
          </InputLabel>
          <Editor
            id="comment"
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
                editor.startContent !== editor.contentDocument.body.innerHTML;

              if (isStartContentDifferentThanCurrent || editor.isDirty()) {
                handleCharacterCount(editor);
                setFieldValue('comment', content);
              }
            }}
            disabled={isDisabled(isSubmitting)}
          />
          <FormHelperText>
            Characters: {numberOfChars} / {2000}
          </FormHelperText>
          <ErrorMessage name="comment" />
          <Box marginTop={1} width={150}>
            <Field
              name="grade"
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
          <ErrorMessage name="grade" />
          <NavigationFragment isLoading={isSubmitting}>
            <ButtonWithDialog
              label="Grading guide"
              disabled={isSubmitting}
              data-cy="grade-guide"
            >
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
                disabled={isSubmitting}
                data-cy="is-grade-submitted"
              />
            )}
            <Button
              data-cy="save-grade"
              disabled={isDisabled(isSubmitting)}
              color="secondary"
              type="submit"
              onClick={() => setShouldSubmit(false)}
              startIcon={<Save />}
            >
              Save
            </Button>
            {!hasAccessRights && (
              <Button
                data-cy="submit-grade"
                disabled={isDisabled(isSubmitting)}
                type="submit"
                onClick={() => setShouldSubmit(true)}
                startIcon={<DoneAll />}
              >
                {review.status === ReviewStatus.SUBMITTED
                  ? 'Submitted'
                  : 'Submit'}
              </Button>
            )}
          </NavigationFragment>
        </Form>
      )}
    </Formik>
  );
};

export default withConfirm(ProposalGrade);
