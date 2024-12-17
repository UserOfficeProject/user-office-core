/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DataLookupDTO } from '../models/DataLookupDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DataLookupService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get data lookup value that are used within data usage messages
     * This endpoint is anonymous and does not require any authentication
     * @returns DataLookupDTO Data lookup values for data usages
     * @throws ApiError
     */
    public getAllDataUsages(): CancelablePromise<Array<DataLookupDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/data-lookup/data-usages',
        });
    }
    /**
     * Get data lookup value by key name
     * This endpoint is anonymous and does not require any authentication
     * @param keyName The name of the value to lookup
     * @returns DataLookupDTO Data lookup value
     * @throws ApiError
     */
    public getDataLookup(
        keyName: string,
    ): CancelablePromise<DataLookupDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/data-lookup/{keyName}',
            path: {
                'keyName': keyName,
            },
            errors: {
                404: `Data lookup value not found`,
            },
        });
    }
}
