# SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
#
# SPDX-License-Identifier: GPL-3.0-or-later

# 1.3.13-alpine
FROM oven/bun@sha256:4de475389889577f346c636f956b42a5c31501b654664e9ae5726f94d7bb5349 as builder

WORKDIR /app

COPY . .

RUN bun install -p

RUN bunx --bun drizzle-kit generate

# Make tables strict for type checking.
RUN find drizzle/ -name "*.sql" -exec sed -i "s/^);$/) STRICT;/" {} +

# 1.3.13-alpine
FROM oven/bun@sha256:4de475389889577f346c636f956b42a5c31501b654664e9ae5726f94d7bb5349 as dev

WORKDIR /app

COPY --from=builder /app/drizzle /app/drizzle
COPY --from=builder /app/node_modules /app/node_modules

COPY . .

EXPOSE 3000

CMD ["bun", "--watch", "run", "server/main.ts"]

# 1.3.13-distroless
FROM oven/bun@sha256:fc372e3e810dff25356602172cc97423c6991a15bca22d191abc500d3f1a9eb8 as prod

WORKDIR /app

USER 1000

COPY --from=builder --chown=1000:1000 /app/drizzle /app/drizzle
COPY --from=builder --chown=1000:1000 /app/node_modules /app/node_modules

COPY --chown=1000:1000 assets /app/assets
COPY --chown=1000:1000 client /app/client
COPY --chown=1000:1000 server /app/server

EXPOSE 3000

CMD ["run", "server/main.ts"]
