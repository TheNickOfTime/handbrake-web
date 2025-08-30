# Build HandBrake
FROM alpine:latest AS build

# Install depenencies (general, intel qsv)
RUN apk add autoconf automake busybox cmake g++ git jansson-dev lame-dev libass-dev libjpeg-turbo-dev libtheora-dev libtool libvorbis-dev libvpx-dev libxml2-dev m4 make meson nasm ninja numactl-dev opus-dev patch pkgconf python3 speex-dev tar x264-dev
RUN apk add libva-dev libdrm-dev

# Clone the HandBrake git repo, checkout the latest tag, and then build handbrake
RUN mkdir /handbrake
WORKDIR /handbrake
RUN git clone https://github.com/HandBrake/HandBrake.git . && \
	git fetch --tags && \
	export latest=$(git describe --tags `git rev-list --tags --max-count=1`) && \
	git switch --detach $latest
RUN ./configure --launch \
	--disable-gtk \
	--enable-qsv \
	# --enable-nvenc \
	# --enable-nvdec \
	# --enable-vce \
	--enable-libdovi


# Node ---------------------------------------------------------------------------------------------
# FROM node:bookworm-slim AS main

# ARG TARGETARCH

# # Configure apt (referenced from the immich project at 'https://github.com/immich-app/base-images/tree/main')
# RUN sed -i -e's/ main/ main contrib non-free non-free-firmware/g' /etc/apt/sources.list.d/debian.sources
# # RUN sed -i -e's/ bookworm-updates/ bookworm-updates sid/g' /etc/apt/sources.list.d/debian.sources
# # RUN touch /etc/apt/preferences.d/prferences && \
# # 	echo "Package: *" >> /etc/apt/preferences.d/prferences && \
# # 	echo "Pin: release a=unstable" >> /etc/apt/preferences.d/prferences && \
# # 	echo "Pin-Priority: 450" >> /etc/apt/preferences.d/prferences
# RUN apt update

# # Install mesa and intel media drivers
# RUN if [ $TARGETARCH = "amd64" ]; then \
# 	apt install -y mesa-utils mesa-va-drivers mesa-vulkan-drivers intel-media-va-driver-non-free vainfo \
# 	; fi
# # Install handbrake
# RUN apt install -y handbrake-cli
# # Install dumb-init
# RUN apt install -y dumb-init

# COPY worker /handbrake-web/worker
# COPY shared /handbrake-web/shared
# COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web
# WORKDIR /handbrake-web/worker

# # Install node dependencies
# ENV NODE_ENV=production
# RUN npm install -g pnpm
# RUN pnpm install

# # Create directories
# RUN mkdir /data && chown node /data && mkdir /video && chown node /data

# # Default environment variables
# ENV HANDBRAKE_MODE=worker
# ENV DATA_PATH=/data
# ENV VIDEO_PATH=/video

# # Start application
# ENTRYPOINT ["/usr/bin/dumb-init", "--"]
# CMD ["pnpm", "prod"]