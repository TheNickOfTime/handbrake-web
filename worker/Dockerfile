# Node ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim AS main

# Install external dependencies
RUN apt update && apt install -y handbrake-cli
RUN apt install intel-mediasdk -y

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

# Dumb init
RUN apt install dumb-init -y

# Start application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "run", "prod"]