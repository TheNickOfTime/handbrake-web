<div align='center'>
    <h1 style='{text-decoration: none}'>HandBrake Web</h1>
    <div align='center'>
      <a href='https://github.com/TheNickOfTime/handbrake-web/blob/main/LICENSE'>
        <img alt="GitHub License" src="https://img.shields.io/github/license/thenickoftime/handbrake-web?style=flat-square">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/releases/latest'>
        <img alt="GitHub Release" src="https://img.shields.io/github/v/release/thenickoftime/handbrake-web?style=flat-square">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/milestone/7'>
        <img alt="GitHub package.json version" src="https://img.shields.io/badge/development-v0.9.0-goldenrod?style=flat-square">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/milestone/7'>
        <img alt="GitHub milestone details" src="https://img.shields.io/github/milestones/progress-percent/thenickoftime/handbrake-web/7?style=flat-square&label=progress&color=goldenrod">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/actions/workflows/docker-publish.yaml?query=branch%3Amain'>
        <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/thenickoftime/handbrake-web/docker-publish.yaml?branch=main&style=flat-square">
      </a>
      <a href='https://buymeacoffee.com/thenickoftime'>
        <img alt="Static Badge" src="https://img.shields.io/badge/support-buy_me_a_coffee-mediumseagreen?style=flat-square">
      </a>
    </div>
    <div align='center'>
      <strong>Disclaimer:</strong>
      <em>This project is not related to or part of the official <a href='https://github.com/HandBrake/HandBrake'>HandBrake</a> development. It simply uses the CLI component of HandBrake under the hood.</em>
    </div>
    <img src='client/public/handbrake-icon.png' height=256px>
</div>

## Summary

<div align='center' width=100%>
  <img src='/docs/images/screenshots/screenshot-queue.png' width=90%>
  <details>
    <summary><strong>See More Screenshots (<em>click to expand</em>)</strong></summary>
    <img src='/docs/images/screenshots/screenshot-dashboard.png' width=90%>
    <img src='/docs/images/screenshots/screenshot-presets.png' width=90%>
    <img src='/docs/images/screenshots/screenshot-watchers.png' width=90%>
    <img src='/docs/images/screenshots/screenshot-workers.png' width=90%>
    <img src='/docs/images/screenshots/screenshot-settings.png' width=90%>
  </details>
</div>

HandBrake Web is a program for interfacing with handbrake across multiple machines via a web browser. It consists of two components: the **server** and one or more **worker**(s). **_Warning_** - This application is still under heavy development, use at your own risk, to learn more please see the [Known Issues & Limitations](#planned-features-not-yet-implemented) section.

### Server

The server component primarily acts as a coordinator for the workers. Additionally it serves the client interface. **The work done by the server is not computationally expensive** - it can be run on low-end/low-power devices with no issue.

### Worker(s)

The worker component does the heavy lifting via HandBrakeCLI. Jobs are sent to workers by the server, and the workers will process the provided media based on a provided HandBrake preset configuration. **The work done by the worker is very computationally expensive** - it is recommended that you **run a single worker instance per machine**, and that machine either have a high core-count CPU _or_ have GPU hardware encoding features available to the worker.

## Setup

### Setup Guide

See the [Setup Guide](https://github.com/TheNickOfTime/handbrake-web/wiki/Setup-Guide) wiki page for a detailed walkthrough on getting HandBrake Web setup and configured.

### Quick Start

If you are very familiar with Docker/Docker Compose and want to get started as fast as possible with a server and a single worker, check out the base configuration below:

```yaml
services:
  handbrake-server:
    image: ghcr.io/thenickoftime/handbrake-web-server:latest
    container_name: handbrake-web-server
    user: 1000:1000 # edit to run as user (uuid:guid) with permissions to access your media. 0:0 to run as root (not recommended).
    ports:
      - 9999:9999
    volumes:
      - /path/to/your/data:/data
      - /path/to/your/media:/video # ensure this path is the same across all containers

  handbrake-worker:
    image: ghcr.io/thenickoftime/handbrake-web-worker:latest
    container_name: handbrake-web-worker
    user: 1000:1000 # edit to run as user (uuid:guid) with permissions to access your media. 0:0 to run as root (not recommended).
    environment:
      - WORKER_ID=handbrake-worker # give your worker a unique name
      - SERVER_URL=handbrake-server # change if setting up a standalone worker, prefix with http(s):// if necessary
      - SERVER_PORT=9999 # change if using a reverse proxy or the port is otherwise different than above
    volumes:
      - /path/to/your/media:/video # ensure this path is the same across all containers
    depends_on:
      - handbrake-server
```

## Usage

### Presets

HandBrake Web currently uses presets configured in the desktop application of HandBrake and exported to .json files to configure encoding jobs. Exported presets can then be uploaded via the web interface in the 'Presets' section. Please see the [Presets](https://github.com/TheNickOfTime/handbrake-web/wiki/Presets) wiki page for additional information.

### Hardware Accelerated Encoding

Additional configuration is required to enable hardware accelerated encoding for GPUs - please see the [Hardware Acceleration](https://github.com/TheNickOfTime/handbrake-web/wiki/Hardware-Acceleration) wiki page for additional information. Currently Intel QSV and NVIDIA NVENC hardware encoding are supported. Support for AMD VCN is planned, but not yet implimented.

## Features

_These lists are not comprehensive, please see the [development project](https://github.com/users/TheNickOfTime/projects/3) for more information..._

### Current Features

- **Web Interface** - Interact with HandBrake on a headless device via a web browser.
- **Job Queue** - Create and manage a queue of jobs for your workers to tackle in order.
- **Bulk Job Creation** - Easily create multiple jobs at once for videos in the same directory.
- **Preset Management** - Upload, Rename, and Delete HandBrake presets in the web interface.
- **Directory Monitoring** - Create directory _"Watchers"_ to automatically create jobs based on various criteria.
- **Distributed Encoding** - Leverage multiple devices/nodes/workers to tackle encoding tasks concurrently.
- **Hardware Accelerated Encoding** - Use a GPU to speed up encoding times.
  - **Intel QSV** - Use your discrete and/or integrated Intel GPU.
  - **NVIDIA NVENC** - Use your discrete NVIDIA GPU.

### Planned Features (not yet implemented)

- **Preset Creator** - Create presets directly in the web interface.
- **Upload Files** - Upload video files to the server via the web interface.
- **Hardware Accelerated Encoding** - Use a GPU to speed up encoding times.
  - **AMD VCN** - Use your discrete and/or integrated AMD GPU.
- **User Sessions** - Logging in required to access the web interface.

## Bonus Tool (Minimal HandBrakeCLI Image)

If you are looking for a dockerized/containerized way to directly use HandBrakeCLI (via terminal), you can use an additional image this project provides -`ghcr.io/thenickoftime/handbrake-cli`. You can find additional information about using it on the [HandBrakeCLI Image](https://github.com/TheNickOfTime/handbrake-web/wiki/HandBrakeCLI-Image) wiki page.

This "bonus" image was incredibly simple to make by using the existing outputs of this project's build process, so it felt rude to not make it available to anyone who might want to use it.

## Contributing & Development

Please see [CONTIBUTING.md](./CONTRIBUTING.md).
