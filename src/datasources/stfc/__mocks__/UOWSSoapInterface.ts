export default class UOWSSoapClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getPersonDetailsFromSessionId(SessionId: any): any {
    if (SessionId !== 'valid') {
      return undefined;
    }

    return {
      return: {
        userNumber: '1',
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getRolesForUser(token: any, userNumber: any): any {
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
