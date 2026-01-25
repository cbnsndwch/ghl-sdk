# `@cbnsndwch/ghl-app-template`

A base template for full-stack HighLevel Marketplace apps

[![Sponsor cbnsndwch](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github)](https://github.com/sponsors/cbnsndwch) [![Buy Me A Cafecito ☕](https://img.shields.io/badge/Buy_Me_A_Coffee-☕-FFDD00?style=for-the-badge&logoColor=black)](https://www.buymeacoffee.com/cbnsndwch)

## Table of Contents

- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Routes](#api-routes)
- [SSO Integration](#sso-iframe-integration)
- [License](#license)

## Getting Started

> [!WARNING] This project requires a recent version of NodeJS installed on your
> machine. The current Active LTS version is NodeJS 24.x, with NodeJS 22.x
> in maintenance mode since November of 2025. Older versions of NodeJS are not
> supported.
>
> You should be OK using NodeJS 22.x until the end of the maintenance period in
> April 2027 but I would encourage you to switch sooner rather than later.
>
> For more information on NodeJS LTS releases, see the [NodeJS Release Schedule].

Create a new repository from this template

<a href="https://github.com/new?template_name=ghl-app-template&template_owner=cbnsndwch">
  <img alt="" src="https://raw.githubusercontent.com/cbnsndwch/ghl-app-template/develop/docs/assets/use-this-template-btn.svg" />
</a>

Then, clone your new repository on your dev machine and install the dependencies:

```shell
git clone https://github.com/{YOUR_GITHUB_USERNAME}/ghl-app-template
cd ghl-app-template
pnpm install
```

> **Note:** Running `pnpm install` will automatically build all workspace packages (including the contracts library) via the postinstall script.

Before starting the development server, copy the example environment file:

```shell
cd apps/server
cp .env.example .env
```

Edit the `.env` file and configure your GHL Marketplace app settings.

Open the directory in VSCode:

```shell
code .
```

To start the development server with the debugger attached run the `Debug API` launch configuration. Alternatively, from the `apps/server` directory, run:

```shell
pnpm dev
```

## Usage

Work in progress...

## API Routes

Work in progress...

## SSO (iframe integration)

This section illustrates the process of authenticating a user in the context of a GHL Marketplace App's Custom Pages, by using the new GHL SSO feature. The SSO flow works as follows:

1. The user navigates to the GHL App under the Marketplace menu.
2. The GHL App loads the Custom Page in an iframe.
3. The Custom Page requests the SSO session info from the GHL App by sending a cross-frame message.
4. The GHL App requests the SSO session info from the GHL Server, passing the app's Client ID.
5. The GHL Server uses the app's SSO Token to encrypt the SSO session info and returns it to the GHL App.
6. The GHL App returns the encrypted SSO session info to the Custom Page by sending a response cross-frame message.
7. The Custom Page sends the encrypted SSO session info to the Marketplace App's back-end. The back-end decrypts the SSO session info using the app's SSO Token. Perform app-specific autjorization logic here, like checking if the user, location, or agency is allowed to access the Marketplace.
8. The back-end returns the decrypted SSO session info to the Custom Page along with any relevant app-specific data.
9. The Custom Page now has access to the user's SSO session info and can use it to show content or provide functionality that is user-, location-, or agency-specific.

![SSO Flow](./docs/diagrams/ghl-app-sso.svg)

For a reference implementation see the code in `apps/server/public/js/ghl.mjs`.

## License

This project is licensed under the [MIT License](LICENSE.md).

[NodeJS Release Schedule]: https://nodejs.org/en/about/previous-releases
