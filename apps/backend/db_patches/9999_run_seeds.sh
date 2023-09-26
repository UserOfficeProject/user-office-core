#!/bin/bash

set -e

if [[ $INCLUDE_SEEDS != "" ]]; then
  for filename in /docker-entrypoint-initdb.d/db_seeds/*.sql; do
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < $filename
  done
fi
