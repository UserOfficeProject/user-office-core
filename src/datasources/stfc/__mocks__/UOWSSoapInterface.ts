export default class UOWSSoapClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getPersonDetailsFromSessionId(SessionId: any): Promise<any> {
    if (SessionId !== 'valid') {
      throw 'Invalid token';
    }

    return {
      return: {
        userNumber: '1',
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getRolesForUser(): Promise<any> {
    return {
      return: [
        {
          name: 'ISIS Instrument Scientist',
        },
        {
          name: 'ISIS Administrator',
        },
        {
          name: 'Developer',
        },
        {
          name: 'Admin',
        },
        {
          name: 'ISIS Instrument Scientist',
        },
        {
          name: 'User Officer',
        },
        {
          name: 'User Officer',
        },
        {
          name: 'User',
        },
      ],
    };
  }
}
