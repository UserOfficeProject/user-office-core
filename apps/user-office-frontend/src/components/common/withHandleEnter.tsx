import { TextFieldProps } from '@mui/material';
import React, { KeyboardEvent } from 'react';

interface WithHandleEnterProps {
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => false | undefined;
  onEnter: (value: string) => void;
}
/**
 * Returns modified TextField with onEnter callback,
 * which will be called when RETURN is pressed
 * @param WrappedTextField
 */
const withHandleEnter = <P extends TextFieldProps>(
  WrappedTextField: React.ComponentType<P>
): React.FC<P & WithHandleEnterProps> => {
  return function withHandleEnterComponent({
    onEnter,
    ...props
  }: WithHandleEnterProps) {
    return (
      <WrappedTextField
        {...(props as P)}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key.toLowerCase() === 'enter') {
            onEnter(event.currentTarget.value);
          }
        }}
      />
    );
  };
};

export default withHandleEnter;
