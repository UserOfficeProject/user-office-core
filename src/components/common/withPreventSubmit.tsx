import React, { KeyboardEvent } from 'react';

interface WithPreventSubmitProps {
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => false | undefined;
  multiline?: boolean;
}
/**
 * Returns modified WrapperComponent which will not trigger submit form submission when ENTER is pressed
 * @param WrappedComponent
 */
const withPreventSubmit = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithPreventSubmitProps> => ({
  onKeyDown,
  multiline,
  ...props
}: WithPreventSubmitProps) => (
  <WrappedComponent
    {...(props as P)}
    multiline={multiline}
    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
      const response = onKeyDown?.(event);
      if (!multiline && event.key.toLowerCase() === 'enter') {
        event.preventDefault();

        return false;
      }

      return response;
    }}
  />
);

export default withPreventSubmit;
