import { collectShipmentLabelAnswers } from './shipmentLabel';
import { Answer, QuestionaryStep } from '../../models/Questionary';
import { DataType, Topic } from '../../models/Template';

const config = { titlePlaceholder: '', readPermissions: [] };

const field = (
  naturalKey: string,
  dataType: DataType,
  value?: unknown
): Answer => ({
  answerId: value === undefined ? null : 1,
  question: {
    naturalKey,
    dataType,
    categoryId: 3,
    id: naturalKey,
    question: naturalKey,
    config,
  },
  topicId: 1,
  templateId: 1,
  sortOrder: 1,
  config,
  dependencies: [],
  value,
});

const steps = (fields: Answer[]) => [
  new QuestionaryStep(1, new Topic(1, 'Shipment', 1, 1, true), true, fields),
];

test('collects printable answers by their configured key without losing zero or false', () => {
  expect(
    collectShipmentLabelAnswers(
      steps([
        field('custom_measurement', DataType.NUMBER_INPUT, {
          value: 0,
          unit: { symbol: 'cm' },
        }),
        field('custom_boolean', DataType.BOOLEAN, false),
        field('custom_choices', DataType.SELECTION_FROM_OPTIONS, [
          'One',
          'Two',
        ]),
      ])
    )
  ).toEqual({
    custom_measurement: '0 cm',
    custom_boolean: 'No',
    custom_choices: 'One, Two',
  });
});

test('skips missing answers without requiring any shipment-specific questions', () => {
  expect(
    collectShipmentLabelAnswers(
      steps([
        field('custom_note', DataType.TEXT_INPUT, 'Ready'),
        field('missing_number', DataType.NUMBER_INPUT),
        field('empty_text', DataType.TEXT_INPUT, ' '),
      ])
    )
  ).toEqual({ custom_note: 'Ready' });
  expect(collectShipmentLabelAnswers([])).toEqual({});
});
