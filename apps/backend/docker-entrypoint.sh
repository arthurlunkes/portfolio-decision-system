#!/bin/sh
set -e

SCHEMA_PATH="./apps/backend/prisma/schema.prisma"

./node_modules/.bin/prisma generate --schema "$SCHEMA_PATH"

# Normalize legacy users before removing the USER enum variant.
cat <<'SQL' | ./node_modules/.bin/prisma db execute --schema "$SCHEMA_PATH" --stdin
DO $$
DECLARE
  target_role text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) AND EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'UserRole'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'UserRole' AND e.enumlabel = 'DECISOR'
    ) THEN
      target_role := 'DECISOR';
    ELSIF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'UserRole' AND e.enumlabel = 'VIEWER'
    ) THEN
      target_role := 'VIEWER';
    ELSE
      target_role := 'ADMIN';
    END IF;

    EXECUTE format(
      'UPDATE "public"."users" SET "role" = %L::"UserRole" WHERE "role"::text = ''USER''',
      target_role
    );
  END IF;
END
$$;
SQL

./node_modules/.bin/prisma db push --accept-data-loss --schema "$SCHEMA_PATH"

exec ./node_modules/.bin/tsx watch ./apps/backend/src/index.ts
