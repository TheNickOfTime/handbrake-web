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
	libmfx-dev \
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

RUN apt-get install -y \
	i965-va-driver \
	intel-media-va-driver-non-free

# Prepare rootfs for final image
RUN mkdir /finalfs
WORKDIR /finalfs

# Copy HandBrake to rootfs
RUN mkdir -p /finalfs/usr/local/bin && \
	cp /handbrake/build/HandBrakeCLI /finalfs/usr/local/bin/HandBrakeCLI
RUN mkdir -p /finalfs/var/lib/handbrake && \
	cp /handbrake/preset/preset_builtin.json /finalfs/var/lib/handbrake/preset_builtin.json

# Copy HandBrake's dependencies to rootfs
RUN ldd /handbrake/build/HandBrakeCLI | \
	grep -oP '(?<=\s=>\s)(.+)(?=\s\()' | \
	xargs -I {} cp -LR --parents {} /finalfs/usr

# Copy Intel QSV dependencies to rootfs
RUN for DEP in libigdgmm12 libmfx1 libmfx-gen1.2 libvpl2 i965-va-driver intel-media-va-driver-non-free; do \
	dpkg -L $DEP | \
	grep -oP '\/usr\/lib\/x86_64-linux-gnu.+\.so.*' | \
	xargs -I {} cp -P --parents {} /finalfs \
; \
done


# Final image --------------------------------------------------------------------------------------
FROM gcr.io/distroless/base-debian12 AS main

COPY --from=handbrake-build /finalfs/ /

# Set the entrypoint to HandBrakeCLI so HandBrake can be run if desired
ENTRYPOINT [ "/usr/local/bin/HandBrakeCLI" ]

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