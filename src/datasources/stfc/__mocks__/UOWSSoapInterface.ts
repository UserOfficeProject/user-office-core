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
}
