# Zengine Migrator

Set up your Zengine plugin for version 2 migration

## Install

```sh
npm i -g Wizehive/zengine-migrator
```

## Usage

```sh
cd plugins/my-cool-plugin # root directory of your FRONTEND source code (probably not repo top level)
zmig # run the command!

zmig --branch my-test-branch # clones ZengineHQ/legacy-plugin-wrapper#my-test-branch
zmig -b my-test-branch # alias!

# or...

mkdir new-plugin-repo
cd new-plugin-repo
zmig # run the command!
cp -r ~/path/to/old-directory/ ./src

# or...
# if you don't have your plugin code in a repository already

zmig pull # Coming Soon! This command will first grab your files from the Zengine API before setting up the migrator
```