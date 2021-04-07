import TextField from '@material-ui/core/TextField';
import React, { useState } from 'react';

export default function RankInput(props: {
  defaultValue: number | null | undefined;
  proposalID: number;
  onChange: (proposalID: number, ranking: number) => void;
}) {
  const [value, setValue] = useState(props.defaultValue);
  const [editable, setEditable] = useState(false);

  if (!editable) {
    return <p onClick={() => setEditable(true)}>{value || 'NA'}</p>;
  }

  return (
    <TextField
      id="ranking-number-input"
      label="Rank"
      type="number"
      autoFocus
      defaultValue={props.defaultValue}
      onChange={(event) => setValue(parseInt(event.target.value))}
      onKeyPress={(ev) => {
        if (ev.key === 'Enter' && typeof value === 'number') {
          props.onChange(props.proposalID, value);
          setEditable(false);
          ev.preventDefault();
        }
      }}
    />
  );
}
