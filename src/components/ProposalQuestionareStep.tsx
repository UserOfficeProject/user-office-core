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
  next: Function;
  back: Function;
  data: Proposal;
  topic: string;
}) {

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const componentFactory: ComponentFactory = new ComponentFactory();
  
  const { back, next, model, topic } = props;

  if (model == null) {
    return <div>loading...</div>;
  }

  let activeFields = (model! as ProposalTemplate).fields.filter(field => {
    return (
      field.config.topic === topic &&
      model.areDependenciesSatisfied(field.proposal_question_id)
    );
  });

  let backbutton = back ? <Button onClick={() => back()}>Back</Button> : null;
  let nextButton = next ? <Button type="submit" variant="contained" color="primary">Next</Button> : null;

  let { initialValues, validationSchema } = createFormikCofigObjects(
    activeFields
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {}}
      validationSchema={Yup.object().shape(validationSchema)}
    >
      {({ errors, touched, handleChange, isSubmitting }) => (
        <Form>
          {activeFields.map(field => {
            return (
                componentFactory.createComponent(field, {
                  onComplete: forceUpdate, // for re-rendering when input changes
                  touched: touched, // for formik
                  errors: errors, // for formik
                  handleChange: handleChange // for formik
                })
            );
          })}
          <div>
            {backbutton}
            {nextButton}
          </div>
        </Form>
      )}
    </Formik>
  );
}
