import { Query, Resolver } from 'type-graphql';

import { ServerConfig } from '../types/ServerConfig';

@Resolver()
export class ServerConfigQuery {
  @Query(() => ServerConfig, { nullable: false })
  ServerConfig() {
    return { baseURL: process.env.BASE_URL };
  }
}
