FROM node:26.7.0-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# node:26 no longer bundles corepack; install it explicitly, then let it
# fetch the exact pnpm version pinned in package.json#packageManager.
RUN npm install -g --ignore-scripts corepack@0.35.0 && corepack enable

COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate the typed API client from the committed openapi.json before compiling.
RUN pnpm run openapi-ts

# VITE_* vars are inlined into the JS bundle at build time, so they must be
# supplied as build args, e.g.:
#   docker build --build-arg VITE_API_URL=https://api.example.com ...
ARG VITE_API_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} \
    VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM} \
    VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}

RUN pnpm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
