import { rejection } from '../rejection';
import { SuccessResponseWrap } from './types/CommonWrappers';
import { wrapResponse } from './wrapResponse';

test('Should wrap the success result', async () => {
  const result = (await wrapResponse<boolean>(
    new Promise((resolve, reject) => {
      resolve(true);
    }),
    SuccessResponseWrap
  )) as SuccessResponseWrap;

  return expect(result.isSuccess).toEqual(true);
});

test('Should wrap the fail result', async () => {
  const ERROR_REASON = 'NOT_FOUND';
  const result = (await wrapResponse<boolean>(
    new Promise((resolve, reject) => {
      resolve(rejection(ERROR_REASON));
    }),
    SuccessResponseWrap
  )) as SuccessResponseWrap;

  return expect(result.error).toEqual(ERROR_REASON);
});
