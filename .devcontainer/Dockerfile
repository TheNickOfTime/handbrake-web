# HandBrake Build ----------------------------------------------------------------------------------
FROM ghcr.io/thenickoftime/handbrake-build:latest AS handbrake-build

# Configure Dev Container Image --------------------------------------------------------------------
FROM mcr.microsoft.com/vscode/devcontainers/base:trixie as main

# Install dev dependencies
RUN apt-get update
RUN apt-get install -y sqlite3

# Copy compiled HandBrakeCLI binary from the build stage
COPY --from=handbrake-build /rootfs/base /

ENV NODE_ENV=development