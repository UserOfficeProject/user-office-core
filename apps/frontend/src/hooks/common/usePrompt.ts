import * as React from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

function usePrompt(
  message: string | null | undefined | false,
  { beforeUnload }: { beforeUnload?: boolean } = {}
) {
  const blocker = useBlocker(
    React.useCallback(
      () => (typeof message === 'string' ? !window.confirm(message) : false),
      [message]
    )
  );
  const prevState = React.useRef(blocker.state);
  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    prevState.current = blocker.state;
  }, [blocker]);

  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (beforeUnload && typeof message === 'string') {
          event.preventDefault();
          event.returnValue = message;
        }
      },
      [message, beforeUnload]
    ),
    { capture: true }
  );
}

interface PromptProps {
  when: boolean;
  message: string;
  beforeUnload?: boolean;
}

export const Prompt = ({ when, message, ...props }: PromptProps) => {
  usePrompt(when ? message : false, props);

  return null;
};
