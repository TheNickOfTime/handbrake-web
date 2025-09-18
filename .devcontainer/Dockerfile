# Build HandBrake ----------------------------------------------------------------------------------
FROM debian:bookworm-slim as build

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

# Configure Dev Container Image --------------------------------------------------------------------
FROM mcr.microsoft.com/vscode/devcontainers/base:bookworm as main

# Install dev dependencies
RUN apt-get update
RUN apt-get install -y sqlite3

# Copy compiled HandBrakeCLI binary from the build stage
COPY --from=build /handbrake/build/HandBrakeCLI /usr/local/bin

# Copy HandBrakeCLI's dependencies from the build stage
COPY --from=build /handbrake/lib/* /lib

ENV NODE_ENV=development