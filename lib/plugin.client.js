import Vue from 'vue';
import LZString from 'lz-string';

const reloadable = '<%= options.reloadable %>' === 'true';
const overrideDefaultScrollBehavior = '<%= options.overrideDefaultScrollBehavior %>' === 'true';

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

function parseFullPath(fullPath) {
    let path = fullPath;
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
    if (route.name != null && route.name.length > 0) {
        filtered.name = route.name;
    }
    if (route.params != null && Object.keys(route.params) > 0) {
        filtered.params = route.params;
    }
    return filtered;
}

const trailingSlashRE = /\/?$/;

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

class HistoryState {
    constructor() {
        this._action = 'navigate';
        this._page = 0;
        this._items = [[]];
        this._dataFuncs = null;
        this._route = null;
        this._validated = false;

        if (window.sessionStorage) {
            const backupText = sessionStorage.getItem('nuxt-history-state');
            if (backupText) {
                sessionStorage.removeItem('nuxt-history-state');
                try {
                    const backupState = JSON.parse(LZString.decompress(backupText));
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
            } else if (getNavigationType() !== 'navigate') {
                this._action = 'invalid';
                console.error('The saved history state is not found.');
            }
            
            window.addEventListener('unload', event => {
                this._save();
                try {
                    sessionStorage.setItem('nuxt-history-state', LZString.compress(JSON.stringify([
                        this._page,
                        this._items
                    ])));
                } catch (error) {
                    console.error('Failed to save to sessionStorage.', error);
                }
            });
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

        return this._items[this._page] && 
            this._items[this._page][1];
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

        const items = new Array(this._items.length);
        for (let i = 0; i < items.length; i++) {
            items[i] = this.getItem(i);
        }
        return items;
    }

    findBackPosition(location) {
        this._validate();

        if (typeof location === 'string') {
            location = { path: location };
        } else if (location.fullPath) {
            const parsed = parseFullPath(location.fullPath);
            if (!location.path && !location.hash && !location.query) {
                location.path = parsed.path;
                location.hash = parsed.hash;
                location.query = parsed.query;
            }
        }

        location = filterRoute(location);
        for (let pos = this._page - 1; pos >= 0; pos--) {
            const backLocation = this._items[pos][0];
            if (isSameRoute(backLocation, location)) {
                return pos - this._page;
            }
        }
        return null;
    }

    _init(router) {
        router.beforeEach((to, from, next) => {
            if (reloadable) {
                const page = parseInt(to.query && to.query['_p'], 10);
                if (page == null || Number.isNaN(page)) {
                    const route = filterRoute(to);
                    route.query = {
                        ...route.query,
                        '_p': this._page
                    };
                    route.replace = true;
                    next(route);
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

            this._route = to;
            next();
        });

        router.afterEach((to, from) => {
            this._validate();

            this._dataFuncs = [];
        });

        const orgPush = router.history.push;
        router.history.push = (location, onComplete, onAbort) => {            
            if (!reloadable) {
                window.history.replaceState({
                    ...window.history.state,
                    page: this._page
                }, '');
            }
            
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
            }
            return orgPush.call(router.history, location, onComplete, onAbort);
        };

        if (overrideDefaultScrollBehavior) {
            router.options.scrollBehavior = (to, from) => {
                let position = { x: 0, y: 0 };
                if (this._items[this._page] &&
                    this._items[this._page][2] &&
                    (this._action == 'back' || this._action == 'forward')) {
                    position = this._items[this._page][2];
                }

                const nuxt = window.$nuxt
                if (to.path === from.path && to.hash !== from.hash) {
                    nuxt.$nextTick(() => nuxt.$emit('triggerScroll'))
                }

                return new Promise((resolve) => {
                    nuxt.$once('triggerScroll', () => {
                        if (to.hash) {
                            let hash = to.hash
                            // CSS.escape() is not supported with IE and Edge.
                            if (typeof window.CSS !== 'undefined' && typeof window.CSS.escape !== 'undefined') {
                                hash = '#' + window.CSS.escape(hash.substr(1))
                            }
                            if (document.querySelector(hash)) {
                                position = { selector: hash }
                            }
                        }
                        resolve(position);
                    });
                });
            };
        }
    }

    _register(fn) {
        this._dataFuncs.push(fn);
    }

    _save() {
        if (this._route != null) {
            this._items[this._page][0] = filterRoute(this._route);
            this._route = null;
        }

        if (this._dataFuncs != null) {
            let backupData = null;
            backupData = this._dataFuncs.reduce((prev, current) => {
                return Object.assign(prev, current());
            }, {});
            this._items[this._page][1] = backupData;
            this._dataFuncs = null;
        }

        if (overrideDefaultScrollBehavior) {
            this._items[this._page][2] = {
                x: window.pageXOffset,
                y: window.pageYOffset
            };
        }
    }

    _validate() {
        if (this._validated) {
            return;
        }

        if (this._action === 'reload' || this._action === 'forward' || this._action === 'back') {
            if (!this._items[this._page]) {
                this._action = 'invalid';
                this._page = 0;
                this._items.length = this._page + 1;
                this._items[this._page] = [];
                console.error('A history data is missing.  The state was forced to reset.');
            }
        }

        if (this._items[this._page]) {
            const backupRoute = this._items[this._page][0];
            if (backupRoute != null && !isSameRoute(backupRoute, filterRoute(this._route))) {
                this._action = 'invalid';
                this._page = 0;
                this._items.length = this._page + 1;
                this._items[this._page] = [];
                console.error('A history route is mismatched. The state was forced to reset.', backupRoute);
            }
        }

        this._validated = true;
    }
}

const historyState = new HistoryState();

Vue.mixin({
    created() {
        if (typeof this.$options.backupData === 'function') {
            historyState._register(() => this.$options.backupData.call(this));
        }
    }
});

export default (context, inject) => {
    const router = context.app.router;
    historyState._init(router);

    context.$historyState = historyState;
    inject('historyState', historyState);
};
