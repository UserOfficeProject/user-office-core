/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonDetailsDTO } from '../models/PersonDetailsDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PersonDetailsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get person details by user number
     * Requires USER OFFICE role or API key GET_ALL_PERSONDETAILS permissions
     * @param userNumber User number to get details for
     * @returns PersonDetailsDTO Person details found
     * @throws ApiError
     */
    public getPersonDetails(
        userNumber: string,
    ): CancelablePromise<PersonDetailsDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person-details/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `No person details found for user number`,
            },
        });
    }
    /**
     * Get person details by search parameters
     * Requires USER OFFICE role or API key GET_ALL_PERSONDETAILS permissions
     * @param userNumber A list of userNumbers to search for
     * @param email A list of emails to search for
     * @param exactSurname An exact surname to search for
     * @param surname A surname to search for
     * @returns PersonDetailsDTO Person details found
     * @throws ApiError
     */
    public getPersonDetailsList(
        userNumber?: Array<string>,
        email?: Array<string>,
        exactSurname?: string,
        surname?: string,
    ): CancelablePromise<Array<PersonDetailsDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person-details',
            query: {
                'userNumber': userNumber,
                'email': email,
                'exactSurname': exactSurname,
                'surname': surname,
            },
        });
    }
}
