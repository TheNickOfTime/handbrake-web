FROM mcr.microsoft.com/vscode/devcontainers/base:bookworm

# Install dev dependencies
RUN apt update
RUN apt install -y git nodejs npm sqlite3
RUN apt install -y handbrake-cli

ENV NODE_ENV=development