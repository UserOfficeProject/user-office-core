import React, { useContext, useState } from "react";
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

export default function ProposalQuestionareStep(props: {
  data: ProposalInformation;
  topicId: number;
  setIsDirty: (isDirty: boolean) => void;
}) {
  const { data, topicId } = props;
  const api = useContext(FormApi);
  const [, updateState] = useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const componentFactory = new ComponentFactory();
  const { loading: formSaving, updateProposal } = useUpdateProposal();
  const classes = makeStyles({
    componentWrapper: {
      margin: "10px 0"
    }
  })();

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

  const onFormSubmit = async () => {
    const proposalId: number = props.data.id;

    const answers: ProposalAnswer[] = activeFields.map(field => {
      return (({ proposal_question_id, data_type, value }) => ({
        proposal_question_id,
        data_type,
        value
      }))(field); // convert field to answer objcet
    });

    const result = await updateProposal({
      id: proposalId,
      answers: answers,
      topicsCompleted: [topicId]
    });

    if (result && result.error) {
      api.error && api.error(result.error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={onFormSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        submitForm,
        validateForm
      }) => (
        <form>
          {activeFields.map(field => {
            return (
              <div
                className={classes.componentWrapper}
                key={field.proposal_question_id}
              >
                {componentFactory.createComponent(field, {
                  onComplete: () => {
                    forceUpdate();
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
            back={() => {
              submitFormAsync(submitForm, validateForm).then(
                (isValid: boolean) => {
                  if (isValid) {
                    (getQuestionaryStepByTopicId(
                      props.data.questionary!,
                      topicId
                    ) as QuestionaryStep).isCompleted = true;
                    api.back({ ...props.data });
                  }
                }
              );
            }}
            reset={() => api.reset()}
            next={() => {
              submitFormAsync(submitForm, validateForm).then(
                (isValid: boolean) => {
                  if (isValid) {
                    (getQuestionaryStepByTopicId(
                      props.data.questionary!,
                      topicId
                    ) as QuestionaryStep).isCompleted = true;
                    api.next({ ...props.data });
                  }
                }
              );
            }}
            isLoading={formSaving}
          />
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
    this.componentMap.put(DataType.DATE, ProposalCompontentDatePicker);
    this.componentMap.put(DataType.FILE_UPLOAD, ProposalCompontentFileUpload);
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
