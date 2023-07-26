export default class UOWSSoapClient {
  private static instance = new UOWSSoapClient();

  static getInstance() {
    return this.instance;
  }

  private UOWSSoapClient() {
    return;
  }

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
  public async getSearchableBasicPersonDetailsFromEmail(
    Token: any,
    Email: any
  ): Promise<any> {
    if (Email === 'valid') {
      return {
        return: {
          userNumber: '12345',
        },
      };
    } else {
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getBasicPersonDetailsFromEmail(
    Token: any,
    Email: any
  ): Promise<any> {
    if (Email === 'valid') {
      return {
        return: {
          userNumber: '12345',
        },
      };
    } else {
      return null;
    }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getSearchableBasicPeopleDetailsFromUserNumbers(
    Token: any,
    userNumbers: any[]
  ): Promise<any> {
    const searchableUserId = '1';

    if (userNumbers.every((id) => id === searchableUserId)) {
      return {
        return: [
          {
            userNumber: '1',
          },
        ],
      };
    } else {
      return {
        return: [],
      };
    }
  }
}
