#!/bin/sh
# wait-for-postgres.sh

set -e

host="$1"
shift
cmd="$@"

until curl "$host"; do
  >&2 echo "frontend is unavailable - sleeping"
  sleep 5
done

>&2 echo "frontend is up - executing command"
sleep 20
exec $cmd