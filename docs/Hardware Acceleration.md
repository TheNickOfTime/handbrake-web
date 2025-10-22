> [!WARNING]
> Hardware Accelerated encoding is supported by HandBrake itself, but not recommended for use by HandBrake Web. **_Using hardware encoding will generally result in larger files with worse quality_** at the same settings as CPU Transcoding, with the advantage of transcoding (sometimes significantly) faster. **_If your goals are to produce the highest quality output files at the smallest file sizes, stick to CPU encoding_**.

HandBrake has support for 5 different hardware encoders. HandBrake Web (due to it's Linux base) is theoretically compatible with Intel, Nvidia, and AMD hardware:

- [Intel Quick Sync Video](https://handbrake.fr/docs/en/latest/technical/video-qsv.html)
- [Nvidia NVENC](https://handbrake.fr/docs/en/latest/technical/video-nvenc.html)
- [AMD VCN](https://handbrake.fr/docs/en/latest/technical/video-vcn.html)

As of right now, **only Intel QSV and Nvidia NVENC are supported**. **_Support for AMD VCN is planned, but not yet implemented_**.

## Intel (QSV)

Intel QSV is available for hardware encoding support on supported platforms.

> [!NOTE]
> At the time of writing, the HandBrake [docs](https://handbrake.fr/docs/en/latest/technical/video-qsv.html) confusingly state "_Intel Skylake (9th Generation) CPU or later_" as the minimum GPU generation requirement for iGPUs (I have opened [an issue](https://github.com/HandBrake/HandBrake-docs/issues/243) and [a pull request](https://github.com/HandBrake/HandBrake-docs/pull/244) to hopefully address this). **Intel Skylake** is _6th Generation Core_, and **Intel Coffee Lake** is _9th Generation Core_ - so something is off here. For now, I think it is best to assume that "_Intel Skylake (9th Generation) CPU or later_" is the intent.

> [!NOTE]
> The HandBrake [docs](https://handbrake.fr/docs/en/latest/technical/video-qsv.html) also state "_Please note, these are not hard limits. Hardware encoding via Intel QSV might work on older series GPUs and older operating systems, but this is not officially supported._" - so generations older than Coffee Lake may work but there is no guarantee.

In order to get Intel QSV working, multiple additional steps must be taken on the host machine, as well as the container's configuration.

### Host Machine

In order for QSV support to be available within the container, your host machine must be properly configured with the [Intel Media Driver](https://github.com/intel/media-driver).

#### Linux

The process of installing this driver will vary by platform, though it is most likely that you will be able to do so via your distribution's package manager.

> [!IMPORTANT]
> If your distribution has a distinct/diffrentiated "non-free" version of the _Intel Media Driver_, please be sure to install the "non-free" version (supports hardware decoding and encoding) over the "free" version (only supports decoding).

You will want to verify that your OS is detecting your GPU - run `ls /dev/dri`. The output should include devices like `card0` and `renderD128` - though the numbers might be slightly different depending on your hardware configuration.

#### Windows

\*\*NEEDS DOCUMENTATION

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
