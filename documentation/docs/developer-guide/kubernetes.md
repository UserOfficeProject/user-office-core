# Kubernetes

_________________________________________________________________________________________________________

Kubernetes is a platform for automating the deployment, scaling, and operation of containerized applications. Helm is a package manager that simplifies the process of deploying and managing applications on Kubernetes by using pre-configured application packages called Helm charts.

## Repository and Helm Chart

The Helm charts for deploying the User Office platform with Kubernetes are located in the [`user-office-helm`](https://github.com/UserOfficeProject/user-office-helm) repository, specifically within the `user-office-app` directory.

_________________________________________________________________________________________________________

## Prerequisites

- Ensure that you have a Kubernetes cluster set up.
- Helm must be installed on your local machine to manage the deployment.
- OpenID Connect (OIDC) is required for authentication. The redirect URL for setting up your OIDC provider is `<HOSTNAME>/external-auth`.

_________________________________________________________________________________________________________

## Installing the Helm Chart

To install the User Office platform with the release name `user-office-app`, run the following commands:

    helm install -f values.yaml user-office-app \
    --set duo-backend.configmap.data.AUTH_CLIENT_ID=<AUTH_CLIENT_ID> \
    --set duo-backend.configmap.data.AUTH_CLIENT_SECRET=<AUTH_CLIENT_SECRET> \
    --set duo-backend.configmap.data.AUTH_DISCOVERY_URL=<AUTH_DISCOVERY_URL> \
    ./user-office-app

This command deploys the application with default settings, making it accessible at `localhost`. Ensure that you enter your actual OIDC provider details.

_________________________________________________________________________________________________________

## Configuration

The Helm chart is highly configurable, with several parameters available for customization:

- `duo-frontend.ingress.host`: The URL for the frontend (default is `localhost`).
- `duo-backend.ingress.host`: The URL for the backend (default is `localhost`).
- `duo-backend.configmap.data.AUTH_CLIENT_ID`: Your OpenID Client ID.
- `duo-backend.configmap.data.AUTH_CLIENT_SECRET`: Your OpenID Client Secret.
- `duo-backend.configmap.data.AUTH_DISCOVERY_URL`: The OIDC discovery URL, including the entire path.
- `rabbitmq.enabled`: Whether to enable [RabbitMQ](rabbitmq.md) (default is `false`).

You can specify these parameters directly in the Helm install command using `--set key=value`, or by modifying the `values.yaml` file.

_________________________________________________________________________________________________________

## Additional Modules

If you need to install the scheduler module, replace `values.yaml` with `values.scheduler.yaml` in your install command:

    helm install -f values.scheduler.yaml user-office-app ./user-office-app

The scheduler will communicate with the User Office core via [RabbitMQ](rabbitmq.md).

_________________________________________________________________________________________________________

## Handling Dependencies

The User Office software uses [dependency injection](dependency_injection.md) for services like email and RabbitMQ. To configure these services, you will need to modify the backend’s `configmap` and `secrets`:

- **RabbitMQ Configuration**: Set `RABBITMQ_HOSTNAME`, `RABBITMQ_USERNAME`, `RABBITMQ_CORE_EXCHANGE_NAME` in the `configmap`, and `RABBITMQ_PASSWORD` in the `secrets`.
- **Email Services Configuration**: The platform supports SMTP and Sparkpost. Adjust the dependency configuration as necessary for your environment.

_________________________________________________________________________________________________________

## Uninstalling the Helm Chart

To remove the deployed User Office platform, use the following command:

    helm delete user-office-app

This command will delete all Kubernetes components associated with the chart and remove the release.

_________________________________________________________________________________________________________
