<template>
    <div>
        <h1>Page 3</h1>
        <div>
            action: {{$historyState.action}}
        </div>
        <div>
            page: {{$historyState.page}}<br />
            items: <ul>
                    <li v-for="(item, index) in $historyState.getItems()" :key="index">{{item.data || 'null'}}</li>
                </ul>
        </div>
        <div>
            <input type="text" v-model="count" />
            <button type="button" @click="count++ % 1000">+1</button>
        </div>
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
    asyncData(context) {
        const backupData = context.$historyState.data;
        return { ...backupData };
    },
    data() {
        return {
            count: 100
        }
    },
    backupData() {
        return this.$data;
    }
}
</script>
