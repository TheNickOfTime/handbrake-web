# Node ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim AS main

# Install external dependencies
RUN sed -i "s/Components: main/Components: main contrib non-free non-free-firmware/" /etc/apt/sources.list.d/debian.sources && apt update
# Install mesa drivers
RUN apt install -y mesa-utils mesa-va-drivers mesa-vulkan-drivers
# Install intel media divers
RUN apt install -t unstable -y intel-media-va-driver-non-free
# Install handbrake
RUN apt install -y handbrake-cli
# Install dumb-init
RUN apt install -y dumb-init

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

# Start application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "run", "prod"]