import React from 'react';

import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { useSample } from 'hooks/sample/useSample';

interface SampleDetailsProps {
  sampleId: number;
}
function SampleDetails(props: SampleDetailsProps) {
  const { sample } = useSample(props.sampleId);

  if (!sample) {
    return <span>loading...</span>;
  }
  const additionalDetails: TableRowData[] = [
    {
      label: 'Title',
      value: sample.title,
    },
  ];

  return (
    <>
      <QuestionaryDetails
        questionaryId={sample.questionaryId}
        additionalDetails={additionalDetails}
        title="Sample information"
      />
    </>
  );
}

export default SampleDetails;
