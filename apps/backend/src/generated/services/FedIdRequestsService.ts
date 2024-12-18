/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FedIdRequestDTO } from '../models/FedIdRequestDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FedIdRequestsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all Fed ID requests
     * Requires at least USER_OFFICE role or ADMIN API-Key to access this endpoint
     * @returns FedIdRequestDTO List of Fed ID requests
     * @throws ApiError
     */
    public getAllFedIdRequests(): CancelablePromise<Array<FedIdRequestDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/fed-id-requests',
        });
    }
    /**
     * Request a Fed ID
     * Requires at least USER role to access this endpoint, this is self-reference only meaning only a user owning the resource can access it, clients with ADMIN role or API-Key can bypass this restriction
     * @param requestBody The Fed ID request to create, FedID request will be created for the user whose user number is provided in the body
     * @returns FedIdRequestDTO Fed ID request created
     * @throws ApiError
     */
    public requestFedId(
        requestBody?: FedIdRequestDTO,
    ): CancelablePromise<FedIdRequestDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/fed-id-requests',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `The body is missing required fields, or if the date of birth provided is not before today`,
            },
        });
    }
    /**
     * Delete Fed ID requests for a user
     * Requires at least USER_OFFICE role to access this endpoint clients with ADMIN role or API-Key can bypass this restriction
     * @param userNumber A user number who's FedID request should be deleted
     * @returns void
     * @throws ApiError
     */
    public deleteFedIdRequestsForAUser(
        userNumber?: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/fed-id-requests',
            query: {
                'userNumber': userNumber,
            },
            errors: {
                400: `The user number is missing`,
                404: `No Fed ID requests found for the user`,
            },
        });
    }
}
