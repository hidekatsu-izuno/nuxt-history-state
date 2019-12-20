import Vue from 'vue';

class HistoryState {
    constructor() {
        this._dataFunc = null;
        this._unloadFunc = null;

        let backup = null;
        if (window.sessionStorage) {
            backup = sessionStorage.getItem('nuxt-history-state');
            sessionStorage.removeItem('nuxt-history-state');
        }
        if (backup) {
            try {
                this._state = JSON.parse(backup);
                if (!Number.isInteger(this._state.page)
                    || !Array.isArray(this._state.routes)
                    || !Array.isArray(this._state.datas)) {
                    throw new Error('Illegal history data');
                }
                this._action = 'reload';
            } catch (e) {
                console.error(e);
                this._state = null;
            }
        }
        if (!this._state) {
            this._state = {
                page: 0,
                routes: Array(1),
                datas: Array(1)
            };
            this._action = 'new';
        }

        window.addEventListener('popstate', e => {
            this._leave();

            let page = e.state && e.state.page;
            if (page == null) {
                page = this._state.datas.length - 1;
            }
        
            this._action = (page > this._state.page) ? 'forward' : 'back';
            this._state.page = page;
        });
    }

    get action() {
        return this._action;
    }

    get page() {
        return this._state.page;
    }

    get route() {
        return this._state.routes[this._state.page]
    }

    get data() {
        return this._state.datas[this._state.page];
    }

    _register(fn) {
        this._dataFunc = fn;
        this._unloadFunc = () => this._persist();
        window.addEventListener('unload', this._unloadFunc);
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
        this._state.routes[this._state.page] = {
            name: route.name,
            meta: { ...route.meta },
            path: route.path,
            hash: route.hash,
            query: { ...route.query },
            params: route.params,
            fullPath: route.fullPath
        };
    }

    _leave() {
        this._save();

        window.removeEventListener('unload', this._unloadFunc);
        this._unloadFunc = null;
        this._dataFunc = null;
    }

    _save() {
        const data = this._state.datas[this._state.page];
        const backupData = this._dataFunc && this._dataFunc();
        this._state.datas[this._state.page] = (data || backupData) ? {
            ...data,
            ...backupData
        } : null;
    }

    _persist() {
        if (this._dataFunc) {
            this._save();
        }
        sessionStorage.setItem('nuxt-history-state', JSON.stringify(this._state));
    }
}

const historyState = new HistoryState();

Vue.mixin({
    beforeMount() {
        let backupFn = null;
        if (typeof this.$options.backupData === 'function') {
            backupFn = () => this.$options.backupData.call(this);
        }
        historyState._register(backupFn);
    }
});

export default (context, inject) => {
    const router = context.app.router;
    
    const orgPush = router.history.push;
    router.history.push = function(location, onComplete, onAbort) {
        historyState._leave();
        window.history.replaceState({
            ...window.history.state,
            page: historyState.page
        }, '');
        historyState._enter();
        return orgPush.call(router.history, location, onComplete, onAbort);
    };

    router.beforeEach((to, from, next) => {
        historyState._route(to);
        next();
    });

    context.$historyState = historyState;
    inject('historyState', historyState);
};