class HistoryState {
    constructor() {
        this._action = 'new';
        this._page = 0;
        this._items = Array(1);
        this._dataFunc = null;
        this._route = null;
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
}

export default (context, inject) => {
    const historyState = new HistoryState();
    context.$historyState = historyState;
    inject('historyState', historyState);
};
