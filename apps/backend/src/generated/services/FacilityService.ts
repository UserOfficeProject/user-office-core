/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FacilityDTO } from '../models/FacilityDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FacilityService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all facilities
     * This endpoint is anonymous and does not require any authentication
     * @returns FacilityDTO List of facilities
     * @throws ApiError
     */
    public getAllFacilities(): CancelablePromise<Array<FacilityDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/facilities',
        });
    }
}
