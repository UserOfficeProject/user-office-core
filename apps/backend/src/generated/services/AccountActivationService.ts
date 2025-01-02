/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountActivationDTO } from '../models/AccountActivationDTO';
import type { ActivateAccountWrapperDTO } from '../models/ActivateAccountWrapperDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AccountActivationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Activate an account by activation ID
     * This endpoint is anonymous and does not require any authentication
     * @param encryptedId The encrypted activation ID
     * @param requestBody
     * @returns AccountActivationDTO Account activated successfully
     * @throws ApiError
     */
    public activateAccount(
        encryptedId: string,
        requestBody?: ActivateAccountWrapperDTO,
    ): CancelablePromise<AccountActivationDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/account-activation/{encryptedId}',
            path: {
                'encryptedId': encryptedId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid activation ID or password`,
                404: `Activation ID not found`,
                409: `Account already activated`,
                410: `Activation expired`,
                500: `Unexpected error`,
                502: `Failed to send email`,
            },
        });
    }
    /**
     * Activate an account and send activation email
     * Requires at least ADMIN role OR an API key with ADMIN permissions
     * @param email The email address of the user to send the activation email to
     * @returns AccountActivationDTO Activation email sent successfully
     * @throws ApiError
     */
    public sendActivationEmail(
        email: string,
    ): CancelablePromise<AccountActivationDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/account-activation/{email}',
            path: {
                'email': email,
            },
            errors: {
                400: `Invalid email address`,
                404: `No account found with the specified email address`,
                409: `Active account found with the specified email address`,
                500: `Unexpected error`,
            },
        });
    }
}
