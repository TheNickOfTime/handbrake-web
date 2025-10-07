# About Volume Mapping

HandBrake Web relies on a consistent volume mapping across containers in order to ensure files are where the individual component programs expect them to be. This can be a little bit confusing, especially if you are newer to the self-hosting scene, or new to how Docker works. This page will hopefully cover everything you need to know about how volume mapping works with HandBrake Web.

## TL;DR

The server container and any worker containers use `/video` to read your input files and write your output files. It is necessary for both the contents and content structure of `/video` to be the same across all containers.

For example, if your _server_ creates a job for a file at `/video/my-video.mov`, the _worker(s)_ also needs to be able to see a file at `/video/my-video.mov` in order to process it. Similarly, if a _worker_ writes a file to `/video/my-transcoded-video.mkv`, the _server_ expects to be able to see that file at `/video/my-transcoded-video.mkv`.

If your server or worker are not on the same machine as your video files (on a NAS, for example), you can use SMB/NFS or another network protocol to make them accessible to the container's host machine, and pass the directory of that network mount into the server/worker container.

It is recommended that you map an externally accessible (SMB, NFS, SFTP, WebDav, etc) directory to inside each container, so you can easily access/modify the files mapped to `/video`.

## What is volume mapping?

Docker containers are essentially sandboxes, which means they only have access to the resources you give them. Storage is one of these resources, and if you do not map volumes to the inside of your container, those files will not persist once the container is shut down.

So volume mapping is the process of providing persistent storage for use inside of your container. The way this works is by taking a path on your host (the machine your are running Docker on) and telling docker to map it to a particular path inside of the Docker container.

