# History State Module for Nuxt.js 

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Nuxt.js module to backup or restore historical states

## Features

## Install

Using npm:

```
npm install nuxt-history-state
```

## Setup

### nuxt.config.js

```javascript
module.exports = {
    // enable a module
    modules: [
        'nuxt-history-state'
    ],

    // set options (see below section)
    historyState: {
        reloadable: true
    }
}
```

### Options

#### reloadable

Indicates if history state can e seved or not.

This module doesn't support reloading by default. If you set this option to true, 
the history state is saved in window.sessionStore and is restored from there when
reloading. However this feature adds url query to _p parameter in return for it.

*Default:* false

## Usage

### Backup component data

If you want to backup data, you have to define a *backupData* lifecycle method.
I recommend that you define it to page components only.

```javascript
export default {
    backupData() {
        return this.$data;
    }
}
```

### Restore component data

You can access to backup data through $historyState object.

```javascript
export default {
    // access to backup data in a asyncData or a fetch method
    asyncData(context) {
        const backupData = context.$historyState.data;
        if (backupData) {
            return backupData;
        }
        return ...;
    }

    // access to backup data in lifecycle methods of the instance
    data() {
        const backupData = this.$historyState.data;
        if (backupData) {
            return backupData;
        }
        return ...;
    }
}
```

## API

### $historyData

#### action

A navigated action type.

- new: When a new page is displayed.
- reload: When a page is reloaded.
- push: When a pushState is called.
- forward: When a forward navigation is occurred.
- back: When a back navigation is occurred.

#### page

A current page number (an integer beginning with 0).

#### data

A backup data.

#### length

A history length.

#### get(page)

You can get a history state in the specified page.
This method returns a object that has location and data properties.

#### find(location)

You can find a relative position from a current page of the matched location.
If a history state is not found, this method will return null.

```javascript
const pos = this.$historyState.find({
    name: 'test'
    // path: ...
    // fullPath: ...
    // hash: ...
    // query: ...
    // params: ...
    // meta: ...
});
if (pos != null) {
    this.$router.go(pos);
}
```

## License

[MIT License](./LICENSE)

Copyright (c) Hidekatsu Izuno (hidekatsu.izuno@gmail.com)