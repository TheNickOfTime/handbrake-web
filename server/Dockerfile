# Build client -------------------------------------------------------------------------------------
FROM node:22-alpine AS client-build
COPY client /handbrake-web/client
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/client

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --force
RUN pnpm build

# Main ---------------------------------------------------------------------------------------------
FROM node:22-alpine AS main

COPY --from=client-build /handbrake-web/client/build /handbrake-web/client
COPY server /handbrake-web/server
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/server

# Install node dependencies
ENV NODE_ENV=production
RUN npm install -g pnpm
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