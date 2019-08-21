
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ProposalComponentTextInput } from './ProposalComponents';
import { createTemplate } from '../test/ProposalTestBed';

test('Textfield rendered without crashing', () => {
  var template = createTemplate();
  const renderer = ReactTestRenderer.create(
    <ProposalComponentTextInput
    templateField={template.getFieldById('links_with_industry')}
    onComplete={() => {}} />
  );

  let tree = renderer.toJSON();
  expect(tree).toMatchSnapshot();
});