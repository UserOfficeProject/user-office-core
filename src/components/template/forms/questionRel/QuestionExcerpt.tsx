import { Grid } from '@material-ui/core';
import React from 'react';
import { Question } from '../../../../generated/sdk';
import TitledContainer from '../../../common/TitledContainer';

export function QuestionExcerpt({ question }: { question: Question }) {
  return (
    <TitledContainer label={`Question - ${question.naturalKey}`}>
      <Grid container>
        <Grid item xs={12}>
          {question.question}
        </Grid>
      </Grid>
    </TitledContainer>
  );
}
