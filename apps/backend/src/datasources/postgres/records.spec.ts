import 'reflect-metadata';
import { createConfig } from '../../models/questionTypes/QuestionRegistry';
import { DataType } from '../../models/Template';
import {
  BooleanConfig,
  TextInputConfig,
} from '../../resolvers/types/FieldConfig';

test('Should able to create boolean config', () => {
  const isRequired = true;
  const smallLabel = 'some text';
  const config = createConfig<BooleanConfig>(DataType.BOOLEAN, {
    required: isRequired,
    small_label: 'some text',
  });
  expect(config.required).toEqual(isRequired);
  expect(config.small_label).toEqual(smallLabel);
});

test('Should able to create text input config', () => {
  const isRequired = false;
  const tooltip = 'This is tooltip';
  const config = createConfig<TextInputConfig>(DataType.TEXT_INPUT, {
    required: isRequired,
    tooltip: tooltip,
  });
  expect(config.required).toEqual(isRequired);
  expect(config.tooltip).toEqual(tooltip);
});
