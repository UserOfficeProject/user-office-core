/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HealthcheckResponse } from '../models/HealthcheckResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class HealthcheckService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Ping mailchimp-webhooks
     * This service is used to check if the mailchimp-webhooks is active and responding to requests
     * @returns HealthcheckResponse mailchimp-webhooks is active and responding to requests
     * @throws ApiError
     */
    public pollMailchimpWebhooks(): CancelablePromise<HealthcheckResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/health-check/mailchimp-webhooks',
            errors: {
                503: `mailchimp-webhooks is currently unavailable`,
            },
        });
    }
    /**
     * Ping merge-user-tool
     * This service is used to check if the merge-user-tool is active and responding to requests
     * @returns HealthcheckResponse merge-user-tool is active and responding to requests
     * @throws ApiError
     */
    public pollMergeUserTool(): CancelablePromise<HealthcheckResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/health-check/merge-user-tool',
            errors: {
                503: `merge-user-tool is currently unavailable`,
            },
        });
    }
    /**
     * Ping users REST API
     * This service is used to check if the REST API is active and responding to requests
     * @returns HealthcheckResponse REST API is active and responding to requests
     * @throws ApiError
     */
    public pollRestApi(): CancelablePromise<HealthcheckResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/health-check',
            errors: {
                503: `REST API is currently unavailable`,
            },
        });
    }
}
