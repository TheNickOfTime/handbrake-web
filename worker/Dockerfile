ARG DISTROLESS_VARIANT=debug-nonroot
ARG HANDBRAKE_BUILD_TAG=latest

# HandBrake Build ----------------------------------------------------------------------------------
FROM ghcr.io/thenickoftime/handbrake-build:${HANDBRAKE_BUILD_TAG} AS handbrake-build

# Build Worker -------------------------------------------------------------------------------------
FROM node:bookworm-slim AS worker-build

# Install nodejs and pnpm
# RUN apk add nodejs pnpm

# Install dumb-init (to copy to the final image)
# RUN apk add dumb-init

# Copy project dependencies
COPY worker /handbrake-web/worker
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/worker

# Install node dependencies
ENV NODE_ENV=production
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

# Create directories
RUN mkdir /video

# Node ---------------------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs24-debian12:${DISTROLESS_VARIANT} AS main

ARG TARGETARCH

# Copy compiled HandBrakeCLI binary from the build step
COPY --from=handbrake-build /handbrake/HandBrakeCLI /usr/local/bin/HandBrakeCLI

# Copy HandBrakeCLI's dependencies from the build stage
COPY --from=handbrake-build /handbrake/lib/* /lib

# Copy project from build
COPY --from=worker-build /handbrake-web/worker/build /handbrake-web/worker
COPY --from=worker-build --chown=nonroot /video /video

# Default environment variables
ENV HANDBRAKE_MODE=worker
ENV DATA_PATH=/tmp/handbrake-web
ENV VIDEO_PATH=/video

# # Start application
WORKDIR /handbrake-web/worker
CMD ["/handbrake-web/worker/worker.js"]