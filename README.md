# History State Module for Nuxt.js 

[![npm version](https://badge.fury.io/js/nuxt-history-state.svg)](https://badge.fury.io/js/nuxt-history-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Nuxt.js module to backup or restore historical states.

## Features

- Restore a last state after going forward or back.
- Restore a state when reloading. (optional)

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
the state is saved in window.sessionStore and is restored from there when reloading. 
However this module adds a parameter *_p* to url in return for it.

Notice: This feature don't work correctly in a asyncData method on ssr.
If you reload the browser, the backup state will overwrite the result of the asyncData. 
Because the asyncData method is invoked on only the server side when reloading. 

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

You can access to backup data through $historyState object of *this* or context.

```javascript
export default {
    // Access to backup data in a asyncData or fetch method.
    async asyncData({ $historyState, $http }) {
        // Overwrite value on a new page only
        if ($historyState.action === 'navigate' || $historyState.action === 'push') {
            return await $http.$get(...);
        }
        return {};
    }

    // Access to backup data in lifecycle methods of the instance.
    data() {
        return this.$historyState.data || {
            ...
        };
    }
}
```

## API

### $historyState

#### action

A action type that caused a navigation.

- navigate: When a new page is navigated.
- reload: When a page is reloaded.
- push: When a history.push is called.
- forward: When a forward navigation is occurred.
- back: When a back navigation is occurred.
- invalid: When a history stata is invalid.

This method always returns 'navigate' on server.

#### page

A current page number (an integer beginning with 0).

This method always returns 0 on server.

#### data

A backup data.

This method always returns null on server.

#### length

A history length.

This method cannot use on server.

#### getItem(page)

You can get a location and data of the specified page number.

This method cannot use on server.

#### getItems()

You can get a list of item.

This method cannot use on server.

#### findBackPosition(location)

You can get the relative position of the first matched history, 
searching backward starting at the current page.
If a history state is not found, this method will return null.

This method cannot use on server.

```javascript
const delta = this.$historyState.findBackPosition({
    path: 'test'
    // name: ...
    // fullPath: ...
    // hash: ...
    // query: ...
    // params: ...
    // meta: ...
});
if (delta != null) {
    this.$router.go(delta);
}
```

## License

[MIT License](./LICENSE)

Copyright (c) Hidekatsu Izuno (hidekatsu.izuno@gmail.com)
