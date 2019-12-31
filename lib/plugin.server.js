import url from 'url';

const reloadable = Boolean('<%= !!options.reloadable %>');

class HistoryState {
    constructor(req) {
        this._action = 'navigate';
        this._page = 0;
        this._items = Array(1);
        this._dataFunc = null;
        this._route = null;

        if (reloadable) {
            if (req && req.url) {
                const qpage = url.parse(req.url, true).query['_p'];
                if (qpage && !Array.isArray(qpage)) {
                    const page = Number.parseInt(qpage, 10);
                    if (page != null && !Number.isNaN(page)) {
                        this._page = page;
                        this._action = 'reload';
                    }
                }
            }
        } else {
            if (req && req.headers) {
                const cacheControl = req.headers['cache-control'] || 
                    req.headers['pragma'];
                if (/^(no-cache|max-age=0)$/.test(cacheControl)) {
                    this._action = 'reload';
                }
            }
        }
    }

    get action() {
        return this._action;
    }

    get page() {
        return this._page;
    }

    get data() {
        return null;
    }

    get length() {
        throw new Error('length is not supported on server.');
    }

    getItem(page) {
        throw new Error('getItem is not supported on server.');
    }

    getItems() {
        throw new Error('getItems is not supported on server.');
    }

    findBackPosition(location) {
        throw new Error('findBackPosition is not supported on server.');
    }
}

export default (context, inject) => {
    const historyState = new HistoryState(context.req);
    context.$historyState = historyState;
    inject('historyState', historyState);
};
