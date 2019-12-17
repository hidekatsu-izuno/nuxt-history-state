import HistoryState from './HistoryState';

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