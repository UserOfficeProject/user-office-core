import 'reflect-metadata';

import {
  ProposalBasisConfig,
  ProposalEsiBasisConfig,
} from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { createConfig } from './QuestionRegistry';

describe('Proposal basis configs', () => {
  test('Proposal basis config has default length limits', () => {
    const config = createConfig<ProposalBasisConfig>(
      DataType.PROPOSAL_BASIS,
      '{"tooltip":"","readPermissions":[]}'
    );

    expect(config).toBeInstanceOf(ProposalBasisConfig);
    expect(config.maxTitleLength).toBe(175);
    expect(config.maxAbstractLength).toBe(1500);
  });

  test('Proposal ESI basis config is not resolved as proposal basis config', () => {
    const config = createConfig<ProposalEsiBasisConfig>(
      DataType.PROPOSAL_ESI_BASIS
    );

    expect(config).toBeInstanceOf(ProposalEsiBasisConfig);
    expect(config).not.toBeInstanceOf(ProposalBasisConfig);
  });
});
