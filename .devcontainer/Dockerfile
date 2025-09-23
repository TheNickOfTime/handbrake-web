# HandBrake Build ----------------------------------------------------------------------------------
FROM ghcr.io/thenickoftime/handbrake-build:latest AS handbrake-build

# Configure Dev Container Image --------------------------------------------------------------------
FROM mcr.microsoft.com/vscode/devcontainers/base:bookworm as main

# Install dev dependencies
RUN apt-get update
RUN apt-get install -y sqlite3

# Copy compiled HandBrakeCLI binary from the build stage
COPY --from=handbrake-build /handbrake/HandBrakeCLI /usr/local/bin

# Copy HandBrakeCLI's dependencies from the build stage
COPY --from=handbrake-build /handbrake/lib/* /lib

ENV NODE_ENV=development