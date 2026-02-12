import { textInputQuestionValidationSchema } from './textInput';
describe('TextInput config required true', () => {

    let schema: ReturnType<typeof textInputQuestionValidationSchema>;
    beforeAll(() => {
        schema = textInputQuestionValidationSchema({
            config: {
                required: true,
                min: 5,
                max: 10
            }
        });
    });
    test('should be required', async () => {
        await expect(schema.isValid('')).resolves.toBe(false);
    });
    test('should be valid when value is 5 characters', async () => {
        await expect(schema.isValid('12345')).resolves.toBe(true);
    }
    );
    test('should be valid when value is 10 characters', async () => {
        await expect(schema.isValid('1234567890')).resolves.toBe(true);
    }
    );
    test('should be invalid when value is 4 characters', async () => {
        await expect(schema.isValid('1234')).resolves.toBe(false);
    }
    );
    test('should be invalid when value is 11 characters', async () => {
        await expect(schema.isValid('12345678901')).resolves.toBe(false);
    });
    
    test('should be invalid when value is null', async () => {
        await expect(schema.isValid(null)).resolves.toBe(false);
    });
    
    test('should be invalid when value is undefined', async () => {
        await expect(schema.isValid(undefined)).resolves.toBe(false);
    });
})

describe('TextInput config required false', () => {
    let schema: ReturnType<typeof textInputQuestionValidationSchema>;
    beforeAll(() => {
        schema = textInputQuestionValidationSchema({
            config: {
                required: false,
                min: 5,
                max: 10
            }
        });
    });
    
    test('should be valid when value is empty string', async () => {
        await expect(schema.isValid('')).resolves.toBe(true);
    });
    
    test('should be valid when value is null', async () => {
        await expect(schema.isValid(null)).resolves.toBe(true);
    });
    
    test('should be valid when value meets min/max constraints', async () => {
        await expect(schema.isValid('12345')).resolves.toBe(true);
        await expect(schema.isValid('1234567890')).resolves.toBe(true);
    });
    
    test('should be invalid when value is below min length', async () => {
        await expect(schema.isValid('1234')).resolves.toBe(false);
    });
    
    test('should be invalid when value exceeds max length', async () => {
        await expect(schema.isValid('12345678901')).resolves.toBe(false);
    });
});

describe('TextInput with only min constraint', () => {
    let schema: ReturnType<typeof textInputQuestionValidationSchema>;
    beforeAll(() => {
        schema = textInputQuestionValidationSchema({
            config: {
                required: true,
                min: 3
            }
        });
    });
    
    test('should be valid when value is at or above min length', async () => {
        await expect(schema.isValid('123')).resolves.toBe(true);
        await expect(schema.isValid('1234567890')).resolves.toBe(true);
    });
    
    test('should be invalid when value is below min length', async () => {
        await expect(schema.isValid('12')).resolves.toBe(false);
    });
});

describe('TextInput with only max constraint', () => {
    let schema: ReturnType<typeof textInputQuestionValidationSchema>;
    beforeAll(() => {
        schema = textInputQuestionValidationSchema({
            config: {
                required: true,
                max: 8
            }
        });
    });
    
    test('should be valid when value is at or below max length', async () => {
        await expect(schema.isValid('')).resolves.toBe(false); // Still required
        await expect(schema.isValid('12345678')).resolves.toBe(true);
    });
    
    test('should be invalid when value exceeds max length', async () => {
        await expect(schema.isValid('123456789')).resolves.toBe(false);
    });
});

describe('TextInput with no constraints', () => {
    let schema: ReturnType<typeof textInputQuestionValidationSchema>;
    beforeAll(() => {
        schema = textInputQuestionValidationSchema({
            config: {
                required: false
            }
        });
    });
    
    test('should be valid for any string input', async () => {
        await expect(schema.isValid('')).resolves.toBe(true);
        await expect(schema.isValid('short')).resolves.toBe(true);
        await expect(schema.isValid('very long text with many characters')).resolves.toBe(true);
    });
});
