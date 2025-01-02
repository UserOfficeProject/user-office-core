/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FacilityDTO } from '../models/FacilityDTO';
import type { MergeObjectsWrapperDTO } from '../models/MergeObjectsWrapperDTO';
import type { PersonCreationDTO } from '../models/PersonCreationDTO';
import type { PersonDTO } from '../models/PersonDTO';
import type { PrivacyDTO } from '../models/PrivacyDTO';
import type { UpdatePasswordWrapperDTO } from '../models/UpdatePasswordWrapperDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PersonService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get a list of people by specified parameter
     * Requires at least USER_OFFICE role to access this endpoint OR an API key with the ADMIN permission. This endpoint takes a number of parameters and does a search on all provided. The search is additive meaning that all results from each search parameter are combined into one list. It is advised to use only one search parameter at a time
     * @param surname The surname to search for
     * @param fedId The fedid to search for
     * @param estId The establishment id to search for Person objects that are associated with it
     * @param marketingEmail The marketing email used to search for a person
     * @returns PersonDTO Success
     * @throws ApiError
     */
    public getPeople(
        surname?: string,
        fedId?: string,
        estId?: number,
        marketingEmail?: string,
    ): CancelablePromise<Array<PersonDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person',
            query: {
                'surname': surname,
                'fedId': fedId,
                'estId': estId,
                'marketingEmail': marketingEmail,
            },
            errors: {
                400: `Bad request is returned if no parameters were supplied or a parameter is missing`,
            },
        });
    }
    /**
     * Create a person from a PersonCreationDTO
     * Requires an API key with the ADMIN permission to access this endpoint
     * @param requestBody The person to create
     * @returns PersonDTO Created
     * @throws ApiError
     */
    public createPerson(
        requestBody: PersonCreationDTO,
    ): CancelablePromise<PersonDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/person',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if the submitted DTO does have all required fields`,
            },
        });
    }
    /**
     * Deactivate a person by user number
     * Requires at least USER role to access this endpoint OR an API key with the ADMIN permission.Only the user themselves can deactivate their account unless an API key with the ADMIN permission is used or the client has the USER_OFFICE role
     * @param userNumber The user number to deactivate
     * @returns PersonDTO Success
     * @throws ApiError
     */
    public deactivatePerson(
        userNumber: string,
    ): CancelablePromise<PersonDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/person/{userNumber}/deactivate',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                409: `Conflict`,
            },
        });
    }
    /**
     * Get a person by user number
     * Requires an API key with the ADMIN permission to access this endpoint
     * @param userNumber The user number to search for
     * @returns PersonDTO Success
     * @throws ApiError
     */
    public getPerson(
        userNumber: string,
    ): CancelablePromise<PersonDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `Not Found`,
                409: `Conflict`,
            },
        });
    }
    /**
     * Update a person from a PersonDTO
     * Requires at least USER_OFFICE role to access this endpoint OR an API key with the ADMIN permissions
     * @param userNumber Person user number
     * @param requestBody The person DTO to update, DTOs userNumber will be used to determine which record is being updated
     * @param isMailingApi A boolean to indicate if the request is from the mailing API
     * @returns PersonDTO Success
     * @throws ApiError
     */
    public updatePerson(
        userNumber: string,
        requestBody: PersonDTO,
        isMailingApi?: boolean,
    ): CancelablePromise<PersonDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/person/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            query: {
                'isMailingApi': isMailingApi,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if the DTO does not have required fields or is missing a UserNumber`,
                409: `Conflict is returned if duplicate records were found or if an email already exists`,
            },
        });
    }
    /**
     * Get a person by current user number or old user number
     * Requires at least USER_OFFICE role to access this endpoint OR an API key with the ADMIN permission
     * @param userNumber The user number to search for
     * @returns PersonDTO Success
     * @throws ApiError
     */
    public getPersonByCurrentOrOldUserNumber(
        userNumber: string,
    ): CancelablePromise<PersonDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person/{userNumber}/including-old',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `Not Found`,
                409: `Conflict if two duplicate records are found`,
            },
        });
    }
    /**
     * Get a person's history by user number
     * Requires at least USER_OFFICE role to access this endpoint OR an API key with the ADMIN permission
     * @param userNumber The user number to search for
     * @returns PersonDTO Success
     * @throws ApiError
     */
    public getPersonHistoryByUserNumber(
        userNumber: string,
    ): CancelablePromise<Array<PersonDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person/{userNumber}/history',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * Get a list of facilities by user number
     * Requires at least USER_OFFICE role or GET_ALL_BASICPERSONDETAILS API-Key to access this endpoint
     * @param userNumber The user number of the person to get facilities for
     * @returns FacilityDTO Success
     * @throws ApiError
     */
    public getPersonsFacility(
        userNumber: string,
    ): CancelablePromise<Array<FacilityDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person/{userNumber}/facilities',
            path: {
                'userNumber': userNumber,
            },
        });
    }
    /**
     * Update a person's facilities
     * Requires at least USER_OFFICE role or GET_ALL_BASICPERSONDETAILS API-Key to access this endpoint
     * @param userNumber The user number of the person to update the facilities for
     * @param requestBody The list of facilities to update
     * @returns FacilityDTO Success
     * @throws ApiError
     */
    public updatePersonsFacilities(
        userNumber: string,
        requestBody: Array<FacilityDTO>,
    ): CancelablePromise<Array<FacilityDTO>> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/person/{userNumber}/facilities',
            path: {
                'userNumber': userNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if one or more facilities do not exist, or if no facilities are provided`,
                404: `Not Found`,
                409: `Conflict is returned if duplicate records of person were found`,
            },
        });
    }
    /**
     * Remove a person's facilities
     * Requires at least USER_OFFICE role or ADMIN API-Key to access this endpoint
     * @param userNumber The user number of the person to remove the facilities for
     * @returns void
     * @throws ApiError
     */
    public removePersonsFacilities(
        userNumber: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/person/{userNumber}/facilities',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `Not Found`,
                409: `Conflict is returned if duplicate records of person were found`,
            },
        });
    }
    /**
     * Merge two users
     * Requires at least USER_OFFICE role or ADMIN API-Key to access this endpoint
     * @param userNumbers A list of the two unique user numbers of the users to merge
     * @param requestBody The new person to create, their emergency contact info, and the user number of the person we want to keep facilities from. The new user will have a new user number automatically assigned.
     * @returns MergeObjectsWrapperDTO Success
     * @throws ApiError
     */
    public mergeUsers(
        userNumbers: Array<string>,
        requestBody: MergeObjectsWrapperDTO,
    ): CancelablePromise<MergeObjectsWrapperDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/person/merge',
            query: {
                'userNumbers': userNumbers,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Did not receive two unique user numbers`,
                404: `Not Found`,
                409: `Conflict if duplicate records are found`,
            },
        });
    }
    /**
     * Set a person's privacy
     * Requires at least USER role or ADMIN API-Key to access this endpoint, this is self-reference only endpoint meaning only a user owning the resource can access it. ADMIN role can bypass this restriction
     * @param userNumber User number to set privacy to
     * @param requestBody The privacy DTO to set
     * @returns PrivacyDTO Created
     * @throws ApiError
     */
    public setPrivacy(
        userNumber: string,
        requestBody: PrivacyDTO,
    ): CancelablePromise<PrivacyDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/person/{userNumber}/privacy',
            path: {
                'userNumber': userNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Conflict is returned if duplicate records of person were found`,
            },
        });
    }
    /**
     * Update a person's password
     * Requires at least USER role to access this endpoint, this is self-reference only endpoint meaning only a user owning the resource can access it
     * @param userNumber
     * @param requestBody The old password and the new password to update
     * @returns PersonDTO Success
     * @throws ApiError
     */
    public updatePassword(
        userNumber: string,
        requestBody: UpdatePasswordWrapperDTO,
    ): CancelablePromise<PersonDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/person/{userNumber}/update-password',
            path: {
                'userNumber': userNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if the new password does not meet security requirements or if the old password is incorrect or if the password body was not of the correct format`,
                404: `Not Found`,
            },
        });
    }
}
