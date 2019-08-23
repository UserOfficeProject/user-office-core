import React from "react";
import * as Yup from "yup"
import { Formik, Form } from "formik";
import { ProposalTemplate, Proposal } from "../model/ProposalModel";
import { Button } from "@material-ui/core";
import { ComponentFactory, createFormikCofigObjects } from "./ProposalComponents";

export default class ProposalQuestionareStep extends React.Component<{ model: ProposalTemplate; next: Function; back: Function; data: Proposal; topic: string;}> 
{
  private componentFactory: ComponentFactory = new ComponentFactory();

  onInputUpdated() {
    this.setState({}); // re-render
  }

  render() {
    const { back, next, model, topic } = this.props;

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
    let nextButton = next ? <Button type="submit" variant="contained" color="primary" onClick={() => { next(); }} > Next </Button> : null;

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
            <div>
              {activeFields.map(field => {
                return this.componentFactory.createComponent(field, {
                  onComplete: this.onInputUpdated.bind(this), // for re-rendering when input changes
                  touched: touched, // for formik
                  errors: errors,  // for formik
                  handleChange: handleChange // for formik
                });
              })}
              <div>
                {backbutton}
                {nextButton}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    );
  }
}


