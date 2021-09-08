import { Button, makeStyles, Typography } from '@material-ui/core';
import { Form, Formik } from 'formik';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { QuestionaryContext } from 'components/questionary/QuestionaryContext';
import { createFormikConfigObjects } from 'components/questionary/QuestionaryStepView';
import { Questionary, Answer, DataType } from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';
import { getAllFields } from 'models/questionary/QuestionaryFunctions';
import { QuestionarySubmissionModel } from 'models/questionary/QuestionarySubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import QuestionaryComponentSampleDeclaration from '../SampleDeclaration/QuestionaryComponentSampleDeclaration';

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(3),
  },
}));

const filterSampleAnswers = (questionary: Questionary): Answer[] => {
  const isSampleFilter = (answer: Answer) =>
    answer.question.dataType === DataType.SAMPLE_DECLARATION;

  const allAnswers: Answer[] = getAllFields(questionary.steps) as Answer[];
  const sampleAnswers = allAnswers.filter(isSampleFilter);

  return sampleAnswers;
};

interface EditProposalSamplesProps {
  proposal: ProposalData;
  onClose: () => void;
}

function EditProposalSamples({ proposal, onClose }: EditProposalSamplesProps) {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();

  const sampleAnswers = filterSampleAnswers(proposal.questionary);

  const initialState = new ProposalSubmissionState(proposal, 0, false, []);
  const {
    state,
    dispatch,
  } = QuestionarySubmissionModel<ProposalSubmissionState>(initialState, []);

  const { initialValues } = createFormikConfigObjects(
    sampleAnswers,
    state,
    api
  );

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Typography variant="h5" className={classes.title}>
        Proposal samples
      </Typography>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {(formikProps) => (
          <Form>
            {sampleAnswers.map((answer) => (
              <QuestionaryComponentSampleDeclaration
                answer={answer}
                formikProps={formikProps}
                key={answer.question.id}
              />
            ))}
            <ActionButtonContainer>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => onClose()}
                data-cy="close-edit-proposal-samples"
              >
                Close
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </QuestionaryContext.Provider>
  );
}

export default EditProposalSamples;
