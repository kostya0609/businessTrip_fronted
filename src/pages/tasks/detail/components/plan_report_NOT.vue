<template>
  <div>
    <h4>План-отчет по командировке</h4>
    <el-table :data="tableData_1"  border max-height="500" stripe :show-header="false">
      <el-table-column prop="name" width="300px"/>
      <el-table-column prop="value" />
    </el-table>
    <br/>
    <el-table :data="tableData_2"  border max-height="500" stripe v-if="false">
      <el-table-column prop="id" label='#' width="35px"/>
      <el-table-column label="Наименование головного контрагента" width="300px"/>
      <el-table-column label="Канал сбыта" width="115px"/>
      <el-table-column label="Группа" width="90px"/>
      <el-table-column label="Кол-во ТТ" width="100px"/>
      <el-table-column label="Общее SKU" width="110px"/>
      <el-table-column label="Общие продажи последние 3 месяца, тыс.руб" width="290px"/>
      <el-table-column label="Потенциал клиента, млн.руб.мес" width="170px"/>
      <el-table-column label="Задачи для визита" />
    </el-table>
  </div>
</template>

<script>
import {inject, ref, reactive} from 'vue'
export default {
  name  : "plan_report_NOT",
  props : ['value', 'total_cost'],
  setup(props){
    const formatNumber = inject('formatNumber');

    const tableData_1       = reactive([]);
    const tableData_2       = reactive([]);

    tableData_1.push({ 'name' : 'Организация',                  value : props.value.company});
    tableData_1.push({ 'name' : 'Маршрут',                      value : props.value.route});
    tableData_1.push({ 'name' : 'Подразделение',                value : props.value.department});
    tableData_1.push({ 'name' : 'Должность, ФИО',               value : props.value.FIO});
    tableData_1.push({ 'name' : 'Период',                       value : props.value.period});
    tableData_1.push({ 'name' : 'Города посещения',             value : props.value.dots});
    tableData_1.push({ 'name' : 'Цель командировки',            value : props.value.target});
    tableData_1.push({ 'name' : 'Общая стоимость командировки', value : formatNumber(props.total_cost)});

    tableData_2.push({
      id : 1,
    });

    return{
     tableData_1, tableData_2
    }
  },
}
</script>

<style scoped>

</style>
