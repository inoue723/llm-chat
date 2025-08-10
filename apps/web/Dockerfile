FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest && corepack enable

FROM base AS deps
COPY . /app/
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --frozen-lockfile install

FROM deps AS build
COPY . .
RUN pnpm run --filter=web build --mode prod
RUN pnpm --filter=web deploy --prod deploy/web

FROM base AS runner
WORKDIR /app
COPY --from=build /app/deploy/web/node_modules ./node_modules
COPY --from=build /app/deploy/web/build ./build
COPY --from=build /app/deploy/web/server.js ./server.js
COPY --from=build /app/deploy/web/package.json ./package.json
CMD ["pnpm", "start"]
