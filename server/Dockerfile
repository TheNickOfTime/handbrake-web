ARG DISTROLESS_VARIANT=debug-nonroot

# Build client -------------------------------------------------------------------------------------
FROM node:bookworm-slim AS client-build
COPY client /handbrake-web/client
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web
WORKDIR /handbrake-web/client

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

# Main ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim AS server-build

COPY server /handbrake-web/server
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web
WORKDIR /handbrake-web/server

# Install node dependencies
ENV NODE_ENV=production
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

# Create directories
RUN mkdir /data && mkdir /video

# Final image --------------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs24-debian12:${DISTROLESS_VARIANT} AS main

COPY --from=client-build /handbrake-web/client/build /handbrake-web/client
COPY --from=server-build /handbrake-web/server/build /handbrake-web/server
COPY --from=server-build --chown=nonroot /video /data /

# Default environment variables & ports
EXPOSE 9999
ENV HANDBRAKE_MODE=server
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# Start application
WORKDIR /handbrake-web/server
CMD ["/handbrake-web/server/server.js"]