# Zengine Migrator

Set up your Zengine plugin for version 2 migration

## Install

```sh
npm i -g ZengineHQ/zengine-migrator
```

## Usage

```
Usage: zmig [options]

CLI for transforming legacy Zengine plugins into version 2 compatible repositories

Migrate an existing repository from any frontend directory, or

Starting in an empty directory, build a full repository from scratch by passing an ID and token

Options:
  -b --branch <branch>    specify a branch of the legacy wrapper repo (default: "#master")
  -u --user <user>        specify the github user for the legacy wrapper repo (default: "ZengineHQ/")
  -i --id <id>            specify the id of plugin code to fetch from Zengine API
  -t --token <token>      specify the access token for fetching plugin code
  -d --dirname <dirname>  specify the name of your frontend code directory (fetched code will be saved at ./plugins/<dirname>/src)
  -h, --help              output usage information
```

## Examples

#### Existing Repository

(assumes [mayan](https://github.com/ZengineHQ/mayan) directory structure)

```sh
cd ./plugins/my-cool-plugin # root directory of your FRONTEND source code (probably not repo top level)
zmig # run the command!

zmig --branch my-test-branch --user myuser # clones myuser/legacy-plugin-wrapper#my-test-branch
zmig -b my-test-branch -u myuser # alias!
```

#### Migrating into a new directory (uncommon)
```sh
mkdir new-plugin-repo
cd new-plugin-repo
zmig # run the command!
cp -r ~/path/to/old-directory/ ./src # copy your legacy code into the dedicated src folder
```

#### Fetching Code from Zengine API

Useful/necessary if you don't have your plugin code in a version-controlled repository already

Obtain the plugin ID and your access token in the [Zengine developer tools](https://platform.zenginehq.com/account/developer)

```sh
zmig --id 123 --token abc456
# using these arguments will first grab your files from the Zengine API
# and scaffold a full mayan-based project before migrating your code

# Now we can use mayan to develop/deploy

# be sure to install dependencies in the right directory
cd plugins/name-of-frontend-dir
npm i
cd ../..

mayan watch --frontend # "live" development server started up with HMR!
mayan deploy --frontend # pushes a draft version to Zengine servers
mayan publish --frontend --yes # builds and publishes your Zengine plugin
```