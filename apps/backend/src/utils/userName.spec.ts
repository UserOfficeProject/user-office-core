import { getPreferredNameWithLastname } from '../../../frontend/src/utils/userName';

describe('getPreferredNameWithLastname', () => {
  it('formats the last name before the preferred name', () => {
    expect(
      getPreferredNameWithLastname({
        firstname: 'First',
        lastname: 'Last',
        preferredname: 'Preferred',
      })
    ).toBe('Last, Preferred');
  });

  it('uses the preferred name when no last name is available', () => {
    expect(
      getPreferredNameWithLastname({
        firstname: 'First',
        lastname: '',
        preferredname: 'Preferred',
      })
    ).toBe('Preferred');
  });

  it('falls back to the first name when no preferred or last name is available', () => {
    expect(
      getPreferredNameWithLastname({
        firstname: 'First',
        lastname: null,
      })
    ).toBe('First');
  });
});
