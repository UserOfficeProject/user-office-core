import React, { useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { ProposalTemplate, DataType, ProposalTemplateField, ProposalAnswer } from "../model/ProposalModel";
import { Button, makeStyles } from "@material-ui/core";
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


export  default function ProposalQuestionareStep(props: {
  model: ProposalTemplate;
  topicId: number;
  data:{id:number}
}) {

  const api = useContext(FormApi);
  const { model, topicId } = props;
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const componentFactory = new ComponentFactory();
  const updateAnswers = useUpdateProposal();
  const classes = makeStyles({
    componentWrapper: {
      margin:"10px 0"
    },
    buttons: {
      display: "flex",
      justifyContent: "flex-end"
    },
    button: {
      marginTop: "25px",
      marginLeft: "10px"
    }
  })();

  const topic = model.getTopicById(topicId);
  let activeFields = topic
    ? topic.fields.filter((field: ProposalTemplateField) => {
        return model.areDependenciesSatisfied(field.proposal_question_id);
      })
    : [];

  let backbutton = api.back ? <Button onClick={() => api.back!()} className={classes.buttons}>Back</Button> : null;
  let nextButton = api.next ? <Button type="submit" variant="contained" color="primary" className={classes.buttons}>Next</Button> : null;

  let { initialValues, validationSchema } = createFormikCofigObjects(activeFields);

  const onSubmitClicked = async (values:any) => {
    const proposalId:number = props.data.id;
    const answers:ProposalAnswer[] = Object.keys(values).map(key => {
      return {proposal_question_id:key, answer:values[key]};
    });

    await updateAnswers({id:proposalId, answers:answers});
    api.next!();
  }

  if (model == null) {
    return <div>loading...</div>;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={onSubmitClicked}
    >
      {({ errors, touched, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
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
          <div className={classes.buttons}>
            {backbutton}
            {nextButton}
          </div>
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