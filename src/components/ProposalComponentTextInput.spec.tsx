import React from "react";
import ReactTestRenderer from "react-test-renderer";
import { ProposalComponentTextInput } from "./ProposalComponentTextInput";
import { create1Topic3FieldWithDependenciesQuestionary } from "../test/ProposalTestBed";
import { QuestionaryField } from "../models/ProposalModel";
import { getFieldById } from "../models/ProposalModelFunctions";

test("Textfield rendered without crashing", () => {
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
