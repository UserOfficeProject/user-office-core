import 'reflect-metadata';
import { createBasicUserObject } from './records';
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

describe('Basic user institution details', () => {
  const record = {
    user_id: 1,
    full_count: 1,
    user_title: 'Dr',
    firstname: 'Jane',
    lastname: 'Doe',
    preferredname: 'Jane',
    institution: 'Test Institution',
    institution_id: 2,
    country_id: 3,
    country: 'Sweden',
    ror_id: 'https://ror.org/01wv9cn34',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
    email: 'jane@example.com',
    oidc_sub: null,
    oauth_refresh_token: null,
    oauth_issuer: null,
  };

  test('Returns institution metadata and preserves legacy fields', () => {
    const user = createBasicUserObject(record);

    expect(user).toMatchObject({
      institution: 'Test Institution',
      institutionName: 'Test Institution',
      institutionId: 2,
      institutionRorId: 'https://ror.org/01wv9cn34',
      institutionCountry: 'Sweden',
      country: 'Sweden',
    });
  });

  test('Returns null when an institution has no ROR ID', () => {
    const user = createBasicUserObject({ ...record, ror_id: null });

    expect(user.institutionRorId).toBeNull();
  });
});
