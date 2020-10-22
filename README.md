# History State Module for Nuxt.js 

[![npm version](https://badge.fury.io/js/nuxt-history-state.svg)](https://badge.fury.io/js/nuxt-history-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Nuxt.js module to backup or restore historical states.

## Features

- Restore a last state when going forward or back.
- Restore a state when reloading.
- Restore a last state when going forward or back after reloading. (optional)

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
        maxHistoryLength: 50, // or any positive integer
        reloadable: false, // or true
        overrideDefaultScrollBehavior: true, // or false
        scrollingElements: '#scroll' // or any selector
    }
}
```

### Options

#### maxHistoryLength

Sets the maximum length of hisotries that can hold data.

When this option is not set, it is unlimited.

*Default:* undefined (unlimited)

#### reloadable

Indicates whether this module works properly after reloading.

It uses HTML5 History API state by default. However It does not fully support reloading. 
This API does not work properly when goes back or forward after reloading.

If you set this option to true, it adds a parameter *_p* to url instead of using 
HTML5 History API state.

*Default:* false

#### overrideDefaultScrollBehavior

Indicates whether this module override a default scroll behavior of the router.

If you set this option to true, it manages a scroll behavior by using own saved position.

*Default:* true

#### scrollingElements

Indicates to which element the overrode behavior is applied.

If you set this option to a selecter, it applies the scrolling to the selector, in addition to the window.

*Default:* null

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

By default this method returns basically 'navigate' on server. 
But many browsers send cache-control='maxage=0' when reloading.
It heuristically returns 'reload' then.

If you set the reloadable option to true, it detects 'navigate'
or 'reload' by using *_p* parameter.

#### page

A current page number (an integer beginning with 0).

By defalut this method always returns 0 on server.
If you set the reloadable option to true, it returns the currect
page number by using *_p* parameter.

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

#### findBackPosition(location, partial = false)

You can get the relative position of the first matched history, 
searching backward starting at the current page.
If a history state is not found, this method will return null.

If the partial option sets true, it matches any subset of the location.

This method cannot use on server.

```javascript
const delta = this.$historyState.findBackPosition({
    path: 'test'
    // hash: ...
    // query: ...
    // name: ...
    // params: ...
});
if (delta != null) {
    this.$router.go(delta);
}
```

#### clearItemData(page)

You can clear a data of the specified page number. And it returns the previous data.

This method cannot use on server.

## License

[MIT License](./LICENSE)

Copyright (c) Hidekatsu Izuno (hidekatsu.izuno@gmail.com)
