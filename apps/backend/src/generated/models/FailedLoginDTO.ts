/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FailedLoginDTO = {
    /**
     * The account lock status
     */
    readonly locked?: FailedLoginDTO.locked | null;
    lockedUntil?: string;
    /**
     * The number of failed logins
     */
    readonly numberOfFailedLogins?: number;
    /**
     * The user number that failed login is associated with
     */
    readonly userNumber?: string;
};
export namespace FailedLoginDTO {
    /**
     * The account lock status
     */
    export enum locked {
        YES = 'Yes',
        NULL = 'null',
    }
}

