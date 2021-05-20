import { rejection } from '../models/Rejection';
import { SuccessResponseWrap } from './types/CommonWrappers';
import { wrapResponse } from './wrapResponse';

test('Should wrap the success result', async () => {
  const result = (await wrapResponse(
    new Promise((resolve, reject) => {
      resolve(true);
    }),
    SuccessResponseWrap
  )) as SuccessResponseWrap;

  return expect(result.isSuccess).toEqual(true);
});

test('Should wrap the fail result', async () => {
  const ERROR_REASON = 'NOT_FOUND';
  const result = (await wrapResponse(
    new Promise((resolve, reject) => {
      resolve(rejection(ERROR_REASON));
    }),
    SuccessResponseWrap
  )) as SuccessResponseWrap;

  return expect(result.rejection).not.toBeNull();
});
