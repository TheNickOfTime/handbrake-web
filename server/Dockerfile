ARG DISTROLESS_VARIANT=debug-nonroot
ARG HANDBRAKE_BUILD_TAG=latest

# HandBrake Build ----------------------------------------------------------------------------------
FROM ghcr.io/thenickoftime/handbrake-build:${HANDBRAKE_BUILD_TAG} AS handbrake-build

# Build client -------------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS client-build
COPY client /handbrake-web/client
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/client

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

# Main ---------------------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS server-build

COPY server /handbrake-web/server
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/server

# Install node dependencies
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

# Create directories
RUN mkdir /data && mkdir /video

# Final image --------------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs24-debian12:${DISTROLESS_VARIANT} AS main

COPY --from=handbrake-build /rootfs/base/var/lib/handbrake/preset_builtin.json /var/lib/handbrake/preset_builtin.json
COPY --from=client-build /handbrake-web/client/build /handbrake-web/client
COPY --from=server-build /handbrake-web/server/build /handbrake-web/server
COPY --from=server-build --chown=nonroot /video /data /

# Default environment variables & ports
EXPOSE 9999
ENV NODE_ENV=production
ENV HANDBRAKE_MODE=server
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# Start application
WORKDIR /handbrake-web/server
CMD ["/handbrake-web/server/server.js"]