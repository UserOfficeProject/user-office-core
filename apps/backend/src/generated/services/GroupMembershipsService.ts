/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroupMembershipWrapper } from '../models/GroupMembershipWrapper';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class GroupMembershipsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Add a person to FAP groups
     * Requires an API key with the FAP permission to access this endpoint
     * @param requestBody User number and the list of groups to add the person to
     * @returns GroupMembershipWrapper Success, returns the groups the person was added to
     * @throws ApiError
     */
    public addPersonToFapGroup(
        requestBody?: GroupMembershipWrapper,
    ): CancelablePromise<GroupMembershipWrapper> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/group-memberships/fap',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `No FAP groups found in the list`,
                404: `No results were found for user number`,
                409: `Duplicate records of person were found`,
            },
        });
    }
    /**
     * Remove a person from FAP groups
     * Requires an API key with the FAP permission to access this endpoint
     * @param userNumber User number of the person to remove the membership from
     * @param groupName The name of the group to remove the person from
     * @returns void
     * @throws ApiError
     */
    public removePersonFromFapGroup(
        userNumber: number,
        groupName: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/group-memberships/fap',
            query: {
                'userNumber': userNumber,
                'groupName': groupName,
            },
            errors: {
                400: `Group is not a FAP group`,
                404: `No results were found for user number`,
                409: `Duplicate records of person were found`,
            },
        });
    }
    /**
     * Add a person to groups
     * Requires at least ADMIN role or ADMIN API-Key to access this endpoint
     * @param requestBody User number and the list of groups to add the person to
     * @returns GroupMembershipWrapper Success, returns the groups the person was added to
     * @throws ApiError
     */
    public addUserToGroups(
        requestBody?: GroupMembershipWrapper,
    ): CancelablePromise<GroupMembershipWrapper> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/group-memberships',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `No groups found with the given names`,
                404: `No results were found for user number`,
                409: `Duplicate records of person were found`,
            },
        });
    }
}
