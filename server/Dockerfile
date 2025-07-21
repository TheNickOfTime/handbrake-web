# Build client -------------------------------------------------------------------------------------
FROM node:alpine AS client-build
COPY client /handbrake-web/client
COPY shared /handbrake-web/shared
WORKDIR /handbrake-web/client

RUN pnpm install --frozen-lockfile --force
RUN pnpm build

# Main ---------------------------------------------------------------------------------------------
FROM node:alpine3.20 AS main

COPY --from=client-build /handbrake-web/client/build /handbrake-web/client
COPY server /handbrake-web/server
COPY shared /handbrake-web/shared
WORKDIR /handbrake-web/server

# Install node dependencies
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --force

# Create directories
RUN mkdir /data && chown node /data && mkdir /video && chown node /data

# Default environment variables & ports
EXPOSE 9999
ENV HANDBRAKE_MODE=server
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# Dumb-init
RUN apk add dumb-init

# Start application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["pnpm", "prod"]