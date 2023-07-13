<template>
  <div>
    <br/>
    <el-table :data="value"  border max-height="600" stripe :show-header="false">
      <el-table-column prop="name" />

      <el-table-column>
        <template #default="scope">
            <span v-html="scope.row.value"></span>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
export default {
  name  : "detailTasks",
  props : ['value'],
}
</script>

<style scoped>

</style>