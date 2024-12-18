/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BasicPersonDetailsDTO } from '../models/BasicPersonDetailsDTO';
import type { EstablishmentSearchDetails } from '../models/EstablishmentSearchDetails';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BasicPersonDetailsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all basic person details
     * Requires an API key with the permission to get all basic person details
     * @param fedId The fedId to search for
     * @param surname The surname to search for
     * @param emails List of emails to search for
     * @param userNumbers List of userNumbers
     * @param fromDate Search for people modified since this date
     * @returns BasicPersonDetailsDTO Basic person details found
     * @throws ApiError
     */
    public getBasicPersonDetails(
        fedId?: string,
        surname?: string,
        emails?: Array<string>,
        userNumbers?: Array<string>,
        fromDate?: string,
    ): CancelablePromise<Array<BasicPersonDetailsDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/basic-person-details',
            query: {
                'fedId': fedId,
                'surname': surname,
                'emails': emails,
                'userNumbers': userNumbers,
                'fromDate': fromDate,
            },
            errors: {
                400: `Invalid date format was passed, please use yyyy-mm-dd`,
                404: `No result`,
            },
        });
    }
    /**
     * Get basic person details by account activation id
     * Requires API key permissions ADMIN
     * @param activationId The id of the activation to search the person
     * @returns BasicPersonDetailsDTO Basic person details found
     * @throws ApiError
     */
    public getBasicPersonDetailsByActivationId(
        activationId: string,
    ): CancelablePromise<BasicPersonDetailsDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/basic-person-details/account-activation-id/{activationId}',
            path: {
                'activationId': activationId,
            },
            errors: {
                400: `Invalid account activation id`,
                404: `No result`,
                409: `The activation has already been used`,
                410: `The activation has already expired`,
            },
        });
    }
    /**
     * Get basic person details by password reset id
     * Requires API key permissions ADMIN
     * @param resetId The id of the reset to search the person
     * @returns BasicPersonDetailsDTO Basic person details found
     * @throws ApiError
     */
    public getBasicPersonDetailsByEncryptedId(
        resetId: string,
    ): CancelablePromise<BasicPersonDetailsDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/basic-person-details/reset-id/{resetId}',
            path: {
                'resetId': resetId,
            },
            errors: {
                400: `Invalid reset id`,
                404: `No result`,
                409: `The reset has already been used`,
                410: `The reset has already expired`,
            },
        });
    }
    /**
     * Search for basic person details
     * Requires USER role or API key permissions GET_ALL_BASICPERSONDETAILS
     * @param surname Surname to search for
     * @param emails List of emails to search for
     * @param userNumbers List of user numbers to search for
     * @returns BasicPersonDetailsDTO Basic person details found
     * @throws ApiError
     */
    public getSearchableBasicPersonDetails(
        surname?: string,
        emails?: Array<string>,
        userNumbers?: Array<string>,
    ): CancelablePromise<Array<BasicPersonDetailsDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/basic-person-details/searchable',
            query: {
                'surname': surname,
                'emails': emails,
                'userNumbers': userNumbers,
            },
        });
    }
    /**
     * Search for basic person details by establishment
     * Requires API key permissions GET_ALL_BASICPERSONDETAILS
     * @param requestBody
     * @returns BasicPersonDetailsDTO Basic person details found
     * @throws ApiError
     */
    public searchBasicPeopleDetailsListByEstablishments(
        requestBody?: Array<EstablishmentSearchDetails>,
    ): CancelablePromise<Array<BasicPersonDetailsDTO>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/basic-person-details/search/by-establishment',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
