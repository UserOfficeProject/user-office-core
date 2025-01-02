/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountryDTO } from '../models/CountryDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CountryService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all countries
     * This endpoint is anonymous and does not require any authentication
     * @returns CountryDTO List of countries
     * @throws ApiError
     */
    public getCountries(): CancelablePromise<Array<CountryDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/countries',
        });
    }
    /**
     * Get all EU countries
     * This endpoint is anonymous and does not require any authentication
     * @returns CountryDTO List of EU countries
     * @throws ApiError
     */
    public getEuCountries(): CancelablePromise<Array<CountryDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/countries/eu',
        });
    }
}
