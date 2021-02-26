import { connect, FormikContextType } from 'formik';
import { Component } from 'react';

interface ErrorFocusInternalProps {
  formik: FormikContextType<Record<string, unknown>>;
}

class ErrorFocusInternal extends Component<ErrorFocusInternalProps> {
  public componentDidUpdate(prevProps: ErrorFocusInternalProps): void {
    const { isSubmitting, isValidating, errors } = prevProps.formik;
    const keys = Object.keys(errors);
    if (keys.length > 0 && isSubmitting && !isValidating) {
      const selector = `[name="${keys[0]}"]`;
      const errorElement = document.querySelector(selector) as HTMLElement;
      if (errorElement) {
        errorElement.focus();
      }
    }
  }

  public render = (): null => null;
}

export const ErrorFocus = connect<Record<string, unknown>>(ErrorFocusInternal);
