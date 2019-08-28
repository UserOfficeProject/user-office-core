
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ProposalComponentTextInput } from "./ProposalComponentTextInput";
import { createTemplate } from '../test/ProposalTestBed';

test('Textfield rendered without crashing', () => {
  var template = createTemplate();
  const renderer = ReactTestRenderer.create(
    <ProposalComponentTextInput
    templateField={template.getFieldById('links_with_industry')}
    onComplete={() => {}} 
    handleChange={() => {}}
    errors={{}}
    touched={{}}
    />
  );

  let tree = renderer.toJSON();
  expect(tree).toMatchSnapshot();
});