import Vue from 'vue';
import isEqual from 'lodash-es/isEqual';
import isMatch from 'lodash-es/isMatch';

class HistoryState {
    constructor() {
        this._init();

        let backupState = null;
        if (window.sessionStorage) {
            backupState = sessionStorage.getItem('nuxt-history-state');
            sessionStorage.removeItem('nuxt-history-state');
        }
        if (backupState) {
            this._action = 'reload';
            this._state = JSON.parse(backupState);
        }

<% if (options.reloadable) { %>
        window.addEventListener('unload', e => {
            this._save();
            sessionStorage.setItem('nuxt-history-state', JSON.stringify(this._state));    
        });
<% } else { %>
        window.addEventListener('popstate', e => {
            this._save();

            let page = e.state && e.state.page;
            if (page == null) {
                page = this._state.datas.length - 1;
            }
            
            this._update(page);
        });
<% } %>
    }

    get action() {
        return this._action;
    }

    get page() {
        return this._state.page;
    }

    get route() {
        return this._state.routes[this._state.page];
    }

    get data() {
        return this._state.datas[this._state.page];
    }

    backIndexOf(route) {
        for (let pos = this._state.page - 1; pos >= 0; pos--) {
            const backRoute = this._state.routes[pos];
            if (isMatch(backRoute, route)) {
                return pos - this._state.page;
            }
        }
        return null;
    }

    _register(fn) {
        this._dataFunc = fn;
    }

    _enter() {
        this._action = 'push';
        this._state.page++;
        this._state.routes.length = this._state.page + 1;
        this._state.routes[this._state.page] = null;
        this._state.datas.length = this._state.page + 1;
        this._state.datas[this._state.page] = null;
    }

    _route(route) {
        const oldRoute = this._state.routes[this._state.page];
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
        this._state.routes[this._state.page] = newRoute;   
    }

    _init() {
        this._action = 'new';
        this._state = {
            page: 0,
            routes: Array(1),
            datas: Array(1)
        };
        this._dataFunc = null;
    }

    _update(page) {
        this._action = (page > this._state.page) ? 'forward' : 'back';
        this._state.page = page;
    }

    _save() {
        if (!this._dataFunc) {
            return;
        }

        const data = this._state.datas[this._state.page];
        const backupData = this._dataFunc();
        this._state.datas[this._state.page] = (data || backupData) ? {
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
