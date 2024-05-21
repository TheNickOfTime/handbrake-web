# Build applications -------------------------------------------------------------------------------
FROM node:bookworm-slim as build

COPY / /handbrake-web
WORKDIR /handbrake-web

RUN npm install
RUN npm run build-client
RUN npm run build-server
RUN npm run build-worker

# Node ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim as main

# Install external dependencies
RUN apt update && apt install -y handbrake-cli

# Copy project folder
COPY --from=build /handbrake-web/build /handbrake-web/package.json /handbrake-web/package-lock.json /handbrake-web/start.sh /handbrake-web/
WORKDIR /handbrake-web

# Install node dependencies
ENV NODE_ENV=production
RUN npm install

# Default environment variables & ports
EXPOSE 9999
ENV HANDBRAKE_MODE=server
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# Start application
CMD ./start.sh