# Build HandBrake ----------------------------------------------------------------------------------
FROM debian:bookworm-slim AS handbrake-build

# renovate: datasource=github-releases depName=HandBrake packageName=HandBrake/HandBrake
ARG HANDBRAKE_VERSION=1.6.1

# Configure APT
RUN sed -i -e's/ main/ main contrib non-free non-free-firmware/g' \/etc/apt/sources.list.d/debian.sources
RUN apt-get update

# Install base dependencies
RUN apt-get install -y \
	curl \
	git \
	tar

# Install HandBrake dependencies
RUN apt-get install -y \
	autoconf \
	automake \
	build-essential \
	clang \
	cmake \
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
	libssl-dev \
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
	zlib1g-dev

# Install Intel QSV dependencies
RUN apt-get install -y \
	libva-dev \
	libdrm-dev \
	libvpl-dev \
	libmfx-gen-dev \
	libigdgmm-dev

# Install Nvidia NVENC/NVDEC dependencies
RUN apt-get install -y \
	llvm \
	nvidia-cuda-dev \
	nvidia-cuda-toolkit

# Clone the HandBrake git repo, checkout the specified version
RUN mkdir /handbrake
WORKDIR /handbrake
RUN git clone https://github.com/HandBrake/HandBrake.git . && \
	git switch --detach ${HANDBRAKE_VERSION}

# Build HandBrake
RUN ./configure --launch \
	--launch-jobs=$(nproc) \
	--disable-gtk \
	--enable-qsv \
	--enable-nvenc \
	--enable-nvdec \
	--enable-vce
	# --enable-libdovi

# Make a tarball of HandBrake's dependency libraries for copying later
RUN ldd /handbrake/build/HandBrakeCLI | \
	grep -oP '(?<=\s=>\s)(.+)(?=\s\()' | \
	xargs tar -hcvf dependencies.tar && \
	mkdir lib && \
	tar -xvf dependencies.tar -C lib

# Final image --------------------------------------------------------------------------------------
FROM debian:bookworm-slim AS main

RUN sed -i -e's/ main/ main contrib non-free non-free-firmware/g' \/etc/apt/sources.list.d/debian.sources
RUN apt-get update

## Install HandBrakeCLI depedencies
RUN apt-get install -y --no-install-recommends \
	libass9 \
	libjansson4 \
	libmp3lame0 \
	libnuma1 \
	libogg0 \
	libopus0 \
	libspeex1 \
	libtheora0 \
	libturbojpeg0 \
	libvorbis0a \
	libvorbisenc2 \
	libvpx7 \
	libx264-164 \
	libx265-199 \
	libxml2


## Install Intel QSV dependencies
RUN apt-get install -y \
	libigdgmm12 \
	libmfx1 \
	libmfx-gen1.2 \
	libva-drm2 \
	libva2 \
	libvpl2 

## Install Intel Driver realted stuff
RUN apt-get install -y \
	i965-va-driver \
	intel-media-va-driver-non-free

COPY --from=handbrake-build /handbrake/build/HandBrakeCLI /usr/local/bin/HandBrakeCLI
COPY --from=handbrake-build /handbrake/preset/preset_builtin.json /handbrake/preset_builtin.json
# COPY --from=handbrake-build /handbrake/lib /handbrake/lib

# Copy HandBrake's libraries to /lib so this container can run HandBrake if desired
# COPY --from=handbrake-build /handbrake/lib/* /lib

# Set the entrypoint to HandBrakeCLI so HandBrake can be run if desired
# ENTRYPOINT [ "/handbrake/HandBrakeCLI" ]