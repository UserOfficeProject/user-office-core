/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiKeyDTO } from '../models/ApiKeyDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ApiKeysService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all API Keys
     * Requires at least ADMIN role to access this endpoint please contact us using contact details provided in the documentation if you need to access this endpoint
     * @returns ApiKeyDTO API Keys found
     * @throws ApiError
     */
    public getAllApiKeys(): CancelablePromise<Array<ApiKeyDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/api-keys',
        });
    }
    /**
     * Create API Key
     * Requires at least SUPER_ADMIN role to access this endpoint, this role is reserved for the U&A team leadplease contact us using contact details provided in the documentation if you need to access this endpoint.This endpoint ignores the token field if provided.
     * @param requestBody
     * @returns ApiKeyDTO API Key created
     * @throws ApiError
     */
    public createApiKey(
        requestBody?: ApiKeyDTO,
    ): CancelablePromise<ApiKeyDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/api-keys',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if no body is supplied or if service name, contact and role are not provided`,
            },
        });
    }
    /**
     * Get API Key by token
     * Requires at least ADMIN role or API-key to access this endpoint. If API key is used for auth it must be the same as the token supplied in the header X-API-key. If API-key auth is used it only allows to query the information about itself.
     * @param xApiKey The api key to search for
     * @returns ApiKeyDTO API Key found
     * @throws ApiError
     */
    public getApiKeyByToken(
        xApiKey: string,
    ): CancelablePromise<ApiKeyDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/api-keys/individual',
            headers: {
                'X-API-key': xApiKey,
            },
            errors: {
                400: `Bad request is returned if no token is supplied in the header X-API-key`,
                403: `Forbidden is returned if the token checked is different from the token used to access this endpoint`,
                404: `API Key not found`,
            },
        });
    }
    /**
     * Delete API Key by token
     * Requires at least SUPER_ADMIN role to access this endpoint, this role is reserved for the U&A team leadplease contact us using contact details provided in the documentation if you need to access this endpoint
     * @param xApiKey The API key to delete
     * @returns any API Key deleted
     * @throws ApiError
     */
    public softDeleteApiKey(
        xApiKey: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/api-keys/individual',
            headers: {
                'X-API-key': xApiKey,
            },
            errors: {
                404: `API Key not found`,
            },
        });
    }
}
