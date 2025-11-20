## Docker Compose

Currently, Docker/Docker Compose are the only officially supported methods of installing HandBrake Web.

### Minimum Requirements

#### Host Machine/Operating System

You will need a host machine capable of running the Docker Engine:

- Linux (Recommended) - A native & bare-metal installation of a Linux distribution is the project's recommendation.
- Windows - Ensure you have WSL2 and/or Docker Desktop installed.
- MacOS - Ensure you have Docker Desktop installed.

You may face additional hurdles on Windows and MacOS.

#### Software/Drivers

You will need to have the following installed/available on your host system:

- Docker
- Docker Compose

Docker has fantastic installation docs that cover a wide variety of OS/Distribution options, check it out [here](https://docs.docker.com/engine/install/). You can also install Docker Desktop, which you can read about [here](https://docs.docker.com/desktop/).

If you have a GPU you wish to use for hardware accelerated encoding, please ensure you have the necessary drivers/tools installed on the host system. For additional information, please see the wiki page for [[Hardware Acceleration]].

### Step 1 - Download/Copy `compose.yaml` Template

HandBrake Web has three Docker Compose configuration file templates available:

| Configuation File                                                                                           | Description                                                     |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [compose.base.yaml](https://github.com/TheNickOfTime/handbrake-web/blob/main/compose/compose.base.yaml)     | Basic configuration for CPU encoding                            |
| [compose.intel.yaml](https://github.com/TheNickOfTime/handbrake-web/blob/main/compose/compose.intel.yaml)   | Modified configuration for Intel QSV support for Intel GPUs     |
| [compose.nvidia.yaml](https://github.com/TheNickOfTime/handbrake-web/blob/main/compose/compose.nvidia.yaml) | Modified configuration for NVIDIA NVENC support for NVIDIA GPUs |

You can either copy/paste the contents of these files into a file called `compose.yaml`, or run the following commands to download the templates directly to your current directory. All of these templates will guide you to deploy a single server instance, and a single worker instance - both running on the same machine.

##### Base

```bash
wget -O compose.yaml https://raw.githubusercontent.com/TheNickOfTime/handbrake-web/refs/heads/main/compose/compose.base.yaml
```

##### Intel

```bash
wget -O compose.yaml https://raw.githubusercontent.com/TheNickOfTime/handbrake-web/refs/heads/main/compose/compose.intel.yaml
```

##### NVIDIA

```bash
wget -O compose.yaml https://raw.githubusercontent.com/TheNickOfTime/handbrake-web/refs/heads/main/compose/compose.nvidia.yaml
```

### Step 2 - Modify `compose.yaml` Template

You will want to modify/configure the following options in your `compose.yaml`:

#### `user` Mapping

```yaml
user: 1000:1000
```

The container will run as UID `1000` and GID `1000` by default. Depending on your host system/user configuration, you may need to change this in order to avoid permissions issues. You can run the command `id` on your host system to get the UID/GID of your current user or another user.

You may opt to run the container as root `0:0` to almost certainly bypass any permissions issues, but this is not recommended.

#### `ports` Mapping

```yaml
ports:
  - 9999:9999
```

The server will be accessible on port `9999` by default. You may change the left-hand side of this statement if you have a conflicting service already using this port.

#### `volumes` Mapping

```yaml
volumes:
  - /path/to/your/data:/data
  - /path/to/your/media:/video
```

HandBrake Web expects paths to be mapped to `/data` and `/video` on the server, and `/video` on workers. Please update the left-hand side of these mappings to reflect where you wish to have application data stored. It is _not recommended_ to store this data relative to your compose file.

The same media must be mapped to `/video` across the server and _all_ worker instances. See [here](https://github.com/TheNickOfTime/handbrake-web/wiki/about-volume-mapping) for more information.

#### `environment` Variables

```yaml
environment:
  - WORKER_ID=handbrake-worker
  - SERVER_URL=handbrake-server
  - SERVER_PORT=9999
```

In your worker configuration, ensure the following environment variables are properly configured:

- `WORKER_ID` - This must be unique and not used by any other worker connected to your server.
- `SERVER_URL` & `SERVER_PORT` - If your worker is not on the same host device as your server, you will need to change these to reflect external access. Prefix with `https://` if using TLS/SSL.

### Step 3 - Start Containers

At this point, you should be good to go. Run the following command:

```bash
docker compose pull && docker compose up -d
```

This will first pull the images (based on the tag `latest`), then start the containers with the configuration you provided via `compose.yaml`. You should be able to access the HandBrake Web web interface in the browser of your choice at `http://<your-server-ip>:9999` if you did not change the port mapping!

### Post Install Recommendations

#### Hardware Encoding Support

Please see the wiki page on [Hardware Acceleration](https://github.com/TheNickOfTime/handbrake-web/wiki/hardware-acceleration) for more information.

#### Reverse Proxy

In order to access HandBrake Web via URL, rather than IP, it is recommended to get setup with a **_reverse proxy_**. Some projects that I have used to accomplish this are:

- [NGINX Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager) - Simple, straight-forward setup and configuration.
- [Traefik](https://github.com/traefik/traefik) - Integrates well with Docker, but has a more complicated initial setup.

I've seen others recommend [Caddy](https://caddyserver.com/docs/quick-starts/reverse-proxy), [SWAG](https://github.com/linuxserver/docker-swag), and plain ol' NGINX - but I have not used these methods.

#### Additional Workers

To run additional workers, simply launch additional worker container instances on different machines by omitting the `handbrake-server` service from the example compose file. **Reminder** - It is recommended to run only one worker instance per machine, as a single worker will very likely push most CPUs to 100% utilization during encoding.

Because of this, your server instance must be reachable outside of the machine it is running on. In most cases the port mapping should make this work, but if you are running an additional firewall, ets. please configure accordingly.
