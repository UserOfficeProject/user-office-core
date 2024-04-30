import { ApolloServerErrorCode } from '@apollo/server/errors';

export type OmitType = {
  <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2];
  };
};

/**
 * @description Makes all fields non-nullable
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * @description Makes subset fields non-nullable
 */

export type NonNullableField<T, K extends keyof T> = T &
  NonNullableFields<Pick<T, K>>;

export enum ApolloServerAdditionalErrorCodes {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

export const ApolloServerErrorCodeExtended = {
  ...ApolloServerErrorCode,
  ...ApolloServerAdditionalErrorCodes,
};
