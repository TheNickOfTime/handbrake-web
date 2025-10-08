> [!WARNING]
> Hardware Accelerated encoding is supported by HandBrake itself, but not recommended for use by HandBrake Web. **_Using hardware encoding will generally result in larger files with worse quality_** at the same settings as CPU Transcoding, with the advantage of transcoding (sometimes significantly) faster. **_If your goals are to produce the highest quality output files at the smallest file sizes, stick to CPU encoding_**.

HandBrake has support for 5 different hardware encoders. HandBrake Web (due to it's Linux base) is theoretically compatible with Intel, Nvidia, and AMD hardware:

- [Intel Quick Sync Video](https://handbrake.fr/docs/en/latest/technical/video-qsv.html)
- [Nvidia NVENC](https://handbrake.fr/docs/en/latest/technical/video-nvenc.html)
- [AMD VCN](https://handbrake.fr/docs/en/latest/technical/video-vcn.html)

As of right now, **only Intel QSV and Nvidia NVENC are supported**. **_Support for AMD VCN is planned, but not yet implemented_**.

## Intel (QSV)

## Nvidia (NVENC)
