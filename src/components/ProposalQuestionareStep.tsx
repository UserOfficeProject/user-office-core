import React, { useContext, useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  DataType,
  ProposalAnswer,
  QuestionaryField,
  QuestionaryStep
} from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
  getQuestionaryStepByTopicId
} from "../models/ProposalModelFunctions";
import { makeStyles } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import JSDict from "../utils/Dictionary";
import { ProposalComponentTextInput } from "./ProposalComponentTextInput";
import { ProposalComponentBoolean } from "./ProposalComponentBoolean";
import { ProposalCompontentDatePicker } from "./ProposalCompontentDatePicker";
import { ProposalCompontentFileUpload } from "./ProposalCompontentFileUpload";
import { ProposalComponentMultipleChoice } from "./ProposalComponentMultipleChoice";
import { createFormikCofigObjects } from "./ProposalYupUtilities";
import { FormApi } from "./ProposalContainer";
import { useUpdateProposal } from "../hooks/useUpdateProposal";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import { ProposalComponentEmbellishment } from "./ProposalComponentEmbellishment";
import submitFormAsync from "../utils/FormikAsyncFormHandler";
import { getTranslation, ResourceId } from "@esss-swap/duo-localisation";
import { ErrorFocus } from "./ErrorFocus";

export default function ProposalQuestionareStep(props: {
  data: ProposalInformation;
  topicId: number;
  setIsDirty: (isDirty: boolean) => void;
  readonly: boolean;
}) {
  const { data, topicId } = props;
  const api = useContext(FormApi);
  const [, updateState] = useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const componentFactory = new ComponentFactory();
  const { loading: formSaving, updateProposal } = useUpdateProposal();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const classes = makeStyles({
    componentWrapper: {
      margin: "10px 0"
    },
    disabled: {
      pointerEvents: "none",
      opacity: 0.7
    }
  })();

  useEffect(() => {
    setIsDirty(false);
  }, [props.data]);

  if (data == null) {
    return <div>loading...</div>;
  }

  const questionary = data.questionary!;
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

  const { initialValues, validationSchema } = createFormikCofigObjects(
    activeFields
  );

  const saveStepData = async (markAsComplete: boolean) => {
    const proposalId: number = props.data.id;

    const answers: ProposalAnswer[] = activeFields.map(field => {
      return (({ proposal_question_id, data_type, value }) => ({
        proposal_question_id,
        data_type,
        value
      }))(field); // convert field to answer object
    });

    const result = await updateProposal({
      id: proposalId,
      answers,
      topicsCompleted: markAsComplete ? [topicId] : [],
      partialSave: !markAsComplete
    });

    if (result && result.updateProposal && result.updateProposal.error) {
      api.reportStatus({
        variant: "error",
        message: getTranslation(result.updateProposal.error as ResourceId)
      });
    } else {
      api.reportStatus({ variant: "success", message: "Saved" });
      setIsDirty(false);
      props.setIsDirty(false);
    }
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
                  onComplete: () => {
                    forceUpdate();
                    setIsDirty(true);
                    props.setIsDirty(true);
                  }, // for re-rendering when input changes
                  touched: touched, // for formik
                  errors: errors, // for formik
                  handleChange: handleChange // for formik
                })}
              </div>
            );
          })}
          <ProposalNavigationFragment
            disabled={props.readonly}
            back={{
              callback: () => {
                api.back();
              }
            }}
            reset={{ callback: api.reset, disabled: !isDirty }}
            save={
              questionaryStep.isCompleted
                ? undefined
                : {
                    callback: () => {
                      saveStepData(false);
                    },
                    disabled: !isDirty
                  }
            }
            saveAndNext={{
              callback: () => {
                submitFormAsync(submitForm, validateForm).then(
                  (isValid: boolean) => {
                    if (isValid) {
                      saveStepData(true);
                      (getQuestionaryStepByTopicId(
                        props.data.questionary!,
                        topicId
                      ) as QuestionaryStep).isCompleted = true;
                      api.next({ ...props.data });
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
    this.componentMap.put(DataType.TextInput, ProposalComponentTextInput);
    this.componentMap.put(DataType.Boolean, ProposalComponentBoolean);
    this.componentMap.put(DataType.Date, ProposalCompontentDatePicker);
    this.componentMap.put(DataType.FileUpload, ProposalCompontentFileUpload);
    this.componentMap.put(
      DataType.SelectionFromOptions,
      ProposalComponentMultipleChoice
    );
    this.componentMap.put(
      DataType.Embellishment,
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
