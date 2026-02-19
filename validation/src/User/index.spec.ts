import * as Yup from 'yup';
import * as UserValidation from './index';

describe('User validation schemas', () => {
    describe('deleteUserValidationSchema', () => {
        it('should validate with correct data', async () => {
            const validData = { id: 1 };
            await expect(
                UserValidation.deleteUserValidationSchema.validate(validData)
            ).resolves.toEqual(validData);
        });

        it('should fail when id is missing', async () => {
            const invalidData = {};
            await expect(
                UserValidation.deleteUserValidationSchema.validate(invalidData)
            ).rejects.toThrow();
        });
    });

    describe('createUserByEmailInviteValidationSchema', () => {
        const UserRole = { USER: 'user', ADMIN: 'admin' };
        const schema = UserValidation.createUserByEmailInviteValidationSchema(UserRole);

        it('should validate with correct data', async () => {
            const validData = {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john.doe@example.com',
                userRole: 'USER',
            };
            await expect(schema.validate(validData)).resolves.toEqual(validData);
        });

        it('should fail when required fields are missing', async () => {
            const invalidData = { email: 'john.doe@example.com' };
            await expect(schema.validate(invalidData)).rejects.toThrow();
        });

        it('should fail when email is invalid', async () => {
            const invalidData = {
                firstname: 'John',
                lastname: 'Doe',
                email: 'invalid-email',
                userRole: 'user',
            };
            await expect(schema.validate(invalidData)).rejects.toThrow();
        });

        it('should fail when role is not in UserRole', async () => {
            const invalidData = {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john.doe@example.com',
                userRole: 'invalid-role',
            };
            await expect(schema.validate(invalidData)).rejects.toThrow();
        });
    });

    describe('signInValidationSchema', () => {
        it('should validate with correct credentials', async () => {
            const validData = {
                email: 'user@example.com',
                password: 'Password123',
            };
            await expect(
                UserValidation.signInValidationSchema.validate(validData)
            ).resolves.toEqual(validData);
        });

        it('should fail when email is invalid', async () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'Password123',
            };
            await expect(
                UserValidation.signInValidationSchema.validate(invalidData)
            ).rejects.toThrow();
        });

        it('should fail when password is too short', async () => {
            const invalidData = {
                email: 'user@example.com',
                password: 'short',
            };
            await expect(
                UserValidation.signInValidationSchema.validate(invalidData)
            ).rejects.toThrow();
        });
    });

    describe('updatePasswordValidationSchema', () => {
        it('should validate with correct data', async () => {
            const validData = {
                id: 1,
                password: 'Password123',
            };
            await expect(
                UserValidation.updatePasswordValidationSchema.validate(validData)
            ).resolves.toEqual(validData);
        });

        it('should fail when password does not meet requirements', async () => {
            const invalidData = {
                id: 1,
                password: 'password', // no uppercase or numbers
            };
            await expect(
                UserValidation.updatePasswordValidationSchema.validate(invalidData)
            ).rejects.toThrow();
        });
    });

    describe('userPasswordFieldValidationSchema', () => {
        it('should validate with matching passwords', async () => {
            const validData = {
                password: 'Password123',
                confirmPassword: 'Password123',
            };
            await expect(
                UserValidation.userPasswordFieldValidationSchema.validate(validData)
            ).resolves.toEqual(validData);
        });

        it('should fail when passwords do not match', async () => {
            const invalidData = {
                password: 'Password123',
                confirmPassword: 'DifferentPassword123',
            };
            await expect(
                UserValidation.userPasswordFieldValidationSchema.validate(invalidData)
            ).rejects.toThrow('Confirm password does not match password');
        });
    });

    describe('createUserValidationSchema', () => {
        it('should validate with correct user data', async () => {
            const validData = {
                firstname: 'John',
                lastname: 'Doe',
                user_title: 'Mr',
                email: 'john.doe@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                institutionId: 1,
            };
            await expect(
                UserValidation.createUserValidationSchema.validate(validData)
            ).resolves.toMatchObject(validData);
        });

        it('should validate with optional preferredname', async () => {
            const validData = {
                firstname: 'John',
                lastname: 'Doe',
                preferredname: 'Johnny',
                user_title: 'Mr',
                email: 'john.doe@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                institutionId: 1,
            };
            
            await expect(
                UserValidation.createUserValidationSchema.validate(validData)
            ).resolves.toMatchObject(validData);
        });
    });
});
