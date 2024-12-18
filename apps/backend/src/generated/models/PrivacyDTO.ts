/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PrivacyDTO = {
    /**
     * Whether the user is searchable
     */
    searchable: PrivacyDTO.searchable | null;
    /**
     * The id of the privacy
     */
    readonly id: number;
};
export namespace PrivacyDTO {
    /**
     * Whether the user is searchable
     */
    export enum searchable {
        YES = 'Yes',
        NO = 'No',
    }
}

