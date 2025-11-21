Due to the way the build process for this project works, it was very easy for me to create a plain containerized wrapper for HandBrakeCLI, so I did. You can access it via `ghcr.io/thenickoftime/handbrake-cli`.

## What does it do?

The `handbrake-cli` image is a fully-featured (it supports all HandBrake features that HandBrake Web supports), but minimally-sized (just 216 MB at the time of writing) method of using HandBrakeCLI directly. This is incredibly advantageous if you don't want to bloat your system installation with HandBrake's countless dependencies. The image's entrypoint is `HandBrakeCLI`, so it automatically runs HandBrake once started.

## How do I use it?

You can use it almost exactly as you would use natively installed HandBrakeCLI - however, there are some complexities that come with it being run via Docker, and needing to pass arguments for things like volume mapping, etc.

##### Basic Example

```bash
docker run --rm ghcr.io/thenickoftime/handbrake-cli:latest --help
```

This command is essentially equivalent to `HandBrakeCLI --help` if it were natively installed. The first part `docker run --rm ghcr.io/thenickoftime/handbrake-cli:latest` are the arguments for running the docker image, and everything after it (just `--help` in this case), are arguments passed to HandBrakeCLI. The container will run the command once, and then remove itself afterwards (`--rm` argument).

##### Realistic Example

```bash
docker run --rm --user 1000:1000 -v ./video:/video ghcr.io/thenickoftime/handbrake-cli:latest -i /video/Input/video.mov -o /video/Output/video.mkv -Z "H.265 MKV 480p30"

```

This command:

- Runs the container as user `1000:1000`.
- Maps the relative directory `./video` to `/video` inside the container.
- Runs HandBrakeCLI with:
  - `/video/Input/video.mov` specified as the input file.
  - `/video/Output/video.mkv` specified as the output file.
  - Uses the built-in preset `H.265 MKV 480p30` as the encoding preset.

##### Advanced Example

```bash
docker run --rm \
	--user 1000:1000 \
	-d /dev/dri:/dev/dri \
	-v ./video:/video \
	ghcr.io/thenickoftime/handbrake-cli:latest \
	-i /video/Input/video.mov \
	-o /video/Output/video.mkv \
	-Z "H.265 QSV 1080p"
```

In the following example, much is the same as the previous command, but we are passing an Intel GPU device into the container, and using a built-in Intel QSV preset.

## Conclusion

`HandBrakeCLI` is a complicated and robust program. While this page hopefully has given you an understanding of how to go about using this specific image, I would recommend using the `--help` command and reference the [HandBrake Docs](https://handbrake.fr/docs/en/latest/cli/cli-options.html) for more detailed information about advanced use.

You can (as far as I have tested) accomplish anything with the `handbrake-cli` image that you would be able to accomplish with a native install of `HandBrakeCLI`. As you take advantage of more and more features, your command will get longer and less readable. It might be worthwhile to run these advanced commands via a bash script, or at the very least use a multi-line command in your console.
