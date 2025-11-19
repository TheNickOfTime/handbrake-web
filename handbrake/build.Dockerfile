#### SUMMARY ####
# This Dockerfile builds HandBrakeCLI from it's source (https://github.com/HandBrake/HandBrake) with
# support for all necessary hardware acceleration platforms (Intel, Nvidia, AMD). This image is not
# meant to be run, but instead meant to be copied from by other Dockerfiles. The final image outputs
# HandBrakeCLI and the bare minimum required dependencies for it to run to '/rootfs/base'.
# Additional dependencies (primarily dependencies to make Intel QSV work) are output to
# '/rootfs/extra' for contextual copying.


# Build HandBrake ----------------------------------------------------------------------------------
FROM debian:trixie-slim AS handbrake-build

ARG TARGETARCH

# renovate: datasource=github-releases depName=HandBrake packageName=HandBrake/HandBrake
ARG HANDBRAKE_VERSION=1.10.2

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
RUN if [ $TARGETARCH = "amd64" ]; \
	then \
		apt-get install -y \
			libva-dev \
			libdrm-dev \
			libvpl-dev \
			# libmfx-dev \
			libmfx-gen-dev \
			libigdgmm-dev \
	; fi

# Install Nvidia NVENC/NVDEC dependencies
RUN if [ $TARGETARCH = "amd64" ]; \
	then \
		apt-get install -y \
			llvm \
			nvidia-cuda-dev \
			nvidia-cuda-toolkit \
	; fi

# Install lidovi dependencies
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y && \
	chmod +x "$HOME/.cargo/env" && \
	."$HOME/.cargo/env"
ENV PATH="/root/.cargo/bin:$PATH"
RUN cargo install cargo-c

# Clone the HandBrake git repo, checkout the specified version
RUN mkdir /handbrake
WORKDIR /handbrake
RUN git clone https://github.com/HandBrake/HandBrake.git . && \
	git switch --detach ${HANDBRAKE_VERSION}

# Build HandBrake
RUN if [ $TARGETARCH = "amd64" ]; \
	then \
		./configure --launch \
			--launch-jobs=$(nproc) \
			--disable-gtk \
			--enable-qsv \
			--enable-nvenc \
			--enable-nvdec \
			--enable-vce \
			--enable-libdovi \
	; else \
		./configure --launch \
			--launch-jobs=$(nproc) \
			--disable-gtk \
			--disable-qsv \
			--disable-nvenc \
			--disable-nvdec \
			--disable-vce \
			--enable-libdovi \
	; fi
	

RUN if [ $TARGETARCH = "amd64" ]; \
	then \
		apt-get install -y \
			i965-va-driver \
			intel-media-va-driver-non-free \
	; fi

# Prepare base rootfs for the final image
RUN mkdir -p /rootfs/base

# Copy HandBrake to rootfs
RUN mkdir -p /rootfs/base/usr/local/bin && \
	cp /handbrake/build/HandBrakeCLI /rootfs/base/usr/local/bin/HandBrakeCLI
RUN mkdir -p /rootfs/base/var/lib/handbrake && \
	cp /handbrake/preset/preset_builtin.json /rootfs/base/var/lib/handbrake/preset_builtin.json

# Copy HandBrake's dependencies to rootfs
RUN ldd /handbrake/build/HandBrakeCLI | \
	grep -oP '(?<=\s=>\s)(.+)(?=\s\()' | \
	xargs -I {} cp -LR --parents {} /rootfs/base/usr

# Prepare extra rootfs for the final image
RUN mkdir -p /rootfs/extra

# Copy Intel QSV dependencies to rootfs
RUN if [ $TARGETARCH = "amd64" ]; \
	then \
		for DEP in libigdgmm12 libmfx1 libmfx-gen1.2 libvpl2 i965-va-driver intel-media-va-driver-non-free; do \
			dpkg -L $DEP | \
			grep -oP '\/usr\/lib\/x86_64-linux-gnu.+\.so.*' | \
			xargs -I {} cp -P --parents {} /rootfs/extra \
		; done \
	; fi


# Final image --------------------------------------------------------------------------------------
FROM scratch AS main

COPY --from=handbrake-build /rootfs /rootfs

# Set the entrypoint to HandBrakeCLI so HandBrake can be run if desired
# ENTRYPOINT [ "/usr/local/bin/HandBrakeCLI" ]

# Files Needed For QSV to work for reference later (*** means might not be needed)
# /usr/lib/x86_64-linux-gnu/libigdgmm.so.12
# /usr/lib/x86_64-linux-gnu/libmfx-tracer.so.1 ***
# /usr/lib/x86_64-linux-gnu/libmfx-gen.so
# /usr/lib/x86_64-linux-gnu/libmfxhw64.so.1 ***
# /usr/lib/x86_64-linux-gnu/mfx/* ***
# /usr/lib/x86_64-linux-gnu/libmfx-gen.so.1.2
# /usr/lib/x86_64-linux-gnu/libmfx-gen/enctools.so
# /usr/lib/x86_64-linux-gnu/libvpl.so.2
# /usr/lib/x86_64-linux-gnu/vpl/libvpl_wayland.so ***
# /usr/lib/x86_64-linux-gnu/dri/i965_drv_video.so
# /usr/lib/x86_64-linux-gnu/dri/iHD_drv_video.so