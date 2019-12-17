import Vue from 'vue';

class HistoryState {
    constructor() {
        this._dataFunc = {};
        this._unloadFunc = {};

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
                    || !Array.isArray(this._state.histories)) {
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
                histories: Array(1)
            };
            this._action = 'new';
        }

        window.addEventListener('popstate', e => {
            this._leave();

            let page = e.state && e.state.page;
            if (page == null) {
                page = this._state.histories.length - 1;
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

    data(id = 'default') {
        return this._state.histories[this._state.page] &&
            this._state.histories[this._state.page][id];
    }

    register(id, fn) {
        if (id instanceof Vue || typeof id === 'function') {
            fn = id;
            id = 'default';
        }
        if (fn instanceof Vue) {
            this._dataFunc[id] = () => fn.$data;
        } else {
            this._dataFunc[id] = fn;
        }
        this._unloadFunc[id] = () => this._persist(id);
        window.addEventListener('unload', this._unloadFunc[id]);
    }

    _enter() {
        this._action = 'push';
        this._state.page++;
        this._state.routes.length = this._state.page + 1;
        this._state.histories.length = this._state.page + 1;
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
        for (let key in this._dataFunc) {
            this._save(key);
        }
        this._dataFunc = {};

        for (let key in this._unloadFunc) {
            if (this._unloadFunc.hasOwnProperty(key)) {
                window.removeEventListener('unload', this._unloadFunc[key]);
            }
        }
        this._unloadFunc = {};
    }

    _save(id = 'default') {
        let backData = this._dataFunc[id] && this._dataFunc[id]();
        if (!this._state.histories[this._state.page]) {
            this._state.histories[this._state.page] = {};
        }
        this._state.histories[this._state.page][id] = { ...backData };
        console.log('_save', backData);
    }

    _persist(id = 'default') {
        this._save(id);
        sessionStorage.setItem('nuxt-backstate', JSON.stringify(this._state));
    }
}

const historyState = new HistoryState();

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