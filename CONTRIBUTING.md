## How to contribute to HandBrake Web

### Guidelines

> This needs work...

### Setting the development environment

HandBrake Web is configured to be developed using [Visual Studio Code Development Containers](https://containers.dev/). If you are unfamiliar with Dev Containers, essentially they allow you to create a reproducible & sandboxed development environment inside of a Docker Container that Visual Studio Code can seamlessly interface with. Dev Containers provide a variety of benefits (and some hurdles too, admittedly), but most importantly, it makes getting setup relatively easy/straight-forward and ensures your development environment is exactly what it should be.

##### Install prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
  - [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) plugin
  - **If you are on Windows** - [WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) plugin
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **If you are on Windows** - [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install)

##### Build and run the Dev Container

1. Clone the repo.
   - If you are on Windows, do this _inside of_ WSL - not on the host system.
2. Open the repository in Visual Studio Code.
3. Press `F1` or `Ctrl + Alt + Shift + P` and search for "Dev Containers: Rebuild and Reopen in Container" - select it and push enter.

##### Working with the monorepo

HandBrake Web has three primary projects within it - the `client`, `server`, and `worker` projects. There's also a "bonus" project `shared` that contains common resources for the three core projects. To run the various projects components, open a terminal inside of VS Code and:

1. Run `pnpm install`.
2. Enter the directory of the component you wish to run.
   - `cd client`
   - `cd server`
   - `cd worker`
3. Run `pnpm dev` inside that folder.

### But I don't want to use Dev Containers

Ok, sure - I know developers can be particular about this kind of stuff. You can try to setup your own development environment if you like, but it isn't "officially" supported - which is to say, I'm not sure how much I can help if you run into issues.

To develop and run HandBrake Web, you will need to have the following installed:

- [Node.js](https://nodejs.org) v24
- [pnpm](https://pnpm.io/) v10
- [HandBrakeCLI](https://handbrake.fr/) latest stable version
- [SQLite3](https://sqlite.org/) latest stable version

The remainder of dependencies should be handled internally by node/pnpm.
