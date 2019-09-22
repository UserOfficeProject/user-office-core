import { AdminDataSource } from "../datasources/AdminDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { UserAuthorization } from "../utils/UserAuthorization";

export default class AdminMutations {
  constructor(
    private dataSource: AdminDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async setPageText(
    agent: User | null,
    id: number,
    text: string
  ): Promise<Boolean> {
    if (await this.userAuth.isUserOfficer(agent)) {
      return await this.dataSource.setPageText(id, text);
    }else{
      return false
    }
  }
}
