# Grafana & Prometheus Stack

This directory contains a default configuration for a Grafana & Prometheus stack. The stack is configured to monitor the User Office application.
This directory is just a **demo** configuration to show how to monitor the User Office. It is not meant to be used in production.

## How to use

```bash
# in the root directory of the repository
# start the User Office application
npm run dev

# in the metrics directory
# start the Grafana & Prometheus stack
docker compose -f docker-compose.metrics.yml up
```

Use the application as you normally would. The metrics will be collected and displayed in Grafana.

## Grafana

1. Open the Grafana dashboard at [http://localhost:3333](http://localhost:3333) and login with the default credentials (admin/admin).
2. Dashboards -> GraphQL metrics

## Prometheus

Prometheus is available at [http://localhost:9090](http://localhost:9090).
