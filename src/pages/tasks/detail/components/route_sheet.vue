<template>
  <div>
    <br/>
    <el-table :data="value"  border max-height="500" stripe>
      <el-table-column prop="number" label="Номер" width="80px"/>
      <el-table-column prop="route" label="Населенный пункт"/>
      <el-table-column prop="type" label="Тип движения"/>
      <el-table-column prop="km_days" label="Км/Дни" width="165px"/>
      <el-table-column prop="gasoline" label="Стоимость бензина" width="165px"/>
      <el-table-column prop="sum" label="Сумма" width="165px"/>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "route_sheet",
  props : ['value'],
}
</script>

<style scoped>

</style>