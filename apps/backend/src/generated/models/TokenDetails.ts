/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TokenDetails = {
    /**
     * Type of token
     */
    type?: TokenDetails.type;
    /**
     * Identifier of the token - a service name or user number
     */
    identifier?: string;
};
export namespace TokenDetails {
    /**
     * Type of token
     */
    export enum type {
        API_KEY = 'API_KEY',
        SESSION_ID = 'SESSION_ID',
    }
}

