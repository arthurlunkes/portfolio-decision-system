FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY configs/eslint-config/package.json configs/eslint-config/package.json
COPY configs/eslint-config-base/package.json configs/eslint-config-base/package.json
COPY configs/eslint-config-node/package.json configs/eslint-config-node/package.json
COPY configs/eslint-config-vue/package.json configs/eslint-config-vue/package.json
COPY configs/prettier-config/package.json configs/prettier-config/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN yarn install --immutable

COPY tsconfig.base.json turbo.json ./
COPY apps/frontend apps/frontend
COPY packages/shared packages/shared
RUN yarn workspace @portfolio/frontend exec vite build

FROM nginx:1.27-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]