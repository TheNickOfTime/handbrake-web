> [!WARNING]
> Hardware Accelerated encoding is supported by HandBrake itself, but not recommended for use by HandBrake Web. **_Using hardware encoding will generally result in larger files with worse quality_** at the same settings as CPU Transcoding, with the advantage of transcoding (sometimes significantly) faster. **_If your goals are to produce the highest quality output files at the smallest file sizes, stick to CPU encoding_**.

HandBrake has support for 5 different hardware encoders. HandBrake Web (due to it's Linux base) is theoretically compatible with Intel, Nvidia, and AMD hardware:

- [Intel Quick Sync Video](https://handbrake.fr/docs/en/latest/technical/video-qsv.html)
- [Nvidia NVENC](https://handbrake.fr/docs/en/latest/technical/video-nvenc.html)
- [AMD VCN](https://handbrake.fr/docs/en/latest/technical/video-vcn.html)

As of right now, **only Intel QSV and Nvidia NVENC are supported**. **_Support for AMD VCN is planned, but not yet implemented_**.

Additionally, it should be noted that the following instructions are for setting up on a bare-metal installation Linux host. Alternative installation methods such as using a VM hypervisor, or something like Windows Subsystem for Linux (WSL/WSL2) should work, but the steps will likely differ or have additional requirements (please feel free to contribute to the docs!!!).

## Intel (QSV)

Intel QSV is available for hardware encoding support on supported platforms.

In order to get Intel QSV working, multiple additional steps must be taken on the host machine, as well as the container's configuration.

### Host Machine

In order for QSV support to be available within the container, your host machine must be properly configured with the [Intel Media Driver](https://github.com/intel/media-driver).

The process of installing this driver will vary by platform, though it is most likely that you will be able to do so via your distribution's package manager.

> [!IMPORTANT]
> If your distribution has a distinct/diffrentiated "non-free" version of the _Intel Media Driver_, please be sure to install the "non-free" version (supports hardware decoding and encoding) over the "free" version (only supports decoding).

You will want to verify that your OS is detecting your GPU - run `ls /dev/dri`. The output should include devices like `card0` and `renderD128` - though the numbers might be slightly different depending on your hardware configuration.

### Container Configuration

Once your Intel GPU is detected by your operating system, you will need to pass your GPU through into the container. Add the following line to your Docker Compose configuration file:

```yaml
services:
  handbrake-worker:
    # ...
    devices:
      - /dev/dri:/dev/dri
```

Additionally, you will often need to ensure your container has adequate `video` group permissions. The easiest way to do this is to get the id number of your `video` group with `getent group video` (mine was 44, yours could be different) and add the following to your Docker Compose configuration file:

```yaml
services:
  handbrake-worker:
    # ...
  group_add:
    - 44
```

### Preset Configutation

The HandBrake [docs](https://handbrake.fr/docs/en/latest/technical/video-qsv.html) and the Intel Media Driver [readme](https://github.com/intel/media-driver#known-issues-and-limitations) indicate that certain GPUs will have issues encoding with QSV due to "low power mode" unless "HuC firmware" has been configured. I haven't figured out the HuC firmware stuff yet ([related issue](https://github.com/TheNickOfTime/handbrake-web/issues/513)), so if your QSV encodes are failing without clear cause, you can do **one** of the following:

- Add `lowpower=0` to your preset's "Advanced Options" on the "video" tab within HandBrake's GUI.
- Add `"VideoOptionExtra": "lowpower=0",` to the alphabetically appropriate location within your preset's `.json` file.

## Nvidia (NVENC)

### Host Machine

In order for NVENC support to be available within the container, your host machine must be properly configured with the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html). To do this you must:

1. Install the NVIDIA CUDA driver ([guide](https://docs.nvidia.com/datacenter/tesla/driver-installation-guide/))
2. Install the NVIDIA Container Toolkit ([guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/))

This allows your NVIDIA GPU's resources to be accessible within Docker containers.

### Container Configuration

You will need to add the following to your Docker Compose configuration for any worker that has NVIDIA hardware capabilities:

```yaml
services:
  # ...
  handbrake-worker:
    # ...
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities:
                - gpu
                - compute
                - video
```