> [!IMPORTANT]
> When talking about volume mapping in Docker, it is important to understand the difference between Docker [volumes](https://docs.docker.com/engine/storage/volumes/) (an internal Docker storage mechanism) and [bind mounts](https://docs.docker.com/engine/storage/bind-mounts/) (binding a path from your host file system to the inside of a docker container). The general term "volume mapping" applies to using either of these mechanisms, despite volumes seeming like the obvious choice. For the purposes of this application, _I **always** recommend using bind mounts_ over Docker volumes so you can access files outside of the container easily.

When you run HandBrake Web via Docker Compose, volume mapping is handled by the following lines in your container configuration:

```yaml
volumes:
  - /path/to/your/data:/data
  - /path/to/your/media:/video
```

It means the path `/path/to/your/data` **_outside_** of the container is translated to `/data` **_inside_** of the container.

## The `/video` mapping and you

### How HandBrake Web works

When deploying HandBrake Web, you are actually deploying two (or more) separate containers. One `server` container, and at least one `worker` container.

When you create a job in HandBrake web, the `server` looks at it's own `/video` directory, and determines what file a job will be working on. When a `worker` is sent that job, it looks at it's own `/video` directory and expects to find the file at the specified location. Additionally, the `server` will provide an accompanying output location within `/video`, where the `worker` expects to be able to output the contents of that job to.

##### A simple example

<details>

<summary>Click to expand...</summary>

In this example, HandBrake Web is deployed with both containers running on the same device, from the same Docker Compose file.

- Both containers have the host path `/mnt/user/media/video` mapped to `/video` inside of the container.
- `/mnt/user/media/video` has two folders inside of it:
  - `input` contains numerous videos, one of which is called `my-video.mov`.
  - `output` is empty as of now.

Now, a user wants to create a new job via the web client.

- The server recursively looks at the path `/video` and tells the client what paths are available for both input & output locations.
- A job is created for `/video/input/my-video.mov` as the input file, with an output location of `/video/output/my-transcoded-video.mkv` via the client.
- The server sends the job to a worker.
- The worker begins work on the job:
- The worker looks at the input location `/video/input/my-video.mov` and expects that file to both exist _and_ be `readable`.
- The worker looks at the output location `/video/output/my-transcoded-video.mkv` and expects that location to be `writable`.

Once the job finishes, you would be able to access the output file `my-transcoded-video.mkv` on your host machine at the path `/mnt/user/media/video/output/my-transcoded-video.mkv`.

</details>

### What should work

Due to the magic of Docker's volume mapping mechanism, HandBrake Web doesn't really care what is going on _outside_ of the container (within reason). Ultimately, as long as files exist where they are expected to be within each container, everything will work out great. Below you will find sections that go over a variety of possible working solutions (I'm sure there are more permutations, but this should cover the most common scenarios).

#### `server` and `worker` on the same machine, using local storage bind mounts

In this scenario, both containers are running on the same machine (let's say a high-powered NAS) that has your video files locally accessible at `/mnt/user/media`.

- The server has `/mnt/user/media/video` mapped to `/video`
- The worker has `/mnt/user/media/video` mapped to `/video`

This is an ideal scenario and should work great.

#### `server` and `worker` on the same machine, using network storage bind mounts

In this scenario, both containers are running on the same machine (let's say a high-powered workstation) that doesn't have your video files locally accessible. Your videos are instead stored on another machine (let's say a low-powered NAS) at `/mnt/user/media`. In order to access your videos on your high-powered workstation, you have mounted an SMB/NFS share from your low-powered NAS at `/mnt/remote/media`.

- The server has `/mnt/remote/media/video` mapped to `/video`
- The worker has `/mnt/remote/media/video` mapped to `/video`

This is an ideal scenario and should work great, though network bandwidth _could_ be a bottleneck depending on various factors.

#### `server` running on one machine using local storage bind mounts, and `worker` running on another using network storage bind mounts (or vice-versa)

In this scenario, the server is running on one machine (let's say a low-powered NAS) that has your video files locally accessible at `/mnt/user/media`. The worker is running on another machine (let's say a high-powered workstation). In order to access your videos on your high-powered workstation, you have mounted an SMB/NFS share from your low-powered NAS at `/mnt/remote/media`.

- The server has `/mnt/user/media/video` mapped to `/video`
- The worker has `/mnt/remote/media/video` mapped to `/video`

This is an ideal scenario and should work great, though network bandwidth _could_ be a bottleneck depending on various factors.

#### `server` and `worker` running on one machine using local storage bind mounts, and additional `worker` instances running on another using network storage bind mounts

In this scenario, both containers are running on the same machine (let's say a high-powered NAS) that has your video files locally accessible at `/mnt/user/media`. Additionally, you have one (or more) worker instances running on other machines (let's say a handful of high-powered workstations). In order to access your videos on your additional workers, you have mounted an SMB/NFS share from your low-powered NAS at `/mnt/remote/media` on each of the additional high-powered work stations.

- The server has `/mnt/user/media/video` mapped to `/video`
- The first worker has `/mnt/user/media/video` mapped to `/video`
- The additional workers have `/mnt/remote/media/video` mapped to `/video`

This is an ideal scenario and should work great, though network bandwidth _could_ be a bottleneck depending on various factors.

### What probably won't work

There are some deployment scenarios that flat out won't work, and some that just aren't a great idea in practice or in principle. While it is possible that some of these scenarios might be working for you, it should be noted that anything listed below is unsupported and any bugs you experience are not valid.

#### Any configuration that relies on network synchronization

In this scenario, the server is running on one machine (let's say a low-powered NAS) that has your files locally accessible at `/mnt/user/media`. The worker is running on another machine (let's say a high-powered remote VPS). In order to access your videos on your high-powered remote VPS, you have performed some black magic with rsync, Rclone, or another similar program and have your videos synchronized from `/mnt/user/media` on your NAS to `/mnt/sync/media`.

- The server has `/mnt/user/media/video` mapped to `/video`
- The worker has `/mnt/sync/media/video` mapped to `/video`

This could work in some ideal scenarios, but due to the nature of network synchronization, there **will** be moments where files exist in one place, but not the other, because a file hasn't finished copying/synchronizing (remember, video files are big).

#### Any configuration that relies on cloud storage (at runtime)

In this scenario, the server and worker are both running on one machine (let's say a high-powered workstation) or on different machines (let's say a low-powered workstation and a high-powered workstation respectively) that doesn't have your video files locally accessible. Your videos are instead store in Google Drive, Backblaze B2, or another cloud storage service. In order to access these videos on your high-powered workstation, you have made your cloud storage accessible locally via an official app from your provider, Rclone, or another similar program at `/mnt/cloud/media` which downloads files from the cloud on demand/as needed.

- The server has `/mnt/cloud/media/video` mapped to `/video`
- The worker has `/mnt/cloud/media/video` mapped to `/video`

This is likely to fail, for many of the same reasons that network synchronization would also fail. Moreover, the mechanisms that cloud storage providers use to load/offload files from/to the cloud are inconsistent and unpredictable.
