<div align='center'>
    <h1 style='{text-decoration: none}'>HandBrake Web</h1>
    <div align='center'>
      <a href='https://github.com/TheNickOfTime/handbrake-web/blob/main/LICENSE'>
        <img alt="GitHub License" src="https://img.shields.io/github/license/thenickoftime/handbrake-web?style=flat-square">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/releases/latest'>
        <img alt="GitHub Release" src="https://img.shields.io/github/v/release/thenickoftime/handbrake-web?style=flat-square">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/milestone/5'>
        <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/thenickoftime/handbrake-web?filename=server%2Fpackage.json&style=flat-square&label=development&color=goldenrod">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/milestone/5'>
        <img alt="GitHub milestone details" src="https://img.shields.io/github/milestones/progress-percent/thenickoftime/handbrake-web/5?style=flat-square&label=progress&color=goldenrod">
      </a>
      <a href='https://github.com/TheNickOfTime/handbrake-web/actions/workflows/docker-publish.yaml?query=branch%3Amain'>
        <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/thenickoftime/handbrake-web/docker-publish.yaml?branch=main&style=flat-square">
      </a>
    </div>
    <div align='center'>
      <strong>Disclaimer:</strong>
      <em>This project is not related to or part of the official <a href='https://github.com/HandBrake/HandBrake'>HandBrake</a> development. It simply uses the CLI component of HandBrake under the hood.</em>
    </div>
    <img src='client/public/handbrake-icon.png' height=256px>
</div>

## How to contribute to HandBrake Web

### Guidelines

> This needs work...

### Setting the development environment

HandBrake Web is configured to be developed using [Visual Studio Code Development Containers](https://containers.dev/). If you are unfamiliar with Dev Containers, essentially they allow you to create a reproducible & sandboxed development environment inside of a Docker Container that Visual Studio Code can seamlessly interface with. Dev Containers provide a variety of benefits (and some hurdles too, admittedly), but most importantly, it makes getting setup relatively easy/straight-forward and ensures your development environment is exactly what it should be.

##### Install prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
  - [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) plugin
  - [WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) plugin (_If you are on Windows_)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) (_If you are on Windows_)

##### Build and run the Dev Container

1. Clone the repo.
   - If you are on Windows, do this _inside of_ WSL - not on the host system.
2. Open the cloned repository in Visual Studio Code.
3. Press `F1` or `Ctrl + Alt + Shift + P` and search for `Dev Containers: Rebuild and Reopen in Container` - select it and push enter.

##### Working with the monorepo

HandBrake Web has three primary projects within it - the `client`, `server`, and `worker` projects. There's also a "bonus" project `shared` that contains common resources for the three core projects. To run the various projects components, open a terminal inside of VS Code and:

1. Run `pnpm install`.
2. Enter the directory of the component you wish to run.
   - `cd client`
   - `cd server`
   - `cd worker`
3. Run `pnpm dev` inside that folder.

For full application functionality, you will want to run all three components simultaneously. This can be done by opening multiple terminal tabs within Visual Studio Code.

### But I don't want to use Dev Containers

Ok, sure - I know developers can be particular about this kind of stuff. You can try to setup your own development environment if you like, but it isn't "officially" supported - which is to say, I'm not sure how much I can help if you run into issues.

To develop and run HandBrake Web, you will need to have the following installed:

- [Node.js](https://nodejs.org) v24
- [pnpm](https://pnpm.io/) v10
- [HandBrakeCLI](https://handbrake.fr/) latest stable version
- [SQLite3](https://sqlite.org/) latest stable version

The remainder of dependencies should be handled internally by node/pnpm.

You will also need to configure certain environment variables:

- `SERVER_URL`: The address/ip where your server will be accessible.
- `SERVER_PORT`: The port where your server will be accessible.
- `CLIENT_PORT`: The port where your client will be accessible.
- `DATA_PATH`: The path where persistent application data/configuration is stored.
- `VIDEO_PATH`: The path where media files will be stored.
- `SERVER_ID`: The name/id of the development server.
- `WORKER_ID`: The name/id of the development worker.

Finally, you will need to download a copy of [preset_builtin.json](https://github.com/HandBrake/HandBrake/blob/master/preset/preset_builtin.json) from HandBrake's official repository. The application expects it to be stored at `/var/lib/handbrake-web/preset_builtin.json` but you can override this with the environment variable `DEFAULT_PRESETS_LOCATION`.

I _think_ that should do it, but there may be things I have missed when thinking this through. If that is the case, let me know, and I will do my best to amend this guide or make changes to accommodate other development environments.
