import Vue from 'vue';
import LZString from 'lz-string';
import 'css.escape';

const maxHistoryLength = JSON.parse('<%= JSON.stringify(options.maxHistoryLength || null) %>');
const reloadable = '<%= options.reloadable %>' === 'true';
const overrideDefaultScrollBehavior = '<%= options.overrideDefaultScrollBehavior %>' === 'true';
let scrollingElements = JSON.parse('<%= JSON.stringify(options.scrollingElements || null) %>');
if (scrollingElements && !Array.isArray(scrollingElements)) {
    scrollingElements = [ scrollingElements ];
}

function getNavigationType() {
    if (window.performance) {
        const navi = window.performance.getEntriesByName &&
            window.performance.getEntriesByName('navigation');
        if (navi && navi.length) {
            return navi.type;
        } else if (window.performance.navigation) {
            switch (window.performance.navigation.type) {
            case 0: return 'navigate';
            case 1: return 'reload';
            case 2: return 'back_forward';
            default: return 'prerender';
            }
        }
    }
    return 'navigate';
}

function parseFullPath(path) {
    let hash = null;
    let query = null;

    const hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
        hash = path.slice(hashIndex);
        path = path.slice(0, hashIndex);
    }

    const qparamsIndex = path.indexOf('?');
    if (qparamsIndex >= 0) {
        query = parseQuery(path.slice(qparamsIndex + 1));
        path = path.slice(0, qparamsIndex);

    }
    return {
        path,
        hash,
        query
    };
}

function parseQuery(qparams) {
    qparams = qparams && qparams.replace(/^(\?|#|&)/, '');
    if (!qparams) {
        return null;
    }

    const result = {};
    qparams.split('&').forEach(qparam => {
        const qparamIndex = qparam.indexOf('=');
        let qname = qparam;
        let qvalue = '';
        if (qparamIndex >= 0) {
            qname = decodeURIComponent(qparam.slice(0, qparamIndex));
            qvalue = decodeURIComponent(qparam.slice(qparamIndex + 1));
        }

        const prevQvalue = result[qname];
        if (!prevQvalue) {
            result[qname] = qvalue;
        } else if (Array.isArray(prevQvalue)) {
            prevQvalue.append(qvalue);
        } else {
            result[qname] = [ prevQvalue, qvalue ];
        }
    });
    return result;
}

function filterRoute(route) {
    const filtered = {};
    if (route.path != null && route.path.length > 0) {
        filtered.path = route.path;
    }

    if (route.name != null && route.name.length > 0) {
        filtered.name = route.name;
        if (route.params != null && Object.keys(route.params).length > 0) {
            filtered.params = route.params;
        }
    }

    if (route.hash != null && route.hash.length > 0) {
        filtered.hash = route.hash;
    }

    const query = { ...route.query };
    if (reloadable) {
        delete query['_p'];
    }
    if (Object.keys(query).length > 0) {
        filtered.query = query;
    }

    return filtered;
}

const trailingSlashRE = /\/?$/;

function isSamePage(a, b) {
    if (!b) {
        return false;
    } else if (a.path && b.path) {
        return a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '');
    } else if (a.name && b.name) {
        return a.name === b.name;
    }
    return false;
}

function isMatchedRoute(a, b) {
    if (!b) {
        return false;
    } else if (a.path && b.path) {
        return (
            a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
            (b.hash == null || a.hash === b.hash) &&
            isObjectMatch(a.query, b.query)
        );
    } else if (a.name && b.name) {
        return (
            a.name === b.name &&
            (b.hash == null || a.hash === b.hash) &&
            isObjectMatch(a.query, b.query) &&
            isObjectMatch(a.params, b.params)
        );
    }
    return false;
}

function isSameRoute(a, b) {
    if (!b) {
        return false;
    } else if (a.path && b.path) {
        return (
            a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
            a.hash === b.hash &&
            isObjectEqual(a.query, b.query)
        );
    } else if (a.name && b.name) {
        return (
            a.name === b.name &&
            a.hash === b.hash &&
            isObjectEqual(a.query, b.query) &&
            isObjectEqual(a.params, b.params)
        );
    }
    return false;
}

function isObjectEqual(a, b) {
    if (!a || !b) {
        return a === b;
    }

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) {
        return false;
    }

    return aKeys.every(key => {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === 'object' && typeof bVal === 'object') {
            return isObjectEqual(aVal, bVal);
        }
        return String(aVal) === String(bVal);
    });
}

