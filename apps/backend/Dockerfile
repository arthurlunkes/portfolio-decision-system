FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY configs/eslint-config-base/package.json configs/eslint-config-base/package.json
COPY configs/eslint-config-node/package.json configs/eslint-config-node/package.json
COPY configs/eslint-config-vue/package.json configs/eslint-config-vue/package.json
COPY configs/prettier-config/package.json configs/prettier-config/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN yarn install --immutable

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json turbo.json ./
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
COPY --from=deps /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=deps /app/package.json ./package.json
RUN sed -i 's/\r$//' ./apps/backend/docker-entrypoint.sh
RUN chmod +x ./apps/backend/docker-entrypoint.sh
EXPOSE 4000
CMD ["sh", "./apps/backend/docker-entrypoint.sh"]