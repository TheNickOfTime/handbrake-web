FROM mcr.microsoft.com/vscode/devcontainers/base:bookworm

# Install dev dependencies
RUN apt update
RUN apt install -y git nodejs npm

# Install handbrake build dependencies
RUN apt install -y autoconf automake build-essential cmake libass-dev libbz2-dev libfontconfig-dev libfreetype6-dev libfribidi-dev libharfbuzz-dev libjansson-dev liblzma-dev libmp3lame-dev libnuma-dev libogg-dev libopus-dev libsamplerate0-dev libspeex-dev libtheora-dev libtool libtool-bin libturbojpeg0-dev libvorbis-dev libx264-dev libxml2-dev libvpx-dev m4 make meson nasm ninja-build patch python3 pkg-config tar zlib1g-dev

# Build and install HandbrakeCLI to /usr/local/bin/HandBrakeCLI, then link to /bin/handbrake
RUN mkdir /handbrake
WORKDIR /handbrake
RUN git clone https://github.com/HandBrake/HandBrake.git .
RUN ./configure --launch-jobs=$(nproc) --launch --disable-gtk --disable-qsv --disable-nvenc
RUN make --directory=build install
RUN ln -s /usr/local/bin/HandBrakeCLI /bin/handbrake

# Remove handbrake folder
WORKDIR /
RUN rm -r /handbrake