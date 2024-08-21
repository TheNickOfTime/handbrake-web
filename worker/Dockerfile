# Node ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim AS main

# Install external dependencies
RUN apt update && apt install -y handbrake-cli

COPY worker /handbrake-web/worker
COPY shared /handbrake-web/shared
WORKDIR /handbrake-web/worker

# Install node dependencies
ENV NODE_ENV=production
RUN npm install

# Default environment variables
ENV HANDBRAKE_MODE=worker
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# Start application
ENTRYPOINT /user/local/bin/node
CMD exec npm run prod