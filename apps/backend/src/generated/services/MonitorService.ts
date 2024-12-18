/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EqualOpsWrapperDTO } from '../models/EqualOpsWrapperDTO';
import type { MonitorDTO } from '../models/MonitorDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class MonitorService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all the options for equal ops information we collect
     * No auth required
     * @returns EqualOpsWrapperDTO Equal ops options
     * @throws ApiError
     */
    public getEqualOpsOptions(): CancelablePromise<EqualOpsWrapperDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/monitor/options',
        });
    }
    /**
     * Get monitor data for user
     * Requires at least USER role to access this endpoint, this is self-reference only endpoint meaning only a user owning the resource can access it. ADMIN role or API-Key can bypass this restriction.
     * @param userNumber User number of the person whose monitor data is searched
     * @returns MonitorDTO Monitor data for user
     * @throws ApiError
     */
    public getMonitorForUser(
        userNumber: string,
    ): CancelablePromise<MonitorDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/monitor/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            errors: {
                404: `No monitor data found for user`,
            },
        });
    }
    /**
     * Set monitor data for user
     * Requires at least USER role to access this endpoint, this is self-reference only endpoint meaning only a user owning the resource can access it. ADMIN role or API-Key can bypass this restriction.
     * @param userNumber User number of the person whose monitor data is updated
     * @param requestBody Monitor data to be set for user
     * @returns MonitorDTO Monitor data for user
     * @throws ApiError
     */
    public setMonitorForUser(
        userNumber: string,
        requestBody: MonitorDTO,
    ): CancelablePromise<MonitorDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/monitor/{userNumber}',
            path: {
                'userNumber': userNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid monitor data was submitted`,
            },
        });
    }
}
