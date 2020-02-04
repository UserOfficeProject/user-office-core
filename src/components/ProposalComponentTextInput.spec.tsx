import React from "react";
import ReactTestRenderer from "react-test-renderer";
import { ProposalComponentTextInput } from "./ProposalComponentTextInput";
import { create1Topic3FieldWithDependenciesQuestionary } from "../tests/ProposalTestBed";
import { getFieldById } from "../models/ProposalModelFunctions";
import { QuestionaryField } from "../generated/sdk";

test("TextField rendered without crashing", () => {
  var template = create1Topic3FieldWithDependenciesQuestionary();
  const renderer = ReactTestRenderer.create(
    <ProposalComponentTextInput
      templateField={
        getFieldById(template, "links_with_industry")! as QuestionaryField
      }
      onComplete={() => {}}
      handleChange={() => {}}
      errors={{}}
      touched={{}}
    />
  );

  let tree = renderer.toJSON();
  expect(tree).toMatchSnapshot();
});
