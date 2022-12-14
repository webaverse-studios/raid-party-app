<h1 align="center">Raid party</h1>

## Minimum Requirements

- 10 GB Disk Space
- 8 GB RAM
- 4 Core CPU / vCPUs

## Installation

Running requires `node` version 18+. The recommended way to get node is `nvm`: https://github.com/nvm-sh/nvm

**Important note before you clone this repo:** This repo uses Git submodules.
You need to install with the `--recurse-submodules` flag or installation will not work. Copy the code below to clone the repository if you aren't sure.

```sh
git clone https://github.com/webaverse-studios/raid-party-app.git
cd app/ # Go into the repository
npm install # Install dependencies
```

##### Note for Windows Users
We recommend that you use Windows Subsystem for Linux to run Webaverse. This [video](https://www.youtube.com/watch?v=5RTSlby-l9w) shows you how you can set up WSL. Once you've installed it, run `wsl` in your terminal to enter Ubuntu, and then run Webaverse from there.

## Quickstart

Starting the application is as easy as:

```sh
npm run start
```

Once the server has started up, you can visit `https://local.webaverse.com`
