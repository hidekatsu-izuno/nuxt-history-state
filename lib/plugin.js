import Vue from 'vue';
import isEqual from 'lodash-es/isEqual';
import isMatch from 'lodash-es/isMatch';

class HistoryState {
    constructor() {
        this._init();

        if (window.sessionStorage) {
            const backupText = sessionStorage.getItem('nuxt-history-state');
            sessionStorage.removeItem('nuxt-history-state');
            if (backupText) {
                const backupState = JSON.parse(backupText);
                this._action = 'reload';
                this._page = backupState[0];
                this._items = backupState[1];
            }
        }

<% if (options.reloadable) { %>
        window.addEventListener('unload', e => {
            this._save();
            sessionStorage.setItem('nuxt-history-state', JSON.stringify([
                this._page,
                this._items
            ]));    
        });
<% } else { %>
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
        return this._items[this._page][1];
    }

    get length() {
        return this._items.length;
    }

    getLocation(page) {
        return this._items[page] && this._items[page][0];
    }

    getData(page) {
        return this._items[page] && this._items[page][1];
    }

    find(location) {
        if (typeof location === 'string') {
            location = { name: location };
        }

        for (let pos = this._page - 1; pos >= 0; pos--) {
            const backLocation = this._items[pos][0];
            if (isMatch(backLocation, location)) {
                return pos - this._page;
            }
        }
        return null;
    }

    _init() {
        this._action = 'new';
        this._page = 0;
        this._items = Array(1);
        this._dataFunc = null;
    }

    _register(fn) {
        this._dataFunc = fn;
    }

    _enter() {
        this._action = 'push';
        this._page++;
        this._items.length = this._page + 1;
        this._items[this._page] = [];
    }

    _route(route) {
        if (!this._items[this._page]) {
            this._items[this._page] = [];
        }
        
        const oldRoute = this._items[this._page][0];
        const newRoute = {
            name: route.name,
            meta: { ...route.meta },
            path: route.path,
            hash: route.hash,
            query: { ...route.query },
            params: route.params,
            fullPath: route.fullPath
        };
        if (oldRoute != null && !isEqual(oldRoute, newRoute)) {
            this._init();
            console.error('A history route is mismatched. The state was forced to reset.');
        }
        this._items[this._page][0] = newRoute;   
    }

    _update(page) {
        this._action = (page > this._page) ? 'forward' : 'back';
        this._page = page;
    }

    _save() {
        if (!this._dataFunc) {
            return;
        }

        const data = this._items[this._page][1];
        const backupData = this._dataFunc();
        this._items[this._page][1] = (data || backupData) ? {
            ...data,
            ...backupData
        } : null;
        this._dataFunc = null;
    }
}

const historyState = new HistoryState();

Vue.mixin({
    beforeMount() {
        if (typeof this.$options.backupData === 'function') {
            historyState._register(() => this.$options.backupData.call(this));
        }
    }
});

export default (context, inject) => {
    const router = context.app.router;
    
    const orgPush = router.history.push;
    router.history.push = function(location, onComplete, onAbort) {
        historyState._save();
<% if (options.reloadable) { %>
        historyState._enter();
        if (typeof location === 'string') {
            location = { name: location };
        }
        location.query = {
            ...location.query,
            _p: String(historyState.page)
        };
<% } else { %>
        window.history.replaceState({
            ...window.history.state,
            page: historyState.page
        }, '');
        historyState._enter();
<% } %>
        return orgPush.call(router.history, location, onComplete, onAbort);
    };

    router.beforeEach((to, from, next) => {
<% if (options.reloadable) { %>
        let page = parseInt(to.query && to.query._p, 10);
        if (page == null || Number.isNaN(page)) {
            page = 0;
        }

        if (page !== historyState.page) {
            console.log('hpage', historyState.page);
            historyState._save();
            historyState._update(page);
        }
<% } %>
        historyState._route(to);
        next();
    });

    context.$historyState = historyState;
    inject('historyState', historyState);
};
