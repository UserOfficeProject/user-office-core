import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
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
      <Table>
        <TableBody>
          <TableRow key="title">
            <TableCell>Title</TableCell>
            <TableCell>{sample.title}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <QuestionaryDetails questionaryId={sample.questionaryId} />
    </>
  );
}

export default SampleDetails;
