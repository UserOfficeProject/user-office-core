import React from 'react';
import FormikDropdown from './FormikDropdown';
import ReactTestRenderer from 'react-test-renderer';
import { Formik } from "formik";

test('Dropdown populated with given values', () => {
  const renderer = ReactTestRenderer.create(
    <Formik initialValues={{name: "name"}} onSubmit={() => {}}>
    <FormikDropdown 
    name="name" 
    label="label" 
    items={[{ text: "One", value: "one" }, { text: "Two", value: "two" }]} />
    </Formik>
  );

  let tree = renderer.toJSON();
  expect(tree).toMatchSnapshot();
});