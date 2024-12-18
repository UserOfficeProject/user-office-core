/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ApiKeyDTO = {
    /**
     * Permission level of the API key
     */
    role: ApiKeyDTO.role;
    /**
     * The API key itself
     */
    readonly apiKey: string;
    /**
     * The name of the service using the key
     */
    serviceName: string;
    /**
     * Contact details for the service using the key
     */
    serviceContact: string;
    /**
     * The date the key stopped being active until
     */
    readonly thruDate?: string | null;
};
export namespace ApiKeyDTO {
    /**
     * Permission level of the API key
     */
    export enum role {
        ADMIN = 'ADMIN',
        FAP = 'FAP',
        GET_ALL_PERSONDETAILS = 'GET_ALL_PERSONDETAILS',
        GET_ALL_BASICPERSONDETAILS = 'GET_ALL_BASICPERSONDETAILS',
    }
}

