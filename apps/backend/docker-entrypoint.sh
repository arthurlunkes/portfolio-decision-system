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

set +e
MIGRATE_OUTPUT=$(./node_modules/.bin/prisma migrate deploy --schema "$SCHEMA_PATH" 2>&1)
MIGRATE_EXIT=$?
set -e

echo "$MIGRATE_OUTPUT"

if [ "$MIGRATE_EXIT" -ne 0 ]; then
  if echo "$MIGRATE_OUTPUT" | grep -q "Error: P3005"; then
    echo "Detected Prisma P3005; applying baseline for existing migrations..."

    for migration_dir in ./apps/backend/prisma/migrations/*; do
      if [ -d "$migration_dir" ]; then
        migration_name=$(basename "$migration_dir")
        ./node_modules/.bin/prisma migrate resolve --schema "$SCHEMA_PATH" --applied "$migration_name"
      fi
    done

    ./node_modules/.bin/prisma migrate deploy --schema "$SCHEMA_PATH"
  else
    exit "$MIGRATE_EXIT"
  fi
fi

# Run seed only if no admin user exists (first run detection)
set +e
./node_modules/.bin/prisma db execute --schema "$SCHEMA_PATH" --stdin > /dev/null 2>&1 <<'SQL'
SELECT 1 FROM "users" WHERE "role" = 'ADMIN' LIMIT 1;
SQL
SEED_CHECK=$?
set -e

if [ "$SEED_CHECK" -eq 0 ]; then
  echo "Admin user exists; skipping seed."
else
  echo "No admin user found; running seed..."
  ./node_modules/.bin/tsx ./apps/backend/prisma/seed.ts
fi

exec ./node_modules/.bin/tsx ./apps/backend/src/index.ts
