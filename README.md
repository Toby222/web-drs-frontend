# Backend for Minimal Non-Persistent chat

Built in [TypeScript 4.5](https://www.typescriptlang.org/) with [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Preact](https://preactjs.com/), and [Sass](https://sass-lang.com/).

## Install

Run the command `yarn install` (or the equivalent in your package manager of choice).

## Develop

Run the command `yarn dev` (or the equivalent in your package manager of choice).

This will run the server in development mode.  
Changes to source files will trigger a rebuild and an automatic reload of the page.

By default the application will be hosted on `http://localhost:3000`.  
To change the port, pass the `--port` flag to the command. (e.g. `yarn dev --port 9090`)

### Formatting & Testing

The command `yarn type-check` (or equivalent) will run the TypeScript compiler without any output, reporting any compile-time errors or warnings.

The command `yarn lint` (or equivalent) will run the configured linters, reporting any linting errors or warnings.  
Its "subcommands" are:

- `yarn lint`: runs all configured linters
- `yarn lint:eslint`: runs [ESLint](https://eslint.org/) with the rules set in `.eslintrc.json`, ignoring files in `.eslintignore`
- `yarn lint:prettier`: runs [Prettier](https://prettier.io/) with the rules set in `.prettierrc`

The command `yarn test` (or equivalent) will run the type checker and the configured linters in strict mode. It will fail if there are any warnings or errors reported. It will (or should, at least) automatically run when you create a new git commit.
Its "subcommands" are:

- `yarn test`: runs the type checker and both linter test-scripts
- `yarn test:eslint`: runs [ESLint](https://eslint.org/) lint-script, but disallows any warnings or errors
- `yarn test:prettier`: runs [Prettier](https://prettier.io/) lint-script
  - prettier's test and lint script are equivalent, by prettier's design

The command `yarn fix` (or equivalent) will format all source files using the configured linters.
Its "subcommands" are:

- `yarn fix`: formats all source files using both linter fix-scripts
- `yarn fix:eslint`: runs the eslint lint-script, but fixes any fixable errors in-place
- `yarn fix:prettier`: formats all source files only using the [Prettier](https://prettier.io/) linter

## Build

Run the command `yarn build` (or the equivalent in your package manager of choice).

This will build a production version of the application.  
Barring unexpected changes, this build output will be static and suitable for deployment on a web server with no installed JavaScript runtime.

## Export

You may access the built output files manually.  
For that you will need to run `yarn next export` (or the equivalent in your package manager of choice).  
The files will then be available in the `out` directory.

## Run

To run a production build, run the command `yarn start` (or the equivalent in your package manager of choice).

The compiled script does not take any parameters.  
Any configuration needs to be done in-source, before the [building step](#build).

This will run the built production version of the application and will fail if no such build has been created.

By default the application will be hosted on `http://localhost:3000`.  
To change the port, pass the `--port` flag to the command. (e.g. `yarn start --port 9090`)

### Combined script

The combined script `yarn prod` (or equivalent) will run the build script and, if successful, the run script.

This command takes the same parameters as the `start` script.

## This package has only been tested on Linux with Node.js v17.3.0

## The page has only been tested in the Chrome browser.
