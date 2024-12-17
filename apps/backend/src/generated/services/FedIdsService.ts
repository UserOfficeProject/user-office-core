/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FedIdDTOWrapper } from '../models/FedIdDTOWrapper';
import type { FedIdEndDateWrapper } from '../models/FedIdEndDateWrapper';
import type { PasswordWrapperDTO } from '../models/PasswordWrapperDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FedIdsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a Fed ID
     * Requires at least USER_OFFICE role or ADMIN API-Key to access this endpoint
     * @param requestBody The Fed ID request to create, FedID request will be created for the user whose user number is provided in the body
     * @returns string Fed ID created
     * @throws ApiError
     */
    public createFedId(
        requestBody?: FedIdDTOWrapper,
    ): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/fed-ids',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `The body is missing required fields`,
            },
        });
    }
    /**
     * Get Fed ID information from CDR for the specified user-number
     * Requires at least USER_OFFICE role or ADMIN API-Key to access this endpoint
     * @param userNumber
     * @returns string default response
     * @throws ApiError
     */
    public getFedIDsFromCdr(
        userNumber: string,
    ): CancelablePromise<Array<Array<string>>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/fed-ids/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
        });
    }
    /**
     * Update the specified Fed ID's end date
     * Requires at least USER_OFFICE role or ADMIN API-Key to access this endpoint
     * @param userId
     * @param requestBody
     * @returns any Fed id end date updated
     * @throws ApiError
     */
    public updateFedIdEndDate(
        userId: string,
        requestBody?: FedIdEndDateWrapper,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/fed-ids/{userId}/end-date',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                502: `Bad Gateway`,
            },
        });
    }
    /**
     * Update the specified Fed ID's password
     * Requires at least USER_OFFICE role or ADMIN API-Key to access this endpoint
     * @param fedId
     * @param requestBody
     * @returns PasswordWrapperDTO Fed id password reset
     * @throws ApiError
     */
    public updateFedIdPassword(
        fedId: string,
        requestBody?: PasswordWrapperDTO,
    ): CancelablePromise<PasswordWrapperDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/fed-ids/{fedId}/password',
            path: {
                'fedId': fedId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                502: `Bad Gateway`,
            },
        });
    }
}
