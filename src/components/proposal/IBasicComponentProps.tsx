import { FormikProps } from 'formik';

import { Answer } from 'generated/sdk';

export interface BasicComponentProps {
  answer: Answer;
  formikProps: FormikProps<any>;
  onComplete: (newValue: Answer['value']) => void;
}
