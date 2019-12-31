import Vue from 'vue';
import equal from 'fast-deep-equal';
import isMatch from 'lodash.ismatch';
<% if (options.reloadable) { %>import LZString from 'lz-string';<% } %>

function getNavigationType() {
    if (window.performance) {
        const navi = performance.getEntriesByName && performance.getEntriesByName('navigation');
        if (navi && navi.length) {
            return navi.type;
        } else if (performance.navigation) {
            switch (performance.navigation.type) {
            case 0: return 'navigate';
            case 1: return 'reload';
            case 2: return 'back_forward';
            default: return 'prerender';
            }
        }
    }
    return 'navigate';
}

class HistoryState {
    constructor() {
        this._router = null;
        
        this._action = 'navigate';
        this._page = 0;
        this._items = Array(1);
        this._dataFuncs = [];
        this._route = null;

<% if (options.reloadable) { %>
        if (window.sessionStorage) {
            const backupText = sessionStorage.getItem('nuxt-history-state');
            if (backupText) {
                sessionStorage.removeItem('nuxt-history-state');
                const backupState = JSON.parse(LZString.decompress(backupText));
                this._action = 'reload';
                this._page = backupState[0];
                this._items = backupState[1];
                this._route = null;
            } else if (getNavigationType() === 'reload') {
                this._action = 'invalid';
                console.error('The saved history state is not found.');
            }
        }

        window.addEventListener('unload', e => {
            this._save();
            sessionStorage.setItem('nuxt-history-state', LZString.compress(JSON.stringify([
                this._page,
                this._items
            ])));
        });
<% } else { %>
        if (getNavigationType() !== 'navigate') {
            this._action = 'invalid';
            console.error('The history state may be cleared for a reload, back or forward navigation.');
        }

        window.addEventListener('popstate', e => {
            this._save();
            let page = e.state && e.state.page;
            if (page == null) {
                page = this._items.length - 1;
            }
            this._update(page);
        });
<% } %>
    }

    get action() {
        return this._action;
    }

    get page() {
        return this._page;
    }

    get data() {
        this._validate();
        return this._items[this._page] && 
            this._items[this._page][1];
    }

    get length() {
        return this._items.length;
    }

    getItem(page) {
        if (page === this._page) {
            this._validate();
        } else if (page >= this._items.length) {
            return undefined;
        }

        const item = this._items[page];
        return {
            location: item && item[0],
            data: item && item[1]
        };
    }

    getItems() {
        const items = new Array(this._items.length);
        for (let i = 0; i < items.length; i++) {
            items[i] = this.getItem(i);
        }
        return items;
    }

    findBackPosition(location) {
        if (typeof location === 'string') {
            location = { path: location };
        }

        for (let pos = this._page - 1; pos >= 0; pos--) {
            const backLocation = this._items[pos][0];
            if (isMatch(backLocation, location)) {
                return pos - this._page;
            }
        }
        return null;
    }

    _init(router) {
        this._router = router;

        const orgPush = router.history.push;
<% if (options.reloadable) { %>
        router.history.push = (location, onComplete, onAbort) => {
            this._save();
            this._enter();
            if (typeof location === 'string') {
                location = { name: location };
            }
            location.query = {
                ...location.query,
                _p: String(this.page)
            };
            return orgPush.call(router.history, location, onComplete, onAbort);
        };

        router.beforeEach((to, from, next) => {
            let page = parseInt(to.query && to.query._p, 10);
            if (page == null || Number.isNaN(page)) {
                page = 0;
            }
    
            if (page !== this.page) {
                this._save();
                this._update(page);
            }
            this._route = this._toHistoryRoute(to);
            next();
        });
<% } else { %>
        router.history.push = (location, onComplete, onAbort) => {
            this._save();
            window.history.replaceState({
                ...window.history.state,
                page: this.page
            }, '');
            this._enter();
            return orgPush.call(router.history, location, onComplete, onAbort);
        };

        router.beforeEach((to, from, next) => {
            this._route = this._toHistoryRoute(to);
            next();
        });
<% } %>
    }

    _register(instance) {
        this._dataFuncs.push(instance);
    }

    _enter() {
        this._action = 'push';
        this._page++;
        this._items.length = this._page + 1;
        this._items[this._page] = [];
        this._validated = false;
    }

    _update(page) {
        this._action = (page > this._page) ? 'forward' : 'back';
        this._page = page;
        this._validated = false;
    }

    _toHistoryRoute(route) {
        return {
            name: route.name,
            meta: { ...route.meta },
            path: route.path,
            hash: route.hash,
            query: { ...route.query },
            params: route.params,
            fullPath: route.fullPath
        };
    }

    _save() {
        if (!this._items[this._page]) {
            this._items[this._page] = [];
        }

        const route = this._toHistoryRoute(this._router.currentRoute);
        this._items[this._page][0] = route;

        let backupData = null;
        if (this._dataFuncs.length) {
            backupData = this._dataFuncs.reduce((prev, current) => {
                return Object.assign(prev, current());
            }, {});
            this._dataFuncs.length = 0;
        }
        this._items[this._page][1] = backupData;
    }

    _validate() {
        if (!this._route) {
            return;
        }

        const backupRoute = this._items[this._page] && 
            this._items[this._page][0];
        if (backupRoute != null) {
            if (!equal(backupRoute, this._route)) {
                this._action = 'invalid';
                this._page = 0;
                this._items = Array(1);
                this._dataFuncs = [];
                console.error('A history route is mismatched. The state was forced to reset.');
            }
        }
        this._route = null;
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
