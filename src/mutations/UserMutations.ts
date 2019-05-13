import User from "../models/User";

export default class UserMutations {
  create(args: any, context: any) {
    return context.repository.user
      .create(args.abstract, args.status, args.users)
      .then((id: number) =>
        id ? new User(id, args.abstract, args.status) : null
      );
  }
}
