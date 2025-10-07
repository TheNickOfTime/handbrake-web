<div align='center'>
    <h1 style='{text-decoration: none}'>Contributing to HandBrake Web</h1>
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

## Guidelines

### Did you find a bug?

First, check if your issue already exists [here](https://github.com/TheNickOfTime/handbrake-web/issues?q=is%3Aissue%20label%3Atype%2Fbug). Be sure to check closed issues as well - issues may be fixed in development and have not seen a release yet!

If your bug doesn't have an issue, go ahead and open a new one. Please use the _Bug Report_ issue template and fill out all possible information.

### Do you have a feature/improvement request?

First, check if your feature/improvement has already been made/requested [here](https://github.com/TheNickOfTime/handbrake-web/issues?q=is%3Aissue%20label%3Atype%2Ffeature%20label%3Atype%2Fimprovement).

If your feature/improvement request doesn't already have an issue, go ahead and open a new one. Please use the _Feature Request_ issue template and fill out all possible information.

Please understand that development resources are limited right now, and there are a number of features/improvements already planned. Requesting a feature does not guarantee that it will be implemented at all or in a timely manner - though we will do our best to make it happen.

### Are you wanting to submit a code contribution to the project?

All contributions are welcome and would be greatly appreciated. The general process for contributing involves the standard Git process of:

1. Fork the project
2. Clone your fork
3. Work on your contribution in your fork
4. Submit a pull request in this repository from your fork

All PRs will be subject to review and evaluation before being merged by the project maintainer. Different types of contributions come with additional requirements.

> [!IMPORTANT]
> AI-Generated contributions are not welcome - sorry this is a matter of principle for me. If you used an AI coding tool/assistant/companion to aid in aspects of a contribution, that is fine as long as the overwhelming majority of your contribution was made by your own hands/intellect. I'm not a machine (that's the whole point here) and I can't catch everything, so your honesty and respect for this would be appreciated.
>
> Thanks,
> Nick (Project Maintainer)

#### Bug Fixes

If you are wanting to contribute a bug fix, please make sure an issue for said bug exists (or create a new one). In the PR, please reference the issue number for the bug you are fixing, and outline the changes your have made to fix the problem. Please label your PR with `type/bug` for clarity.

#### New Features & Improvments

If you are wanting to contribute a new feature or improvement, please make sure that an issue detailing said feature/improvement exists. In your PR, please reference the issue number for the feature/improvement your are addressing, and outline the changes you have made along with a personal evaluation of the risks you believe your code changes may carry. Please label your PR with either `type/feature` or `type/improvment` for clarity.

#### Documentation

If you are wanting to contribute to the project's documentation, feel free to open a pull request of your changes without an accompanying issue. To edit the project's GitHub Wiki, you can edit the files in the repository's `/docs` folder (a workflow publishes the contents of `/docs` to the wiki when merged to main). If you are making a new page in the wiki, please make sure to add a link to your page in `/docs/Home.md` so it can be found by others.

## Setting the development environment

HandBrake Web is configured to be developed using [Visual Studio Code Development Containers](https://containers.dev/). If you are unfamiliar with Dev Containers, essentially they allow you to create a reproducible & sandboxed development environment inside of a Docker Container that Visual Studio Code can seamlessly interface with. Dev Containers provide a variety of benefits (and some hurdles too, admittedly), but most importantly, it makes getting setup relatively easy/straight-forward and ensures your development environment is exactly what it should be.

### Install prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
  - [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) plugin
  - [WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) plugin (_If you are on Windows_)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) (_If you are on Windows_)

### Build and run the Dev Container

1. Clone the repo.
   - If you are on Windows, do this _inside of_ WSL - not on the host system.
2. Open the cloned repository in Visual Studio Code.
3. Press `F1` or `Ctrl + Alt + Shift + P` and search for `Dev Containers: Rebuild and Reopen in Container` - select it and push enter.

### Working with the monorepo

HandBrake Web has three primary projects within it - the `client`, `server`, and `worker` projects. There's also a "bonus" project `shared` that contains common resources for the three core projects. To run the various projects components, open a terminal inside of VS Code and:

1. Run `pnpm install`.
2. Enter the directory of the component you wish to run.
   - `cd client`
   - `cd server`
   - `cd worker`
3. Run `pnpm dev` inside that folder.

For full application functionality, you will want to run all three components simultaneously. This can be done by opening multiple terminal tabs within Visual Studio Code.

## But I don't want to use Dev Containers!

Ok, sure - I know developers can be particular about this kind of stuff. You can try to setup your own development environment if you like, but it isn't "officially" supported - which is to say, I'm not sure how much I can help if you run into issues.

### Development Dependencies

To develop and run HandBrake Web, you will need to have the following installed:

- [Node.js](https://nodejs.org) v24
- [pnpm](https://pnpm.io/) v10
- [HandBrakeCLI](https://handbrake.fr/) latest stable version
- [SQLite3](https://sqlite.org/) latest stable version

The remainder of dependencies should be handled internally by node/pnpm.

### Environment Variables

You will also need to configure certain environment variables:

- `SERVER_URL`: The address/ip where your server will be accessible.
- `SERVER_PORT`: The port where your server will be accessible.
- `CLIENT_PORT`: The port where your client will be accessible.
- `DATA_PATH`: The path where persistent application data/configuration is stored.
- `VIDEO_PATH`: The path where media files will be stored.
- `SERVER_ID`: The name/id of the development server.
- `WORKER_ID`: The name/id of the development worker.

Finally, you will need to download a copy of [preset_builtin.json](https://github.com/HandBrake/HandBrake/blob/master/preset/preset_builtin.json) from HandBrake's official repository. The application expects it to be stored at `/var/lib/handbrake/preset_builtin.json` but you can override this with the environment variable `DEFAULT_PRESETS_PATH`.

I _think_ that should do it, but there may be things I have missed when thinking this through. If that is the case, let me know, and I will do my best to amend this guide or make changes to accommodate other development environments.
