# Build client -------------------------------------------------------------------------------------
FROM node:alpine AS client-build
COPY client /handbrake-web/client
COPY types /handbrake-web/types
WORKDIR /handbrake-web/client

RUN npm install
RUN npm run build

# Build server -------------------------------------------------------------------------------------
# FROM node:alpine AS server-build
# COPY /server /handbrake-web/server
# COPY /types /handbrake-web/types
# WORKDIR /handbrake-web/server

# RUN npm install
# RUN npm run build

# Main ---------------------------------------------------------------------------------------------
FROM node:alpine AS main

# Copy project folder
# COPY --from=client-build /handbrake-web/client/build /handbrake-web/client
# COPY --from=server-build /handbrake-web/server/build /handbrake-web/server/package.json /handbrake-web/server/package-lock.json /handbrake-web
# WORKDIR /handbrake-web

COPY --from=client-build /handbrake-web/client/build /handbrake-web/client
COPY server /handbrake-web/server
COPY types /handbrake-web/types
WORKDIR /handbrake-web/server

# Install node dependencies
ENV NODE_ENV=production
RUN npm install

# Default environment variables & ports
EXPOSE 9999
ENV HANDBRAKE_MODE=server
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# Start application
CMD npm run prod