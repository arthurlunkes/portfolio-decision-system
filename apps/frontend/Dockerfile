FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN yarn install --immutable

COPY tsconfig.base.json turbo.json biome.json ./
COPY apps/frontend apps/frontend
COPY packages/shared packages/shared
RUN yarn workspace @portfolio/frontend exec vite build

FROM nginx:1.27-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]