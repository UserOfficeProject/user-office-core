import { DialogContent, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import React, { useCallback, useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import withHandleEnter from 'components/common/withHandleEnter';

import { FunctionType } from './utilTypes';

const defaultOptions: Options = {
  title: '',
  question: '',
  prefilledAnswer: '',
  okBtnLabel: 'OK',
  cancelBtnLabel: 'Cancel',
};

const TextFieldWithHandleEnter = withHandleEnter(TextField);

/**
 * withPrompt allows to easily use prompt UI dialog for single string question input.
 * Usage:
 * prompt((answer) => console.log(answer), {
 *   question: 'Enter some text',
 * })()
 * @param WrappedComponent
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const withPrompt = <T extends {}>(WrappedComponent: React.ComponentType<T>) => {
  return function WithPromptComponent(props: Omit<T, 'prompt'>): JSX.Element {
    const [onPrompt, setOnPrompt] = useState<((answer: string) => void) | null>(
      null
    );
    const [options, setOptions] = useState(defaultOptions);
    const [answer, setAnswer] = useState<string>(options.prefilledAnswer);

    const { question, okBtnLabel, cancelBtnLabel } = options;
    const handleCancel = useCallback(() => {
      setOnPrompt(null);
    }, []);
    const handleOk = useCallback(() => {
      if (onPrompt) {
        onPrompt(answer);
      }
      setOnPrompt(null);
    }, [onPrompt, answer]);

    const prompt = useCallback(
      (onPrompt: FunctionType, options: Options) => (): void => {
        setOnPrompt(() => onPrompt);
        setOptions({ ...defaultOptions, ...options });
        setAnswer(options.prefilledAnswer);
      },
      []
    );

    return (
      <>
        <WrappedComponent {...(props as T)} prompt={prompt} />
        <StyledDialog
          fullWidth
          open={!!onPrompt}
          onClose={handleCancel}
          title={options.title}
        >
          <DialogContent dividers>
            <TextFieldWithHandleEnter
              id="prompt-input"
              data-cy="prompt-input"
              label={question}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              fullWidth
              autoFocus
              onEnter={handleOk}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={handleCancel}>
              {cancelBtnLabel}
            </Button>
            <Button variant="text" onClick={handleOk} data-cy="prompt-ok">
              {okBtnLabel}
            </Button>
          </DialogActions>
        </StyledDialog>
      </>
    );
  };
};

interface Options {
  title: string;
  question: string;
  prefilledAnswer: string;
  okBtnLabel: string;
  cancelBtnLabel: string;
  dialogProps?: Record<string, unknown>;
}

export type WithPromptType = (
  callback: (answer: string) => void,
  params: Partial<Options>
) => FunctionType;

export default withPrompt;
