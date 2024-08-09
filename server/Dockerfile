# Build client -------------------------------------------------------------------------------------
FROM node:alpine AS client-build
COPY client /handbrake-web/client
COPY shared /handbrake-web/shared
WORKDIR /handbrake-web/client

RUN npm install
RUN npm run build

# Main ---------------------------------------------------------------------------------------------
FROM node:alpine AS main

COPY --from=client-build /handbrake-web/client/build /handbrake-web/client
COPY server /handbrake-web/server
COPY shared /handbrake-web/shared
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