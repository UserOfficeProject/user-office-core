import { AdminDataSource } from "../datasources/AdminDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { UserAuthorization } from "../utils/UserAuthorization";
import { Rejection, rejection } from "../rejection";
import { Page } from "../models/Admin";
import { logger } from "../utils/Logger";

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
  ): Promise<Page | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return this.dataSource
      .setPageText(id, text)
      .then(page => {
        return page;
      })
      .catch(error => {
        logger.logException("Could not set page text", error, {
          agent,
          id
        });
        return rejection("INTERNAL_ERROR");
      });
  }
}
