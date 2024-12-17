/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressDTO } from '../models/AddressDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AddressService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create address
     * Requires at least USER_OFFICE role OR an API key with ADMIN permissions
     * @param requestBody Address to create, postalAddressId will be ignored
     * @returns AddressDTO Address created
     * @throws ApiError
     */
    public createAddress(
        requestBody: AddressDTO,
    ): CancelablePromise<AddressDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/address',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if no body is supplied`,
            },
        });
    }
    /**
     * Get address by ID
     * Requires at least USER_OFFICE role OR an API key with GET_ALL_BASICPERSONDETAILS permissions
     * @param id
     * @returns AddressDTO Address found
     * @throws ApiError
     */
    public getAddress(
        id: number,
    ): CancelablePromise<AddressDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/address/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Address not found`,
            },
        });
    }
    /**
     * Update address
     * Requires at least USER_OFFICE role OR an API key with ADMIN permissions
     * @param id Address ID
     * @param requestBody Address to update, postalAddressId will be used to determine which record to update
     * @returns AddressDTO Address updated
     * @throws ApiError
     */
    public updateAddress(
        id: number,
        requestBody: AddressDTO,
    ): CancelablePromise<AddressDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/address/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request is returned if no body is supplied`,
            },
        });
    }
}
