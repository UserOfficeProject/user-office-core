import { GraphQLError } from 'graphql';
import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { VALID_REDEEM_CODE } from './../datasources/mockups/RedeemDataSource';
import RedeemCodesMutations from './RedeemCodesMutations';

const redeemCodesMutations = container.resolve(RedeemCodesMutations);

test('A user can redeem code valid', () => {
  return expect(
    redeemCodesMutations.redeemCode(dummyUserWithRole, VALID_REDEEM_CODE)
  ).resolves.toHaveProperty('code', VALID_REDEEM_CODE);
});

test('A user can not redeem invalid code', () => {
  return expect(
    redeemCodesMutations.redeemCode(dummyUserWithRole, 'SOME_INVALID_CODE')
  ).resolves.toBeInstanceOf(GraphQLError);
});
