/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IdeiioDTO } from '../models/IdeiioDTO';
import type { IdeiioList } from '../models/IdeiioList';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class IdeiioService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Ideiio account for the userNumber
     * Requires USER_OFFICE role or ADMIN API-Key
     * @param userNumber The user number to get Ideiio account for
     * @returns IdeiioDTO Ideiio account for the userNumber
     * @throws ApiError
     */
    public getAccount(
        userNumber: string,
    ): CancelablePromise<IdeiioDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/ideiio/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `No results for the userNumber`,
                409: `Duplicate results found`,
                500: `Internal server error`,
                502: `Ideiio service error`,
            },
        });
    }
    /**
     * Update Ideiio account for the userNumber
     * Requires USER_OFFICE role or ADMIN API-Key
     * @param userNumber The user number of the account to update
     * @param requestBody
     * @returns IdeiioDTO Updated Ideiio account for the userNumber
     * @throws ApiError
     */
    public updateAccount(
        userNumber: string,
        requestBody: IdeiioDTO,
    ): CancelablePromise<IdeiioDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/ideiio/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `No results for the userNumber`,
                409: `Duplicate results found`,
                500: `Internal server error`,
                502: `Ideiio service error`,
            },
        });
    }
    /**
     * Create Ideiio account for the userNumber
     * Requires USER_OFFICE role or ADMIN API-Key
     * @param userNumber The user number to associate new Ideiio account with
     * @param requestBody
     * @returns IdeiioDTO Created Ideiio account for the userNumber
     * @throws ApiError
     */
    public createAccount(
        userNumber: string,
        requestBody?: IdeiioDTO,
    ): CancelablePromise<IdeiioDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/ideiio/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `No results for the userNumber`,
                409: `Duplicate results found`,
                500: `Internal server error`,
                502: `Ideiio service error`,
            },
        });
    }
    /**
     * Get all Ideiio accounts excluding the provided FedID
     * Requires USER_OFFICE role or ADMIN API-Key
     * @param filter SCIM filter to use for searching
     * @param startIndex Record index to return the list from
     * @param count The number of accounts per page
     * @param exclude Filter out specified FedID
     * @returns IdeiioList List of Ideiio accounts
     * @throws ApiError
     */
    public getAccountsExcludeActive(
        filter?: string,
        startIndex?: number,
        count?: number,
        exclude?: string,
    ): CancelablePromise<IdeiioList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/ideiio/excluding',
            query: {
                'filter': filter,
                'startIndex': startIndex,
                'count': count,
                'exclude': exclude,
            },
            errors: {
                404: `No results for the userNumber`,
                409: `Duplicate results found`,
                500: `Internal server error`,
                502: `Ideiio service error`,
            },
        });
    }
    /**
     * Get all Ideiio accounts
     * Requires USER_OFFICE role or ADMIN API-Key
     * @param filter SCIM filter to use for searching
     * @param startIndex Record index to return the list from
     * @param count The number of accounts per page
     * @returns IdeiioList List of Ideiio accounts
     * @throws ApiError
     */
    public getAllAccounts(
        filter?: string,
        startIndex?: number,
        count?: number,
    ): CancelablePromise<IdeiioList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/ideiio',
            query: {
                'filter': filter,
                'startIndex': startIndex,
                'count': count,
            },
            errors: {
                404: `No results for the userNumber`,
                409: `Duplicate results found`,
                500: `Internal server error`,
                502: `Ideiio service error`,
            },
        });
    }
    /**
     * Reset Ideiio password for the userNumber
     * Requires USER_OFFICE role or ADMIN API-Key
     * @param userNumber The user number to reset password for
     * @returns IdeiioDTO Reset Ideiio password for the userNumber
     * @throws ApiError
     */
    public resetIdeiioPassword(
        userNumber: string,
    ): CancelablePromise<IdeiioDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/ideiio/{userNumber}/reset-password',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `No results for the userNumber`,
                409: `Duplicate results found`,
                500: `Internal server error`,
                502: `Ideiio service error`,
            },
        });
    }
}
