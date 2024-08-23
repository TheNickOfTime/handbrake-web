# Node ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim AS main

# Install external dependencies
RUN sed -i "s/Components: main/Components: main non-free non-free-firmware/" /etc/apt/sources.list.d/debian.sources && apt update
RUN apt install -y libmfx1 libigfxcmrt7 libva-drm2 libva-x11-2 intel-media-va-driver-non-free
RUN apt install -y handbrake-cli
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