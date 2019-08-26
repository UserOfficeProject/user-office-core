import React from "react";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { ProposalTemplate, Proposal } from "../model/ProposalModel";
import { Button, makeStyles } from "@material-ui/core";
import {
  ComponentFactory,
  createFormikCofigObjects
} from "./ProposalComponents";

export  default function ProposalQuestionareStep(props: {
  model: ProposalTemplate;
  data: Proposal;
  topic: string;
  next?: Function;
  back?: Function;
}) {

  const { back, next, model, topic } = props;

  

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const componentFactory = new ComponentFactory();
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

  let activeFields = model.fields.filter(field => {
    return (
      field.config.topic === topic &&
      model.areDependenciesSatisfied(field.proposal_question_id)
    );
  });

  let backbutton = back ? <Button onClick={() => back()} className={classes.buttons}>Back</Button> : null;
  let nextButton = next ? <Button type="submit" variant="contained" color="primary" className={classes.buttons}>Next</Button> : null;

  let { initialValues, validationSchema } = createFormikCofigObjects(activeFields);

  const updateProposal = () => {
    console.log("Updating proposal")
    next!();
  }

  if (model == null) {
    return <div>loading...</div>;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={updateProposal}
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
