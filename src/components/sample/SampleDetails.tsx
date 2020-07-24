import { Typography } from '@material-ui/core';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { useSample } from 'hooks/sample/useSample';
import React from 'react';

interface SampleInformationProps {
  sampleId: number;
}
function SampleDetails(props: SampleInformationProps) {
  const { sample } = useSample(props.sampleId);

  if (!sample) {
    return <span>loading...</span>;
  }

  return (
    <>
      <Typography variant="h6">{sample.title}</Typography>
      <QuestionaryDetails questionaryId={sample.questionaryId} />
    </>
  );
}

export default SampleDetails;
