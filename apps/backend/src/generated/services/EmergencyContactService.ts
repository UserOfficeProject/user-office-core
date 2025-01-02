/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmergencyContactDTO } from '../models/EmergencyContactDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EmergencyContactService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get emergency contact details for a user
     * Requires at least USER role OR an API key with  GET_ALL_BASICPERSONDETAILS permissions, this is self-reference only meaning only a user owning the resource can access it, clients with USER_OFFICE role can bypass this restriction
     * @param userNumber The user number of the user to get emergency contact details for
     * @returns EmergencyContactDTO Emergency contact details for the user
     * @throws ApiError
     */
    public getEmergencyContact(
        userNumber: string,
    ): CancelablePromise<EmergencyContactDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/emergency-contact/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `No emergency contact details found for the user`,
            },
        });
    }
    /**
     * Update emergency contact details for a user
     * Requires at least USER role OR an API key with ADMIN permissions, this is self-reference only meaning only a user owning the resource can access it, clients with USER_OFFICE role can bypass this restriction
     * @param userNumber The user number of the user to update emergency contact details for
     * @param requestBody
     * @returns EmergencyContactDTO Updated emergency contact details for the user
     * @throws ApiError
     */
    public updateEmergencyContact(
        userNumber: string,
        requestBody: EmergencyContactDTO,
    ): CancelablePromise<EmergencyContactDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/emergency-contact/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
