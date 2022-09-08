
# Contributing to Dazzle

Hi there! Thanks for your interest in Dazzle. This guide will help you get started contributing.

<!-- INSERT doctoc generated TOC please keep comment here to allow auto update -->
<!-- START doctoc generated instructions please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN yarn build-docs TO UPDATE -->
- [Contributing to Dazzle](#contributing-to-dazzle)
  - [Developing locally](#developing-locally)
- [optionally install add-dependencies](#optionally-install-add-dependencies)
    - [Commands](#commands)
    - [Workflow for working on dazzle core with examples](#workflow-for-working-on-dazzle-core-with-examples)
- [or](#or)
- [git checkout -b my-feature-branch master](#git-checkout--b-my-feature-branch-master)
- [git checkout -b my-feature-branch three](#git-checkout--b-my-feature-branch-three)
- [/home/oyvind/Documents/GitHub/dazzle/](#homeoyvinddocumentsgithubdazzle)
- [to make sure tests pass](#to-make-sure-tests-pass)
- [to add a new example](#to-add-a-new-example)
- [to work on a example](#to-work-on-a-example)
- [if it is a example with webpack5 you need to do](#if-it-is-a-example-with-webpack5-you-need-to-do)
- [switch back to webpack4 later to work with webpack4](#switch-back-to-webpack4-later-to-work-with-webpack4)
- [then](#then)
- [if you want to add dependencies to the example](#if-you-want-to-add-dependencies-to-the-example)
- [if you make changes to startserver plugin](#if-you-make-changes-to-startserver-plugin)
- [to run example tests with unreleased dazzle packages with specific webpack and specific tests](#to-run-example-tests-with-unreleased-dazzle-packages-with-specific-webpack-and-specific-tests)
- [Commands being run during testing puts output and puppeteer screenshots in test-artifacts/](#commands-being-run-during-testing-puts-output-and-puppeteer-screenshots-in-test-artifacts)
- [Trouble with puppeteer?](#trouble-with-puppeteer)
    - [Updating your fork](#updating-your-fork)
  - [Adding examples](#adding-examples)
    - [Use examples/basic as template](#use-examplesbasic-as-template)
    - [Naming examples](#naming-examples)
    - [How to get your example merged](#how-to-get-your-example-merged)
    - [Guidelines](#guidelines)
  - [Why wasn't my PR merged?](#why-wasnt-my-pr-merged)
  - [Getting recognition](#getting-recognition)
  - [Getting help](#getting-help)
<!-- END doctoc generated instructions please keep comment here to allow auto update -->

Dazzle is monorepo made up of a several npm packages powered by Turborepo.

- `examples`: All examples go in here.
- `packages`: This is where the magic happens
  - `babel-preset-dazzle`: Dazzle's default Babel preset.
  - `create-dazzle-app`: Dazzle's CLI tool responsible for initialization of new projects
  - `dazzle`: The core library
  - `dazzle-dev-utils`: Utilities and helpers
- `scripts`: Utility scripts related to cleaning and bootstrapping the repo
- `test`: End-to-end tests

## Developing locally

First, fork the repo to your GitHub account. Then clone your fork to your local
machine and make a new branch for your feature/bug/patch etc. It's a good idea to not develop directly on master so you can get updates.

```
git clone https://github.com/<YOUR_GITHUB_USERNAME>/dazzle.git
cd dazzle
git checkout -B <my-branch>
NODE_ENV=development yarn install ---ignore-engines
# optionally install add-dependencies
sudo npm install add-dependencies -g
```

This will install all `node_modules` in all the packages and symlink
inter-dependencies. Thus when you make local changes in any of the packages you can try them
immediately in all the examples. `add-dependencies` can be used to just add packages to `package.json`.

### Commands

- `yarn clean`: Clean up all `node_modules` and remove all symlinks from packages and examples.
- `yarn test --runInBand`: Runs all tests
- `yarn test:packages`: Runs tests for packages
- `yarn test:e2e`: Runs end-to-end tests
- `yarn test:examples:simple`: Runs tests for all simple examples (uses the npm version released of the packages)
- `yarn test:examples:complex`: Runs tests for all complex examples (uses the npm version released of the packages)
- `yarn test:examples`: Runs tests for all examples (uses the npm version released of the packages)

### Workflow for working on dazzle core with examples

```bash

git clone https://github.com/<YOUR_GITHUB_USERNAME>/dazzle.git
cd dazzle
git checkout -b my-feature-branch main

# or
# git checkout -b my-feature-branch master
# git checkout -b my-feature-branch three

sudo npm install add-dependencies

pwd
# /home/oyvind/Documents/GitHub/dazzle/

NODE_ENV=development yarn install ---ignore-engines

# to make sure tests pass
yarn test --runInBand

# to add a new example
yarn new-example existingexample with-somefeature

# to work on a example
cd examples/basic
example="$(basename $PWD)"
pushd ../..


# then
popd
yarn build

# if you want to add dependencies to the example
add-dependencies somedependency

# Commands being run during testing puts output and puppeteer screenshots in test-artifacts/
# Trouble with puppeteer?

sudo sysctl -w kernel.unprivileged_userns_clone=1
```

### Updating your fork

When you want to pull down changes to your fork enter the following into your terminal:

```bash
git checkout main
git pull origin main
```

## Adding examples

### Use examples/basic as template
If you'd like to add an example, I suggest you duplicate the `examples/basic` folder and use that as kind of base template. Before you start adding stuff, go ahead and change the name of the package in the your new example's `package.json`. Then go back to the project root and run `yarn install`. This will make sure that your new example is using your local version of all the `packages`.

### Naming examples

All example folders should be named `with-<thing-you-are-demonstrating>`. Each example's npm package name (found in it's `package.json`) should look like `dazzle-examples-with-<thing-you-are-demonstrating>`.

### How to get your example merged

- Make sure to comment the important parts of your code and include a **well-written**
"Idea behind the example" section. This is more important to me than your actual code.
- Keep your example limited to one idea / library / feature (e.g. don't submit `with-styled-components-and-material-ui`). That being said, there are times when this rule will be relaxed such as if you are showing how to use Apollo and Redux or \<Flux Library\> + React Router.
- Your example **MUST** implement Hot Module Replacement. If it does not update when you make edits, you have broken something.
- Your example should be minimalistic and concise, or a direct copy of another prominent example from the original library (like copying an example directly from react-redux).

### Guidelines

[Commit message guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)

## Why wasn't my PR merged?

I will do my best to write out my reasoning before closing a PR, but 80% of the time it falls under one of these...

- You did not read this document
- Your code breaks an internal application (I will be transparent about this)
- Your code conflicts with some future plans (I will be transparent about this too)
- You've said something inappropriate or have broken the Code of Conduct

## Getting recognition

We use the project README to recognize the contributions of members of the project community.

To add a contributor: `all-contributors add github_username doc,code`

[Valid contributing keys](https://allcontributors.org/docs/en/emoji-key)

## Getting help

Tweet / DM [@fivethreeo](https://twitter.com/fivethreeo)
