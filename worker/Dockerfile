# Build HandBrake ----------------------------------------------------------------------------------
FROM alpine:latest AS build

# Install general dependencies
RUN apk add grep musl-utils tar

# Install HandBrake build dependencies
RUN apk add autoconf automake busybox cmake g++ git jansson-dev lame-dev libass-dev libjpeg-turbo-dev libtheora-dev libtool libvorbis-dev libvpx-dev libxml2-dev m4 make meson nasm ninja numactl-dev opus-dev patch pkgconf python3 speex-dev tar x264-dev

# Install hardware acceleration dependencies
RUN apk add libva-dev libdrm-dev

# Clone the HandBrake git repo, checkout the latest tag, and then build handbrake
RUN mkdir /handbrake
WORKDIR /handbrake
RUN git clone https://github.com/HandBrake/HandBrake.git . && \
	git fetch --tags && \
	export latest=$(git describe --tags `git rev-list --tags --max-count=1`) && \
	git switch --detach $latest
RUN ./configure --launch \
	--launch-jobs=$(nproc) \
	--disable-gtk \
	--enable-qsv
	# --enable-nvenc \
	# --enable-nvdec \
	# --enable-vce \
	# --enable-libdovi

# Make a tarball of HandBrake's dependency libraries for copying later
RUN ldd /handbrake/build/HandBrakeCLI | \
	grep -oP '(?<=\s=>\s)(.+)(?=\s\()' | \
	xargs tar -hcvf dependencies.tar && \
	mkdir lib && \
	tar -xvf dependencies.tar -C lib

# Node ---------------------------------------------------------------------------------------------
FROM node:alpine AS main

ARG TARGETARCH

# Install mesa and intel media drivers
# RUN if [ $TARGETARCH = "amd64" ]; then \
# 	apk add \
# 	mesa-dri-gallium \
# 	mesa-va-gallium \
# 	intel-media-driver \
# ; fi

# Install handbrake dependencies 
# RUN apk add \
# 	make \
# 	numactl \
# 	libass \
# 	libbz2 \
# 	libvpx \
# 	speex \
# 	lame-libs \
# 	opus \
# 	libtheora \
# 	libvorbis \
# 	x264-libs \
# 	jansson \
# 	libturbojpeg
 
# Install dumb-init
RUN apk add dumb-init

# Copy compiled HandBrakeCLI binary from the build step
COPY --from=build /handbrake/build/HandBrakeCLI /usr/local/bin

# Copy HandBrakeCLI's dependencies from the build stage
COPY --from=build /handbrake/lib/* /usr

# Copy project dependencies
COPY worker /handbrake-web/worker
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/worker

# Install node dependencies
ENV NODE_ENV=production
RUN npm install -g pnpm
RUN pnpm install

# Create directories
RUN mkdir /data && chown node /data && mkdir /video && chown node /data

# Default environment variables
ENV HANDBRAKE_MODE=worker
ENV DATA_PATH=/data
ENV VIDEO_PATH=/video

# # Start application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["pnpm", "prod"]