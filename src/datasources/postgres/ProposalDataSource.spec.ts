/* eslint-disable quotes */
import 'reflect-metadata';
import { calculateReferenceNumber } from './ProposalDataSource';

describe('Reference number calculation', () => {
  test('An error is thrown when there is no prefix in the format', async () => {
    return expect(calculateReferenceNumber('{digits:4}', 0)).rejects.toThrow(
      'invalid'
    );
  });

  test('An error is thrown when there are no parameters in the format', async () => {
    return expect(calculateReferenceNumber('211', 0)).rejects.toThrow(
      'invalid'
    );
  });

  test('An error is thrown when the sequence provided exceeds the digits parameter', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}', 12345)
    ).rejects.toThrow("exceeds the format's digits parameter");
  });

  test('A reference number is calculated when there is only a prefix and digits parameter in the format', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}', 5)
    ).resolves.toEqual('2110005');
  });

  test('0 (zero) is used as a sequence number when one is not provided', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}', null)
    ).resolves.toEqual('2110000');
  });

  test('A reference number is calculated when there is a prefix and multiple parameters including digits in the format', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}{other:param}', null)
    ).resolves.toEqual('2110000');
  });

  test('The sequence is padded according to the digits parameter', async () => {
    return expect(
      calculateReferenceNumber('211{digits:7}', 1015)
    ).resolves.toEqual('2110001015');
  });
});
