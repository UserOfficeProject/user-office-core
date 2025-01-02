/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermissionUserGroupDTO } from '../models/PermissionUserGroupDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PermissionUserGroupService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get permission groups
     * Requires at least USER_OFFICE role or ADMIN API-Key. If user number is provided, it will return the permission groups for the user. If no user number is provided, it will return all permission groups.
     * @param userNumber If provided, only groups for the person are returned
     * @returns PermissionUserGroupDTO Permission groups
     * @throws ApiError
     */
    public getPermissionGroups(
        userNumber?: string,
    ): CancelablePromise<Array<PermissionUserGroupDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/permission-user-groups',
            query: {
                'userNumber': userNumber,
            },
            errors: {
                404: `If userNumber is provided, but no people found with that user number`,
                409: `If userNumber is provided, but duplicate records were found`,
                502: `if userNumber is provided, but there was an error getting AD groups`,
            },
        });
    }
    /**
     * Create a permission group
     * Requires ADMIN role or API-Key
     * @param requestBody
     * @returns PermissionUserGroupDTO Permission group created
     * @throws ApiError
     */
    public createPermissionGroup(
        requestBody?: PermissionUserGroupDTO,
    ): CancelablePromise<PermissionUserGroupDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/permission-user-groups',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `If group name is empty`,
            },
        });
    }
    /**
     * Remove a permission group
     * Requires ADMIN role or API-Key
     * @param groupId Id of the group to remove
     * @returns void
     * @throws ApiError
     */
    public removePermissionGroup(
        groupId: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/permission-user-groups/{groupId}',
            path: {
                'groupId': groupId,
            },
        });
    }
}
