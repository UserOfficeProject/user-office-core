import React, { useState } from 'react';

export function ClickToEditTextField(props: ClickToEditTextFieldProps) {
  const [isInput, setIsInput] = useState(false);
  const { inputJSX, staticJSX, onChange } = props;

  const finishEdit = () => {
    setIsInput(false);
    onChange();
  };

  return isInput ? (
    <inputJSX.type
      {...inputJSX.props}
      onBlur={() => {
        inputJSX.props.onBlur?.();
        finishEdit();
      }}
      keyDown={(e: React.KeyboardEvent) => {
        inputJSX.props.keyDown?.(e);
        if (e.key === 'Enter') {
          finishEdit();
        }
      }}
    />
  ) : (
    <staticJSX.type
      {...staticJSX.props}
      onClick={() => {
        inputJSX.props.onClick?.();
        setIsInput(true);
      }}
    />
  );
}

interface ClickToEditTextFieldProps {
  inputJSX: JSX.Element & { addEventListener?: Function };
  staticJSX: JSX.Element & { addEventListener?: Function };
  onChange: () => void;
}
