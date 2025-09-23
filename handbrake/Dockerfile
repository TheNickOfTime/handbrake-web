# Build HandBrake ----------------------------------------------------------------------------------
FROM debian:bookworm-slim AS handbrake-build

# renovate: datasource=github-releases depName=HandBrake packageName=HandBrake/HandBrake
ARG HANDBRAKE_VERSION=1.10.2

ARG HARDWARE_ACCELERATION=none

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

# Install hardware acceleration libraries
RUN case "${HARDWARE_ACCELERATION}" in \
		"intel") \
			apt-get install -y \
				libva-dev \
				libdrm-dev \
		;;\
		"nvidia") \
			sed -i -e's/ main/ main contrib non-free non-free-firmware/g' /etc/apt/sources.list.d/debian.sources && \
			apt-get update && \
			apt-get install -y \
				clang \
				llvm \
				nvidia-cuda-dev \
				nvidia-cuda-toolkit \
		;;\
	esac

# Clone the HandBrake git repo, checkout the latest tag, and then build handbrake
RUN mkdir /handbrake
WORKDIR /handbrake
RUN git clone https://github.com/HandBrake/HandBrake.git . && \
	git switch --detach ${HANDBRAKE_VERSION}

RUN case "${HARDWARE_ACCELERATION}" in \
		# No hardware acceleration platforms
		"none") \
			./configure --launch \
			--launch-jobs=$(nproc) \
			--disable-gtk \
			# --enable-libdovi \
		;; \
		"intel") \
			./configure --launch \
			--launch-jobs=$(nproc) \
			--disable-gtk \
			--enable-qsv \
			# --enable-libdovi \
		;; \
		"nvidia") \
			./configure --launch \
			--launch-jobs=$(nproc) \
			--disable-gtk \
			--enable-nvenc \
			--enable-nvdec \
			# --enable-libdovi \
		;;\
	esac

# Make a tarball of HandBrake's dependency libraries for copying later
RUN ldd /handbrake/build/HandBrakeCLI | \
	grep -oP '(?<=\s=>\s)(.+)(?=\s\()' | \
	xargs tar -hcvf dependencies.tar && \
	mkdir lib && \
	tar -xvf dependencies.tar -C lib

# Final image --------------------------------------------------------------------------------------
FROM gcr.io/distroless/base-debian12 AS main

COPY --from=handbrake-build /handbrake/build/HandBrakeCLI /usr/local/bin/HandBrakeCLI
COPY --from=handbrake-build /handbrake/lib/* /lib

ENTRYPOINT [ "/usr/local/bin/HandBrakeCLI" ]