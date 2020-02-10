import { makeStyles } from "@material-ui/core";
import { Formik } from "formik";
import React, { useContext, SyntheticEvent } from "react";
import * as Yup from "yup";
import { DataType, QuestionaryField, QuestionaryStep } from "../generated/sdk";
import { useUpdateProposal } from "../hooks/useUpdateProposal";
import { ProposalAnswer } from "../models/ProposalModel";
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId
} from "../models/ProposalModelFunctions";
import {
  EventType,
  IProposalSubmissionModelState
} from "../models/ProposalSubmissionModel";
import JSDict from "../utils/Dictionary";
import submitFormAsync from "../utils/FormikAsyncFormHandler";
import { ErrorFocus } from "./ErrorFocus";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalComponentBoolean } from "./ProposalComponentBoolean";
import { ProposalComponentDatePicker } from "./ProposalComponentDatePicker";
import { ProposalComponentEmbellishment } from "./ProposalComponentEmbellishment";
import { ProposalComponentFileUpload } from "./ProposalComponentFileUpload";
import { ProposalComponentMultipleChoice } from "./ProposalComponentMultipleChoice";
import { ProposalComponentTextInput } from "./ProposalComponentTextInput";
import { ProposalSubmissionContext } from "./ProposalContainer";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import { createFormikConfigObjects } from "./ProposalYupUtilities";

export default function ProposalQuestionaryStep(props: {
  data: IProposalSubmissionModelState;
  topicId: number;
  readonly: boolean;
}) {
  const { data, topicId } = props;
  const componentFactory = new ComponentFactory();
  const { loading: formSaving } = useUpdateProposal();
  const classes = makeStyles({
    componentWrapper: {
      margin: "10px 0"
    },
    disabled: {
      pointerEvents: "none",
      opacity: 0.7
    }
  })();
  const { dispatch } = useContext(ProposalSubmissionContext)!;

  if (data == null) {
    return <div>loading...</div>;
  }

  const questionary = data.proposal.questionary!;
  const questionaryStep = getStepByTopicId(questionary, topicId) as
    | QuestionaryStep
    | undefined;
  if (!questionaryStep) {
    return null;
  }

  const activeFields = questionaryStep
    ? questionaryStep.fields.filter(field => {
        return areDependenciesSatisfied(
          questionary,
          field.proposal_question_id
        );
      })
    : [];

  const { initialValues, validationSchema } = createFormikConfigObjects(
    activeFields
  );

  const saveStepData = async (markAsComplete: boolean) => {
    const answers: ProposalAnswer[] = activeFields.map(field => {
      return (({ proposal_question_id, data_type, value }) => ({
        proposal_question_id,
        data_type,
        value
      }))(field); // convert field to answer object
    });

    dispatch({
      type: markAsComplete
        ? EventType.FINISH_STEP_CLICKED
        : EventType.SAVE_STEP_CLICKED,
      payload: {
        answers: answers,
        topicId: props.topicId
      }
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={() => {}}
      enableReinitialize={true}
    >
      {({ errors, touched, handleChange, submitForm, validateForm }) => (
        <form className={props.readonly ? classes.disabled : undefined}>
          {activeFields.map(field => {
            return (
              <div
                className={classes.componentWrapper}
                key={field.proposal_question_id}
              >
                {componentFactory.createComponent(field, {
                  touched: touched, // for formik
                  errors: errors, // for formik
                  onComplete: (evt: SyntheticEvent, newValue: any) => {
                    dispatch({
                      type: EventType.FIELD_CHANGED,
                      payload: {
                        id: field.proposal_question_id,
                        newValue: newValue
                      }
                    });
                    handleChange(evt);
                  } // for formik
                })}
              </div>
            );
          })}
          <ProposalNavigationFragment
            disabled={props.readonly}
            back={{
              callback: () => {
                dispatch({ type: EventType.BACK_CLICKED });
              }
            }}
            reset={{
              callback: () => dispatch({ type: EventType.RESET_CLICKED }),
              disabled: !props.data.isDirty
            }}
            save={
              questionaryStep.isCompleted
                ? undefined
                : {
                    callback: () => {
                      saveStepData(false);
                    },
                    disabled: !props.data.isDirty
                  }
            }
            saveAndNext={{
              callback: () => {
                submitFormAsync(submitForm, validateForm).then(
                  (isValid: boolean) => {
                    if (isValid) {
                      saveStepData(true);
                    }
                  }
                );
              }
            }}
            isLoading={formSaving}
          />
          <ErrorFocus />
        </form>
      )}
    </Formik>
  );
}

class ComponentFactory {
  private componentMap = JSDict.Create<string, any>();

  constructor() {
    this.componentMap.put(DataType.TEXT_INPUT, ProposalComponentTextInput);
    this.componentMap.put(DataType.BOOLEAN, ProposalComponentBoolean);
    this.componentMap.put(DataType.DATE, ProposalComponentDatePicker);
    this.componentMap.put(DataType.FILE_UPLOAD, ProposalComponentFileUpload);
    this.componentMap.put(
      DataType.SELECTION_FROM_OPTIONS,
      ProposalComponentMultipleChoice
    );
    this.componentMap.put(
      DataType.EMBELLISHMENT,
      ProposalComponentEmbellishment
    );
  }
  createComponent(
    field: QuestionaryField,
    props: any
  ): React.ComponentElement<IBasicComponentProps, any> {
    props.templateField = field;
    props.key = field.proposal_question_id;

    const component = this.componentMap.get(field.data_type);

    if (!component) {
      throw new Error(`Could not create component for type ${field.data_type}`);
    }

    return React.createElement(component, props);
  }
}
