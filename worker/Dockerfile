ARG DISTROLESS_VARIANT=debug-nonroot
ARG HANDBRAKE_BUILD_TAG=latest

# HandBrake Build ----------------------------------------------------------------------------------
FROM ghcr.io/thenickoftime/handbrake-build:${HANDBRAKE_BUILD_TAG} AS handbrake-build

# Build Worker -------------------------------------------------------------------------------------
FROM node:24-trixie-slim AS worker-build

# Copy project dependencies
COPY worker /handbrake-web/worker
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/worker

# Install node dependencies
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

# Node ---------------------------------------------------------------------------------------------
FROM gcr.io/distroless/cc-debian13:${DISTROLESS_VARIANT} AS main

ARG TARGETARCH

# Copy nodejs binary from the build step
COPY --from=worker-build /usr/local/bin/node /usr/local/bin/node

# Copy compiled HandBrakeCLI binary from the build step
COPY --from=handbrake-build /rootfs/base/ /
COPY --from=handbrake-build /rootfs/extra/ /

# Copy project from build
COPY --from=worker-build /handbrake-web/worker/build /handbrake-web/worker

# Default environment variables
ENV HANDBRAKE_MODE=worker
ENV DATA_PATH=/tmp/handbrake-web
ENV VIDEO_PATH=/video

# Start application
WORKDIR /handbrake-web/worker
ENTRYPOINT [ "/usr/local/bin/node" ]
CMD ["/handbrake-web/worker/worker.js"]