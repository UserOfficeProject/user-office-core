RabbitMQ is a message broker that enables applications to communicate with each other asynchronously by sending and receiving messages. It is used within User Office to handle communication between different components of the system, particularly for routing messages related to proposal status actions. 

This page provides an overview of how RabbitMQ is integrated into the project, including details on configuration, message handling, and frontend display.

## RabbitMQ in User Office Core

When the status of a proposal changes, a message is sent to specific RabbitMQ exchanges, which then route the message to the appropriate services or components for further processing.

Enable it in the [configuration](configuration.md).

## Configuration of RabbitMQ Exchanges

The RabbitMQ exchanges are configured using the `RabbitMQActionConfig` class. This class defines the exchanges to which messages will be sent when the status of a proposal changes.

    @ObjectType()
    export class RabbitMQActionConfig extends ProposalStatusActionConfigBase {
    @Field(() => [String], { nullable: true })
    exchanges?: string[] | null;
    }

**Exchanges:** The exchanges property is an array of strings, each representing the name of a RabbitMQ exchange. These exchanges are where messages related to proposal status changes are sent.

## Backend Message Handling

The `rabbitMQActionHandler` function in the backend is responsible for sending messages to RabbitMQ exchanges based on the configuration defined in `RabbitMQActionConfig`.

    export const rabbitMQActionHandler = async (
      proposalStatusAction: ConnectionHasStatusAction,
      proposals: WorkflowEngineProposalType[]
    ) => {
      const config = proposalStatusAction.config as RabbitMQActionConfig;
      if (!config.exchanges?.length) {
        return;
      }

      const messageDescription =
        'Proposal event successfully sent to the message broker';

      return await Promise.all(
        config.exchanges.map((exchange) =>
          publishMessageToTheEventBus(proposals, messageDescription, exchange)
        )
     );
    };

**Message Publishing:** This function takes in a `proposalStatusAction` and an array of proposals. It then publishes messages to each configured exchange by calling `publishMessageToTheEventBus`.

If no exchanges are configured, the function exits early without performing any actions.

## Frontend Display of RabbitMQ Exchanges

On the frontend, the `RabbitMQActionConfig` component is responsible for displaying the RabbitMQ exchanges where messages are sent. This provides users with information of how and where proposal data is routed.

    type RabbitMQActionConfigProps = {
      exchanges: RabbitMqActionConfigType['exchanges'];
    };

    const RabbitMQActionConfig = ({ exchanges }: RabbitMQActionConfigProps) => {
      return (
        <Typography variant="subtitle1" color="black">
          Messages with <i>proposal data</i> are sent to the following RabbitMQ exchanges:{' '}
          <ul style={{ margin: 0 }}>
            {exchanges?.map((exchange, index) => (
              <li key={index}>
                <b>{exchange}</b>
              </li>
            ))}
          </ul>
        </Typography>
      );
    };

    export default RabbitMQActionConfig;

The component renders a list of RabbitMQ exchanges, showing which exchanges are being used to route messages related to proposal data.

## GraphQL Integration

The `RabbitMQActionConfig` class is integrated into the project’s GraphQL API, allowing for dynamic configuration and querying of RabbitMQ settings.

You can retrieve the RabbitMQ configuration using a GraphQL query:

    query {
      proposalStatusActionConfig {
        exchanges
      }
    }
