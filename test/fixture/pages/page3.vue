<template>
    <div>
        <h1>Page 3</h1>
        <div>action: {{$historyState.action}}</div>
        <div>page: {{$historyState.page}}</div>
        <div>items: <ul v-if="isClient">
                    <li v-for="(item, index) in $historyState.getItems()" :key="index">{{item.data || 'null'}}</li>
                </ul></div>
        <div>asyncData: <input type="text" v-model="asyncDataCount" /></div>
        <div>data: <input type="text" v-model="dataCount" /></div>
        <div><button type="button" @click="add">+1</button></div>
        <div>
            <button type="button" @click="$router.go(-1)">Back</button>
        </div>
        <div>
            <button type="button" @click="$router.go($historyState.findBackPosition({ name: 'page1' }))">Back to page1</button>
        </div>
    </div>
</template>

<script>
export default {
    async asyncData({ $historyState }) {
        if ($historyState.action === 'navigate' || $historyState.action === 'push') {
            return {
                asyncDataCount: 0
            };
        }
        return {};
    },
    data() {
        return this.$historyState.data || {
            asyncDataCount: 0,
            dataCount: 0
        };
    },
    backupData() {
        return this.$data;
    },
    computed: {
        isClient() {
            return process.client;
        }
    },
    methods: {
        add() {
            this.asyncDataCount++;
            this.dataCount++;
            this.dataAndAsyncDataCount++;
        }
    }
}
</script>
