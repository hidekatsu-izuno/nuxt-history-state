interface NuxtHistoryStateRoute {
    path: string
    name?: string
    hash: string
    query: Dictionary<string | (string | null)[]>
    params: Dictionary<string>
    fullPath: string
    meta?: any
}

interface NuxtHistoryStateInstance {
    readonly action: string;
    readonly page: number;
    readonly route: NuxtHistoryStateRoute;
}

declare module '@nuxt/types' {
    interface Context {
        $historyState: NuxtHistoryStateInstance
    }
        
    interface NuxtAppOptions {
        $historyState: NuxtHistoryStateInstance
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $historyState: NuxtHistoryStateInstance
    }
}