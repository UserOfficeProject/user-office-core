/*
author: 
    martintrajanovski
purpose: 
    Adding new table for storing events.
date:
    04.march.2020
*/

CREATE TABLE IF NOT EXISTS event_logs(
    id serial PRIMARY KEY,
    changed_by int REFERENCES users (user_id),
    event_type text DEFAULT NULL,
    row_data text DEFAULT NULL,
    event_tstamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_object_id text DEFAULT NULL
);
