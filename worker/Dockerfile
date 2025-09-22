ARG DISTROLESS_VARIANT=debug-nonroot

# Build HandBrake ----------------------------------------------------------------------------------
FROM debian:bookworm-slim AS handbrake-build

# Install HandBrake dependencies
RUN apt-get update
RUN apt-get install -y \
	autoconf \
	automake \
	build-essential \
	cmake \
	git \
	libass-dev \
	libbz2-dev \
	libfontconfig-dev \
	libfreetype6-dev \
	libfribidi-dev \
	libharfbuzz-dev \
	libjansson-dev \
	liblzma-dev \
	libmp3lame-dev \
	libnuma-dev \
	libogg-dev \
	libopus-dev \
	libsamplerate0-dev \
	libspeex-dev \
	libtheora-dev \
	libtool \
	libtool-bin \
	libturbojpeg0-dev \
	libvorbis-dev \
	libx264-dev \
	libxml2-dev \
	libvpx-dev \
	m4 \
	make \
	meson \
	nasm \
	ninja-build \
	patch \
	python3 \
	pkg-config \
	tar \
	zlib1g-dev

# Clone the HandBrake git repo, checkout the latest tag, and then build handbrake
RUN mkdir /handbrake
WORKDIR /handbrake
RUN git clone https://github.com/HandBrake/HandBrake.git . && \
	git fetch --tags && \
	export latest=$(git describe --tags `git rev-list --tags --max-count=1`) && \
	git switch --detach $latest
RUN ./configure --launch \
	--launch-jobs=$(nproc) \
	--disable-gtk
	# --enable-qsv \
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

# Build Worker -------------------------------------------------------------------------------------
FROM node:bookworm-slim AS worker-build

# Install nodejs and pnpm
# RUN apk add nodejs pnpm

# Install dumb-init (to copy to the final image)
# RUN apk add dumb-init

# Copy project dependencies
COPY worker /handbrake-web/worker
COPY shared /handbrake-web/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /handbrake-web/
WORKDIR /handbrake-web/worker

# Install node dependencies
ENV NODE_ENV=production
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

# Create directories
RUN mkdir /video

# Node ---------------------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs24-debian12:${DISTROLESS_VARIANT} AS main

ARG TARGETARCH

# Copy compiled HandBrakeCLI binary from the build step
COPY --from=handbrake-build /handbrake/build/HandBrakeCLI /usr/local/bin/HandBrakeCLI

# Copy HandBrakeCLI's dependencies from the build stage
COPY --from=handbrake-build /handbrake/lib/* /lib

# Copy project from build
COPY --from=worker-build /handbrake-web/worker/build /handbrake-web/worker
COPY --from=worker-build --chown=nonroot /video /video

# Default environment variables
ENV HANDBRAKE_MODE=worker
ENV DATA_PATH=/tmp
ENV VIDEO_PATH=/video

# # Start application
WORKDIR /handbrake-web/worker
CMD ["/handbrake-web/worker/worker.js"]