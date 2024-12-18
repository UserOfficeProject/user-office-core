/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailWrapperDTO } from '../models/EmailWrapperDTO';
import type { PasswordResetDTO } from '../models/PasswordResetDTO';
import type { PasswordWrapperDTO } from '../models/PasswordWrapperDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PasswordResetService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Send password reset email
     * Requires an API key with ADMIN role
     * @param requestBody Email address of the user who needs password reset, password reset link will be sent to the email provided
     * @returns PasswordResetDTO Password reset was created
     * @throws ApiError
     */
    public createPasswordResetAndSendEmail(
        requestBody: EmailWrapperDTO,
    ): CancelablePromise<PasswordResetDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/password-reset',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid email address`,
                404: `No person found for email`,
                409: `Account is not active`,
                502: `Failed to send password reset email`,
            },
        });
    }
    /**
     * Reset password
     * This endpoint is anonymous, no authentication is required
     * @param encryptedResetId The encrypted reset ID to reset a password
     * @param requestBody New password to be set
     * @returns PasswordResetDTO Password was reset
     * @throws ApiError
     */
    public resetPassword(
        encryptedResetId: string,
        requestBody: PasswordWrapperDTO,
    ): CancelablePromise<PasswordResetDTO> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/password-reset/{encryptedResetId}',
            path: {
                'encryptedResetId': encryptedResetId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Password reset has expired`,
                404: `No password reset found for resetId`,
                409: `Account is not active`,
                500: `Failed to update password`,
            },
        });
    }
}
