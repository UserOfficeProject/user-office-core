/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EstablishmentDTO } from '../models/EstablishmentDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EstablishmentService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all establishments matching the search query
     * This endpoint is anonymous and does not require any authentication
     * @param search Establishment to search for: organisation name, department name or acronym of both can be used to search
     * @returns EstablishmentDTO Establishments found
     * @throws ApiError
     */
    public getEstablishmentsByQuery(
        search: string,
    ): CancelablePromise<Array<EstablishmentDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/establishment',
            query: {
                'search': search,
            },
        });
    }
    /**
     * Create establishment
     * Requires at least ADMIN role to access this endpoint OR an API key with the ADMIN permission
     * @param requestBody Establishment to create
     * @returns EstablishmentDTO Establishment created
     * @throws ApiError
     */
    public createEstablishment(
        requestBody: EstablishmentDTO,
    ): CancelablePromise<EstablishmentDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/establishment',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if the DTO object does not have all required fields.`,
            },
        });
    }
    /**
     * Get establishment by id
     * This endpoint is anonymous and does not require any authentication
     * @param establishmentId The id of the establishment to search for
     * @returns EstablishmentDTO Establishment found
     * @throws ApiError
     */
    public getEstablishment(
        establishmentId: number,
    ): CancelablePromise<EstablishmentDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/establishment/{establishmentId}',
            path: {
                'establishmentId': establishmentId,
            },
            errors: {
                404: `Establishment not found`,
            },
        });
    }
    /**
     * Update establishment
     * Requires at least USER_OFFICE role or an ADMIN API-key to access this endpoint
     * @param establishmentId
     * @param requestBody Establishment to update
     * @returns EstablishmentDTO Establishment updated
     * @throws ApiError
     */
    public updateEstablishment(
        establishmentId: number,
        requestBody: EstablishmentDTO,
    ): CancelablePromise<EstablishmentDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/establishment/{establishmentId}',
            path: {
                'establishmentId': establishmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if the DTO object is missing or does not match the establishment id provided in the path.`,
                404: `Not found is returned if no establishment is found with the id provided.`,
                409: `Duplicate results is returned if an establishment with the same details already exists.`,
            },
        });
    }
    /**
     * Delete establishment
     * Requires at least USER_OFFICE role or an ADMIN API-key to access this endpoint
     * @param establishmentId
     * @returns void
     * @throws ApiError
     */
    public deleteEstablishment(
        establishmentId: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/establishment/{establishmentId}',
            path: {
                'establishmentId': establishmentId,
            },
            errors: {
                400: `Bad request is returned if the establishment has people associated with it.`,
                409: `Conflict is returned if duplicate establishment is found`,
            },
        });
    }
    /**
     * Returns all establishments which are similar to the given establishment's postcode, org name, or org acronym
     * This endpoint is anonymous and does not require any authentication
     * @param establishmentId
     * @returns EstablishmentDTO Successful search
     * @throws ApiError
     */
    public getSimilarEstablishments(
        establishmentId: string,
    ): CancelablePromise<Array<EstablishmentDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/establishment/similar/{establishmentId}',
            path: {
                'establishmentId': establishmentId,
            },
            errors: {
                404: `Not found is returned if no establishment is found with the id provided.`,
            },
        });
    }
    /**
     * Get all unverified establishments
     * This endpoint is anonymous and does not require any authentication
     * @returns EstablishmentDTO Establishments found
     * @throws ApiError
     */
    public getUnverifiedEstablishments(): CancelablePromise<Array<EstablishmentDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/establishment/unverified',
        });
    }
    /**
     * Merges two establishments based on ids
     * Requires at least USER_OFFICE role or an ADMIN API-key to access this endpoint
     * @param oldEst The id of the establishment to merge
     * @param newEst The id of the establishment to merge into
     * @returns EstablishmentDTO Establishment merged
     * @throws ApiError
     */
    public mergeEstablishment(
        oldEst: string,
        newEst: string,
    ): CancelablePromise<EstablishmentDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/establishment/merge',
            query: {
                'oldEst': oldEst,
                'newEst': newEst,
            },
            errors: {
                400: `Bad request is returned if oldEst and newEst parameters are not provided.`,
                409: `Conflict is returned if duplicate establishment is found`,
            },
        });
    }
}
