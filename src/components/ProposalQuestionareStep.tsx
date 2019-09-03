import React, { useContext, Fragment, useRef } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { ProposalTemplate, DataType, ProposalTemplateField, ProposalAnswer } from "../model/ProposalModel";
import { Button, makeStyles, CircularProgress } from "@material-ui/core";
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


export  default function ProposalQuestionareStep(props: {
  model: ProposalTemplate;
  topicId: number;
  data:{id:number}
}) {

  const api = useContext(FormApi);
  const proposalForm = React.createRef<HTMLFormElement>();
  const { model, topicId } = props;
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const componentFactory = new ComponentFactory();
  const {loading, updateProposal} = useUpdateProposal();
  const classes = makeStyles({
    componentWrapper: {
      margin:"10px 0"
    }
  })();

  const topic = model.getTopicById(topicId);
  let activeFields = topic
    ? topic.fields.filter((field: ProposalTemplateField) => {
        return model.areDependenciesSatisfied(field.proposal_question_id);
      })
    : [];


  let { initialValues, validationSchema } = createFormikCofigObjects(activeFields);

  const onFormSubmit = async (values:any) => {
    const proposalId:number = props.data.id;
    const answers:ProposalAnswer[] = Object.keys(values).map(key => {
      return {proposal_question_id:key, answer:values[key]};
    });

    const result = await updateProposal({id:proposalId, answers:answers});

    if(result && result.error) {
      api.error && api.error(result.error);
    }
    else{
      api.next && api.next();
    }
  }


  if (model == null) {
    return <div>loading...</div>;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={onFormSubmit}
    >
      {({ errors, touched, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit} ref={proposalForm}>
          {activeFields.map(field => {
            return (
                <div className={classes.componentWrapper} key={field.proposal_question_id}>
                  {componentFactory.createComponent(field, {
                    onComplete: forceUpdate, // for re-rendering when input changes
                    touched: touched, // for formik
                    errors: errors, // for formik
                    handleChange: handleChange // for formik
                  })}
                </div>
            );
          })}
          <ProposalNavigationFragment back={api.back} showSubmit={true} isLoading={loading}/>
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
    this.componentMap.put(DataType.SELECTION_FROM_OPTIONS,ProposalComponentMultipleChoice
    );
  }
  createComponent(field: ProposalTemplateField,props: any): React.ComponentElement<IBasicComponentProps, any> {
    props.templateField = field;
    props.key = field.proposal_question_id;

    let component = this.componentMap.get(field.data_type);

    return component
      ? React.createElement(component, props)
      : React.createElement(this.componentMap.get(DataType.TEXT_INPUT), props); // TMP
  }
}