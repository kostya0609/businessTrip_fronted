<template>
  <div>
    <br/>
    <el-table :data="value"  border max-height="500" stripe>
      <el-table-column prop="number" label="#" width="80px"/>
      <el-table-column prop="route" label="Населенный пункт"/>
      <el-table-column prop="type" label="Тип движения" width="280px"/>
      <el-table-column prop="km_days" label="Км/Дни" width="100px"/>
      <el-table-column prop="gasoline" label="Стоимость бензина, руб." width="120px">
        <template #default="scope">
          {{scope.row.gasoline ? formatNumber(scope.row.gasoline) : ''}}
        </template>
      </el-table-column>
      <el-table-column prop="sum" label="Сумма, руб." width="150px">
        <template #default="scope">
          {{formatNumber(scope.row.sum)}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {inject} from 'vue'
export default {
  name  : "route_sheet",
  props : ['value'],
  setup(){
    const formatNumber   = inject('formatNumber');

    return{
      formatNumber
    }
  },
}
</script>

<style scoped>

</style>