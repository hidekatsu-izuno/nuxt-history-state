interface NuxtHistoryStateRoute {
    path: string;
    name?: string;
    hash: string;
    query: { [key: string]: (string | (string | null)[]) };
    params: { [key: string]: string };
    fullPath: string;
    meta?: any;
}

interface NuxtHistoryStateRouteOption {
    path?: string;
    name?: string;
    hash?: string;
    query?: { [key: string]: (string | (string | null)[]) };
    params?: { [key: string]: string };
    fullPath?: string;
    meta?: any;
}

interface NuxtHistoryStateInstance {
    readonly action: string;
    readonly page: number;
    readonly route: NuxtHistoryStateRoute;
    readonly data: any;

    backIndexOf(route: NuxtHistoryStateRouteOption): number?;
}

declare module '@nuxt/types' {
    interface Context {
        $historyState: NuxtHistoryStateInstance;
    }
        
    interface NuxtAppOptions {
        $historyState: NuxtHistoryStateInstance;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $historyState: NuxtHistoryStateInstance;
    }
}