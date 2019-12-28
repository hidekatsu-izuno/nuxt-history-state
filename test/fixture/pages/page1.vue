<template>
    <div>
        <h1>Page 1</h1>
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
            <button type="button" @click="count++ % 10">+1</button>
        </div>
        <div>
            <button type="button" @click="$router.push({ name: 'page2' })">Page 2</button>
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
            count: 1
        }
    },
    backupData() {
        return this.$data;
    }
}
</script>
