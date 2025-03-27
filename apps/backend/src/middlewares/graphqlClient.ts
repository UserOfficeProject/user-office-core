import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { FeatureId } from '../models/Feature';

const SCHEDULER_ENDPOINT = process.env.SCHEDULER_ENDPOINT as string;

type GetAllQueriesAndMutationsQuery = {
  schedulerQueriesAndMutations: {
    queries: Array<string>;
    mutations: Array<string>;
  } | null;
};

export const getSdk = (client: ApolloClient<any>) => {
  return {
    getQueriesAndMutations:
      async (): Promise<GetAllQueriesAndMutationsQuery> => {
        const GetAllQueriesAndMutationsQuery = gql`
          query getAllQueriesAndMutations {
            schedulerQueriesAndMutations {
              queries
              mutations
            }
          }
        `;
        const result = await client.query({
          query: GetAllQueriesAndMutationsQuery,
          fetchPolicy: 'cache-first', // Use cache-first policy for caching
        });

        return result.data;
      },
  };
};

const createApolloClient = (endpoint: string, token?: string) => {
  const httpLink = new HttpLink({ uri: endpoint });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        ...(token && { authorization: token }),
      },
    };
  });

  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
};

export type Sdk = ReturnType<typeof getSdk>;

export default function initGraphQLClient(token?: string) {
  // create a new GraphQLClient lazily, only when we need one
  return async () => {
    const adminDataSource = container.resolve<AdminDataSource>(
      Tokens.AdminDataSource
    );
    const features = await adminDataSource.getFeatures();

    const isSchedulerEnabled = features.find(
      (feature) => feature.id === FeatureId.SCHEDULER
    )?.isEnabled;

    if (!isSchedulerEnabled) {
      return;
    }

    if (!SCHEDULER_ENDPOINT) {
      logger.logError(
        'Scheduler enabled but env `SCHEDULER_ENDPOINT` is missing',
        {}
      );

      return;
    }

    const client = createApolloClient(SCHEDULER_ENDPOINT, token);

    return getSdk(client);
  };
}
