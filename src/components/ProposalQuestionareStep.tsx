import React, { useContext, useState } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  ProposalTemplate,
  DataType,
  ProposalTemplateField,
  ProposalAnswer
} from "../model/ProposalModel";
import { makeStyles } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import JSDict from "../utils/Dictionary";
import { ProposalComponentTextInput } from "./ProposalComponentTextInput";
import { ProposalComponentCheckBox } from "./ProposalComponentCheckBox";
import { ProposalCompontentDatePicker } from "./ProposalCompontentDatePicker";
import { ProposalCompontentFileUpload } from "./ProposalCompontentFileUpload";
import { ProposalComponentMultipleChoice } from "./ProposalComponentMultipleChoice";
import { createFormikCofigObjects } from "./ProposalYupUtilities";
import { FormApi } from "./ProposalContainer";
import { useUpdateProposal } from "../hooks/useUpdateProposal";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import { useUpdateProposalFiles } from "../hooks/useUpdateProposalFiles";
import { ProposalComponentEmbellishment } from "./ProposalComponentEmbellishment";
import submitFormAsync from "../utils/FormikAsyncFormHandler";

export default function ProposalQuestionareStep(props: {
  template: ProposalTemplate;
  topicId: number;
  data: { id: number };
}) {
  const api = useContext(FormApi);
  const { template, topicId } = props;
  const [, updateState] = useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const componentFactory = new ComponentFactory();
  const topic = template.getTopicById(topicId);
  const { loading: formSaving, updateProposal } = useUpdateProposal();
  const { loading: filesSaving, updateProposalFiles } = useUpdateProposalFiles();
  const classes = makeStyles({
    componentWrapper: {
      margin: "10px 0"
    }
  })();

  let activeFields = topic
    ? topic.fields.filter((field: ProposalTemplateField) => {
        return template.areDependenciesSatisfied(field.proposal_question_id);
      })
    : [];

  let { initialValues, validationSchema } = createFormikCofigObjects(
    activeFields
  );

  const onFormSubmit = async (values: any) => {
    const proposalId: number = props.data.id;
    const answers: ProposalAnswer[] = Object.keys(values).map(key => {
      return { proposal_question_id: key, answer: values[key] };
    });

    const result = await updateProposal({ id: proposalId, answers: answers });
    if (result && result.error) {
      api.error && api.error(result.error);
    }

    let activeFileFields = activeFields.filter(
      field => field.data_type === DataType.FILE_UPLOAD
    );
    activeFileFields.forEach(async (fileField) => {
      const fileIds = fileField.value ? fileField.value.split(",") : [];
      await updateProposalFiles({
        proposal_id: proposalId,
        question_id: fileField.proposal_question_id,
        files: fileIds
      });
    });
  };

  if (template == null) {
    return <div>loading...</div>;
  }

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
                  onComplete: forceUpdate, // for re-rendering when input changes
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
                    api.back(values);
                  }
                }
              );
            }}
            next={() => {
              submitFormAsync(submitForm, validateForm).then(
                (isValid: boolean) => {
                  if (isValid) {
                    api.next(values);
                  }
                }
              );
            }}
            isLoading={formSaving || filesSaving}
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
    this.componentMap.put(DataType.BOOLEAN, ProposalComponentCheckBox);
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
    field: ProposalTemplateField,
    props: any
  ): React.ComponentElement<IBasicComponentProps, any> {
    props.templateField = field;
    props.key = field.proposal_question_id;

    let component = this.componentMap.get(field.data_type);

    return component
      ? React.createElement(component, props)
      : React.createElement(this.componentMap.get(DataType.TEXT_INPUT), props); // TMP
  }
}