function isObjectMatch(a, b) {
    if (a === b || a != null && b == null) {
        return true;
    }

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length < bKeys.length) {
        return false;
    }

    return bKeys.every(key => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal != null && bVal == null) {
            return true;
        } else if (typeof aVal === 'object' && typeof bVal === 'object') {
            return isObjectMatch(aVal, bVal);
        }
        return String(aVal) === String(bVal);
    });
}

class HistoryState {
    constructor() {
        this._action = 'navigate';
        this._page = 0;
        this._items = [[]];
        this._dataFuncs = [];
        this._route = null;
        this._validated = false;

        try {
            if (window.sessionStorage) {
                const backupText = sessionStorage.getItem('nuxt-history-state');
                if (backupText) {
                    sessionStorage.removeItem('nuxt-history-state');
                    try {
                        const backupState = JSON.parse(LZString.decompressFromUTF16(backupText));
                        this._action = 'reload';
                        this._page = backupState[0];
                        this._items = backupState[1];

                        if (reloadable) {
                            const query = parseQuery(window.location.search);
                            const page = parseInt(query && query['_p'], 10);
                            if (page == null || Number.isNaN(page)) {
                                this._action = 'navigate';
                                this._page = this._page + 1;
                                this._items.length = this._page + 1;
                                this._items[this._page] = [];
                            }
                        }
                    } catch (error) {
                        this._action = 'invalid';
                        console.error('Failed to restore from sessionStorage.', error);
                    }
                } else if (getNavigationType() === 'reload') {
                    this._action = 'invalid';
                    console.error('The saved history state is not found.');
                }

                window.addEventListener('unload', event => {
                    this._save();
                    try {
                        sessionStorage.setItem('nuxt-history-state', LZString.compressToUTF16(JSON.stringify([
                            this._page,
                            this._items
                        ])));
                    } catch (error) {
                        console.error('Failed to save to sessionStorage.', error);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to access to sessionStorage.', error);
        }

        if (!reloadable && this._action !== 'invalid') {
            window.addEventListener('popstate', event => {
                let page = event.state && event.state.page;
                if (page == null) {
                    page = this._items.length - 1;
                }

                if (page !== this._page) {
                    this._save();

                    if (page < this._page) {
                        this._action = 'back';
                    } else if (page > this._page) {
                        this._action = 'forward';
                    }
                    this._page = page;
                }
            });
        }
    }

    get action() {
        this._validate();

        return this._action;
    }

    get page() {
        this._validate();

        return this._page;
    }

    get data() {
        this._validate();

        const item = this._items[this._page];
        return item && item[1];
    }

    get length() {
        this._validate();

        return this._items.length;
    }

    getItem(page) {
        this._validate();

        if (page >= this._items.length) {
            return undefined;
        }

        const item = this._items[page];
        return {
            location: item && item[0],
            data: item && item[1]
        };
    }

    getItems() {
        this._validate();

        const items = [];
        for (let i = 0; i < this._items.length; i++) {
            items.push(this.getItem(i));
        }
        return items;
    }

    clearItemData(page) {
        this._validate();

        if (page >= this._items.length) {
            return undefined;
        }

        const item = this._items[page];
        if (item) {
            const data = item[1];
            item[1] = null;
            return data;
        }
        return undefined;
    }

    /**
     * @deprecated Use clearItemData
     */
    removeItem(page) {
        this._validate();

        if (page >= this._items.length) {
            return undefined;
        }

        const item = this._items[page];
        let data = undefined;
        if (item) {
            data = item[1];
            item[1] = null;
        }
        return {
            location: item && item[0],
            data
        };
    }

    findBackPosition(location, partial = false) {
        this._validate();

        if (typeof location === 'string') {
            location = { path: location };
        }

        if (location.path) {
            const parsed = parseFullPath(location.path);
            if (parsed) {
                location.path = parsed.path;
                if (!location.hash) {
                    location.hash = parsed.hash;
                }
                if (!location.query) {
                    location.query = parsed.query;
                }
            }
        }

        location = filterRoute(location);
        for (let pos = this._page - 1; pos >= 0; pos--) {
            const backLocation = this._items[pos][0];
            if (!backLocation) {
                continue;
            }

            if (partial) {
                if (isMatchedRoute(backLocation, location)) {
                    return pos - this._page;
                }
            } else {
                if (isSameRoute(backLocation, location)) {
                    return pos - this._page;
                }
            }
        }
        return null;
    }

    _init(router) {
        router.beforeEach((to, from, next) => {
            if (reloadable) {
                const page = parseInt(to.query && to.query['_p'], 10);
                if (page == null || Number.isNaN(page)) {
                    next({
                        path: to.path,
                        hash: to.hash,
                        query: {
                            ...to.query,
                            '_p': this._page
                        },
                        name: to.name,
                        params: to.params,
                        meta: to.meta,
                        replace: true
                    });
                    return;
                }

                if (page !== this._page) {
                    this._save();

                    if (page < this._page) {
                        this._action = 'back';
                    } else if (page > this._page) {
                        this._action = 'forward';
                    }
                    this._page = page;
                }
            }

            const route = filterRoute(to);
            if (route.params && route.params.length > 0) {
                const matched = route.matched.find(elem => elem.name === to.name);
                if (matched &&
                    matched.regex &&
                    matched.regex.keys) {

                    const params = {};
                    const keys = matched.regex.keys;
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        if (!key.optional || route.params.propertyIsEnumerable(key.name)) {
                            params[key.name] = route.params[key.name];
                        }
                    }
                    route.params = params;
                }
            }
            this._route = route;
            next();
        });

        router.afterEach((to, from) => {
            this._validate();

            if (!isSamePage(to, from)) {
                this._dataFuncs.length = 0;
            }

            if (!reloadable &&
                window.history.state &&
                window.history.state.page == null) {
                window.history.replaceState({
                    ...window.history.state,
                    page: this._page
                }, '');
            }
        });

        const orgPush = router.history.push;
        router.history.push = (location, onComplete, onAbort) => {
            this._save();

            this._action = 'push';
            this._page++;
            this._items.length = this._page + 1;
            this._items[this._page] = [];

            if (reloadable) {
                if (typeof location === 'string') {
                    location = { path: location };
                }
                location.query = {
                    ...location.query,
                    _p: String(this._page)
                };
            } else {
                const prevOnComplete = onComplete;
                const thisPage = this._page;
                onComplete = function() {
                    window.history.replaceState({
                        ...window.history.state,
                        page: thisPage
                    }, '');

                    if (prevOnComplete) {
                        return prevOnComplete();
                    }
                };
            }

            return orgPush.call(router.history, location, onComplete, onAbort);
        };

        if (overrideDefaultScrollBehavior) {
            router.options.scrollBehavior = async (to, from) => {
                const nuxt = window['<%= globals.nuxt %>'];
                if (
                    // Route hash changes
                    (to.path === from.path && to.hash !== from.hash) ||
                    // Initial load (vuejs/vue-router#3199)
                    to === from
                ) {
                    nuxt.$nextTick(() => nuxt.$emit('triggerScroll'))
                }

                return new Promise((resolve) => {
                    // wait for the out transition to complete (if necessary)
                    nuxt.$once('triggerScroll', () => {
                        if (to.hash) {
                            return {
                                selector: `#${CSS.escape(to.hash.substring(1))}`
                            };
                        }

                        if (this._items[this._page] &&
                            this._items[this._page][2] &&
                            (this._action == 'back' || this._action == 'forward')) {
                            const positions = this._items[this._page][2];

                            if (scrollingElements) {
                                nuxt.$nextTick(async () => {
                                    for (let i = 0; i < 4; i++) {
                                        if (i > 0) {
                                            // wait 25ms * 4 = 100ms
                                            await new Promise(resolve => setTimeout(resolve, 25));
                                        }

                                        for (const selector of scrollingElements) {
                                            const elem = document.querySelector(selector);
                                            const position = positions[selector];
                                            if (elem && position) {
                                                elem.scrollLeft = position.x;
                                                elem.scrollTop = position.y;
                                            }
                                        }
                                    }
                                });
                            }

                            if (positions.window) {
                                resolve(positions.window);
                            }
                        }

                        resolve({ x: 0, y: 0 });
                    });
                });
            };
        }
    }

    _register(fn) {
        const index = this._dataFuncs.indexOf(fn);
        if (index == -1) {
            this._dataFuncs.push(fn);
        }
    }

    _unregister(fn) {
        const index = this._dataFuncs.indexOf(fn);
        if (index > -1) {
            this._dataFuncs.splice(index, 1);
        }
    }

    _save() {
        if (this._route != null) {
            this._items[this._page][0] = this._route;
        }

        if (this._dataFuncs != null) {
            const backupData = this._dataFuncs.reduce((prev, current) => {
                return Object.assign(prev, current());
            }, {});
            this._items[this._page][1] = backupData;
        }

        if (overrideDefaultScrollBehavior) {
            let positions = {};
            if (scrollingElements) {
                for (const selector of scrollingElements) {
                    const elem = document.querySelector(selector);
                    if (elem) {
                        positions[selector] = {
                            x: elem.scrollLeft,
                            y: elem.scrollTop
                        };
                    }
                }
            }
            positions.window = {
                x: window.pageXOffset,
                y: window.pageYOffset
            };
            this._items[this._page][2] = positions;
        }

        const maxPage = Math.min(maxHistoryLength || window.history.length, window.history.length);
        if (this._items.length > maxPage) {
            for (let page = 0; page < this._items.length - maxPage; page++) {
                this._items[page] = [];
            }
        }
    }

    _validate() {
        if (this._validated) {
            return;
        }

        if (this._items[this._page]) {
            const backupRoute = this._items[this._page][0];
            if (backupRoute != null && !isSameRoute(backupRoute, this._route)) {
                if (this._action === 'reload') {
                    let action = null;
                    if (getNavigationType() === 'back_forward') {
                        if (this._page > 0) {
                            const backRoute = this._items[this._page - 1][0];
                            if (backRoute != null && isSameRoute(backRoute, this._route)) {
                                action = 'back';
                            }
                        }
                        if (!action && this._page + 1 < this._items.length) {
                            const forwardRoute = this._items[this._page + 1][0];
                            if (forwardRoute != null && isSameRoute(forwardRoute, this._route)) {
                                action = 'forward';
                            }
                        }
                    }

                    if (action === 'back') {
                        this._action = 'back';
                        this._page--;
                    } else if (action === 'forward') {
                        this._action = 'forward';
                        this._page++;
                    } else {
                        this._action = 'navigate';
                        this._page++;
                        this._items.length = this._page + 1;
                        this._items[this._page] = [];
                    }
                } else {
                    this._action = 'invalid';
                    this._page = 0;
                    this._items.length = this._page + 1;
                    this._items[this._page] = [];
                    console.error('A history route is mismatched. The state was forced to reset.', backupRoute);
                }
            }
        } else if (this._page >= this._items.length) {
            if (this._action === 'reload' || this._action === 'forward' || this._action === 'back') {
                this._action = 'invalid';
                this._page = 0;
                this._items.length = this._page + 1;
                this._items[this._page] = [];
                console.error('A history data is missing. The state was forced to reset.');
            }
        }

        this._validated = true;
    }
}

const historyState = new HistoryState();

Vue.mixin({
    created() {
        if (typeof this.$options.backupData === 'function') {
            this._backupDataFn = () => this.$options.backupData.call(this);
            historyState._register(this._backupDataFn);
        }
    },
    destroyed() {
        if (this._backupDataFn) {
            historyState._unregister(this._backupDataFn);
        }
    }
});

export default (context, inject) => {
    const router = context.app.router;
    historyState._init(router);

    context.$historyState = historyState;
    inject('historyState', historyState);
};
