/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleDTO } from '../models/RoleDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RoleService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get roles for a user
     * Requires API key GET_ALL_BASICPERSONDETAILS permissions
     * @param userNumber
     * @returns RoleDTO Roles for the user
     * @throws ApiError
     */
    public getRolesForUser(
        userNumber: string,
    ): CancelablePromise<Array<RoleDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/role/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `No person found for user number`,
                409: `Duplicate records found for user number`,
            },
        });
    }
}
