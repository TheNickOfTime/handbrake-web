# Build applications -------------------------------------------------------------------------------
# FROM node:alpine AS build

# COPY worker /handbrake-web/worker
# COPY types /handbrake-web/types
# WORKDIR /handbrake-web/worker

# RUN npm install
# RUN npm run build

# Node ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim AS main

# Install external dependencies
RUN apt update && apt install -y handbrake-cli

# Copy project folder
# COPY --from=build handbrake-web/worker/build /handbrake-web
# COPY --from=build \
# 	handbrake-web/worker/package.json \
# 	handbrake-web/worker/package-lock.json \
# 	handbrake-web/worker/start.sh \
# 	handbrake-web/worker/tsconfig.json \
# 	/handbrake-web
# WORKDIR /handbrake-web

COPY worker /handbrake-web/worker
COPY types /handbrake-web/types
WORKDIR /handbrake-web/worker

# Install node dependencies
ENV NODE_ENV=production
RUN npm install

# Default environment variables
ENV HANDBRAKE_MODE=worker
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# ENTRYPOINT bash

# Start application
CMD npm run prod