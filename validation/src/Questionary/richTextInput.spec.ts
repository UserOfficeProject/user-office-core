import { richTextInputQuestionValidationSchema } from './richTextInput';

describe('RichTextInput maxWords constraint', () => {
  test('counts word-character groups after stripping HTML', async () => {
    const schema = richTextInputQuestionValidationSchema({
      config: { required: false, maxWords: 2 },
    });

    await expect(schema.isValid('<p>two words</p>')).resolves.toBe(true);
    await expect(schema.isValid('<p>three separate words</p>')).resolves.toBe(
      false
    );
    await expect(schema.isValid('<p>one</p><p>two</p><p>three</p>')).resolves.toBe(
      false
    );
  });

  test('does not impose a word limit when maxWords is unset', async () => {
    const schema = richTextInputQuestionValidationSchema({
      config: { required: false, maxWords: null },
    });

    await expect(schema.isValid('<p>any number of words</p>')).resolves.toBe(
      true
    );
  });
});