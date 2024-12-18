/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FailedLoginDTO } from '../models/FailedLoginDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FailedLoginService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Unlock an account
     * This endpoint is secured and requires a valid JWT token with the User Office role or an ADMIN API-key
     * @param userNumber The user number to unlock the account for
     * @returns void
     * @throws ApiError
     */
    public deleteFailedLogin(
        userNumber: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/failed-login/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
        });
    }
    /**
     * Get the account lock status for a user
     * This endpoint is secured and requires a valid JWT token with the User Office role or an ADMIN API-key
     * @param userNumber The user number to check the account lock status for
     * @returns FailedLoginDTO The account lock status
     * @throws ApiError
     */
    public getAccountLockedStatus(
        userNumber: string,
    ): CancelablePromise<FailedLoginDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/failed-login/{userNumber}/status',
            path: {
                'userNumber': userNumber,
            },
        });
    }
}
