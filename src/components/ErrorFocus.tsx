import {connect, FormikContext} from "formik";
import {Component} from "react";

interface IProps {
    formik: FormikContext<any>;
}

class ErrorFocusInternal extends Component<IProps> {
    public componentDidUpdate(prevProps: IProps) {
        const {isSubmitting, isValidating, errors} = prevProps.formik;
        const keys = Object.keys(errors);
        if (keys.length > 0 && isSubmitting && !isValidating) {
            const selector = `[name="${keys[0]}"]`;
            const errorElement = document.querySelector(selector) as HTMLElement;
            if (errorElement) {
                errorElement.focus();
            }
        }
    }

    public render = () => null;
}

export const ErrorFocus = connect<{}>(ErrorFocusInternal);