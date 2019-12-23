
interface NuxtHistoryStateLocation {
    path: string;
    name?: string;
    hash: string;
    query: { [key: string]: (string | (string | null)[]) };
    params: { [key: string]: string };
    fullPath: string;
    meta?: any;
}

interface NuxtHistoryItem {
    location: NuxtHistoryStateLocation;
    data?: any;
}

interface NuxtHistoryStateLocationOption {
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
    readonly data: any;
    readonly length: number;
    
    getItem(page: number): NuxtHistoryItem?;

    findBackPosition(route: NuxtHistoryStateLocationOption): number?;
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