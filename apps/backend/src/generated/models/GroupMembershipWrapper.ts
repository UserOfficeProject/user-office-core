/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermissionUserGroupDTO } from './PermissionUserGroupDTO';
export type GroupMembershipWrapper = {
    /**
     * The user number of the user to add to the groups
     */
    userNumber: number;
    /**
     * DTOs of the groups to add the user to
     */
    groups: Array<PermissionUserGroupDTO>;
};

