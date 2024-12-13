FROM node:18 AS base

FROM base AS builder
    WORKDIR /app
    RUN npm install -g turbo

    COPY . .

    RUN turbo prune @legodb/old-web --docker

FROM base AS installer
    WORKDIR /app

    RUN npm install -g pnpm
    RUN npm install -g turbo

    COPY .gitignore .gitignore
    COPY --from=builder /app/out/json/ .
    COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
    RUN pnpm i --frozen-lockfile

    COPY --from=builder /app/out/full/ .
    COPY turbo.json turbo.json

    RUN turbo run db:generate
    RUN pnpm rebuild -r
    RUN turbo run build --filter=@legodb/old-web...

FROM base AS runner
    WORKDIR /app

    RUN npm install -g pnpm
    RUN addgroup --system --gid 1001 nodejs
    RUN adduser --system --uid 1001 app

    USER app
    COPY --from=installer /app .

    CMD pnpm --filter @legodb/old-web run start