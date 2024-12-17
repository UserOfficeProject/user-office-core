/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PrivacyDTO } from '../models/PrivacyDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PrivacyService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get privacy settings for a user
     * Requires USER role. Requires ADMIN role or API-Key to access other users' privacies.
     * @param userNumber User number to search for
     * @returns PrivacyDTO Privacy settings found
     * @throws ApiError
     */
    public getPrivacy(
        userNumber: string,
    ): CancelablePromise<PrivacyDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/privacy/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                403: `Forbidden if accessing not own privacy settings and not Admin`,
                404: `No privacy settings found`,
            },
        });
    }
}
