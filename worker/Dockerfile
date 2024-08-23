# Node ---------------------------------------------------------------------------------------------
FROM node:bookworm-slim AS main

# Configure apt
RUN sed -i -e's/ main/ main contrib non-free non-free-firmware/g' /etc/apt/sources.list.d/debian.sources
RUN sed -i -e's/ bookworm-updates/ bookworm-updates sid/g' /etc/apt/sources.list.d/debian.sources
RUN touch /etc/apt/preferences.d/prferences && \
	echo "Package: *" >> /etc/apt/preferences.d/prferences && \
	echo "Pin: release a=unstable" >> /etc/apt/preferences.d/prferences && \
	echo "Pin-Priority: 450" >> /etc/apt/preferences.d/prferences
RUN apt update

# Install mesa drivers
RUN apt install -y mesa-utils mesa-va-drivers mesa-vulkan-drivers vainfo
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

# Start application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "run", "prod"]