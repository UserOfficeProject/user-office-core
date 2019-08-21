import React from "react";
import { ProposalTemplate, Proposal } from "../model/ProposalModel";
import { Button } from "@material-ui/core";
import { ComponentFactory } from "./ProposalComponents";

export default class ProposalQuestionareStep extends React.Component<{ model: ProposalTemplate; next: Function; back: Function; data: Proposal; topic: string;}> 
{
  private componentFactory: ComponentFactory = new ComponentFactory();

  onInputUpdated() {
    this.setState({});
  }

  render() {
    const { back, next, model, topic } = this.props;

    if (model == null) {
      return <div>loading...</div>;
    }

    let components = (model! as ProposalTemplate).fields.map(field => {
      if (field.config.topic == topic && model.areDependenciesSatisfied(field.proposal_question_id)) {
        return this.componentFactory.createComponent(field, {
          onComplete: this.onInputUpdated.bind(this)
        });
      }
      return null; // field does not beling to topic or, according to dependecies, ut should not be displayed
    });

    let backbutton = back ? <Button onClick={() => back()}>Back</Button> : null;
    let nextButton = next ? <Button variant="contained" color="primary" onClick={() => next()}>Next</Button> : null;

    return (
      <div>
        {components}
        <div>
          {backbutton}
          {nextButton}
        </div>
      </div>
    );
  }
}


