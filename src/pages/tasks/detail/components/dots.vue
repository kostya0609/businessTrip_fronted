<template>
  <div>
    <br/>
    <el-tabs tab-position="left" v-model="page" v-if="value.length > 0" class="cityTabs">
      <el-tab-pane v-for="(item, key) in value" :label="item.city_name" :name="key" :key="key" >
        <el-table
            :data="item.info"
            border max-height="800"
            :show-header="false"
        >
          <el-table-column prop="name" label="№"/>
          <el-table-column prop="value" label="Цель"/>
        </el-table>
        <br/>
        <el-table :data="item.targets"  border max-height="500" stripe>
          <el-table-column prop="number" label="№" width="70px"/>
          <el-table-column prop="target" label="Цель"/>
          <el-table-column prop="contractor" label="Контрагент"/>
          <el-table-column prop="comment" label="Комментарий" width="300px"/>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

import {ref} from "vue";

export default {
  name  : "detailDots",
  props : ['value'],
  setup(){
    const page = ref(0);

    return{
      page,
    }
  },
}
</script>

<style scoped>

</style>