<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <br/>
    <el-row v-if="(taskStatus == 'created' || taskStatus == 'fixing_problem') && full_access">
      <el-col :span="9" style="padding-right: 15px">
        <label class="add-edit-detail-label">
          Статья расхода
        </label>
        <el-select
            v-model="costUnit.id"
            :class="['add-edit-element', {'invalid' : errors.id}]"
            placeholder="Выберите статью расхода"
        >
          <el-option
              v-for="item in costUnitList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value == 5 && isGSM"
          >
          </el-option>
        </el-select>
        <small v-if="errors.id">{{errors.id}}</small>
      </el-col>
      <el-col :span="6" style="padding-right: 15px">
        <label class="add-edit-detail-label">
          Количество
        </label>
        <el-input
            v-model="costUnit.count"
            :class="['add-edit-element', {'invalid' : errors.count}]"
            @change="costUnit.count = parseFloat(costUnit.count)"
            placeholder="Введите количество"
        >
        </el-input>
        <small v-if="errors.count">{{errors.count}}</small>
      </el-col>
      <el-col :span="6" style="padding-right: 15px">
        <label class="add-edit-detail-label">
          Стоимость еденицы
        </label>
        <el-input
            v-model="costUnit.price"
            :class="['add-edit-element', {'invalid' : errors.price}]"
            @change="costUnit.price = parseFloat(costUnit.price)"
            placeholder="Введите стоимость еденицы"
        >
        </el-input>
        <small v-if="errors.price">{{errors.price}}</small>
      </el-col>
      <el-col :span="3">
        <label><br/></label>
        <el-button
            :class="['add-edit-element']"
            @click="addCostUnit"
        >
          Добавить
        </el-button>
      </el-col>
    </el-row>
    <br/>
    <el-table :data="value"  border max-height="500" stripe>
      <el-table-column label="Номер" width="80px">
        <template #default="scope">
          {{value.length - 1 === scope.$index ? 'Всего' :  scope.$index + 1}}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Статья расходов" />
      <el-table-column prop="count" label="Количество" width="110px"/>
      <el-table-column prop="name_unit" label="Наименование еденицы" width="205px"/>
      <el-table-column prop="cost" label="Стоимость ед., руб." width="170px">
        <template #default="scope">
          {{scope.row.cost ? formatNumber(scope.row.cost) : ''}}
        </template>
      </el-table-column>
      <el-table-column prop="sum" label="Сумма, руб." width="130px">
        <template #default="scope">
          {{formatNumber(scope.row.sum)}}
        </template>
      </el-table-column>
      <el-table-column v-if="taskStatus === 'created' || taskStatus === 'fixing_problem'" width="70" align="center">
        <template #default="scope">
          <el-button
              v-if="scope.row.cost_id !== 5 && scope.$index !== value.length - 1"
              size="small"
              type="danger"
              @click="deleteCostUnit(scope.$index, scope.row)"
          >
            <el-icon><Minus/></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {ref, reactive, inject, watchEffect, watch, computed} from "vue";
import {ElMessageBox} from "element-plus";
import task from "@/pages/tasks/detail/components/task";

export default {
  name  : "estimate",
  props : ['value', 'count_days', 'total_cost', 'auto_travel'],
  setup(props){
    const loading        = ref(false);
    const loadJson       = inject('loadJson');
    const svg            = inject('svg');
    const changeEstimate = inject('changeEstimate');
    const costUnitList   = inject('costUnitList');
    const taskStatus     = inject('taskStatus');
    const formatNumber   = inject('formatNumber');
    const full_access    = inject('full_access');

    const costUnit       = reactive({
      id    : null,
      count : null,
      price : null,
    });

    const errors         = reactive({
      id    : null,
      count : null,
      price : null,
    });

    const isGSM          = computed(() => {
      return (!props.auto_travel || props.value.find( el => {return el.cost_id == 5})) ? true : false;
    })

    function isValid(){
      let valid = true;
      if(!costUnit.id)    { valid = false; errors.id    = 'Необходимо выбрать статью расхода'}
      if(!costUnit.count) { valid = false; errors.count = 'Необходимо указать количество'}
      if(!costUnit.price) { valid = false; errors.price = 'Необходимо указать стоимость еденицы'}
      return valid;
    };

    function addCostUnit(){
      if (!isValid()) return;
      changeEstimate.value = true;
      let obj = costUnitList.find(el => {
        if(el.value === costUnit.id) return el;
      });
      let name = obj.label, name_unit = obj.name_unit;
      let sum  = costUnit.count * costUnit.price;
      props.value[props.value.length - 1].sum = props.value[props.value.length - 1].sum + sum;

      props.value.splice(props.value.length - 1, 0, {
        cost_id : costUnit.id,
        number  : props.value.length,
        name,
        name_unit,
        count   : costUnit.count,
        cost    : costUnit.price,
        sum
      });

      costUnit.name = null; costUnit.count = null; costUnit.price = null;
    };

    function deleteCostUnit(index, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить статью расхода - ${row.name}?`)
          .then(() => {
            changeEstimate.value = true;
            props.value.splice(index, 1);
            props.value[props.value.length - 1].sum = props.value[props.value.length - 1].sum - row.sum;
          })
          .catch(() => {})
    };

    watch( [
      () => costUnit.count,
      () => costUnit.price,
      () => costUnit.id,
    ], (newValues, oldValues) => {
      newValues[0] ? costUnit.count = String(newValues[0]).replace(/[^\d.]/ig, '') : '';
      newValues[1] ? costUnit.price = String(newValues[1]).replace(/[^\d.]/ig, '') : '';

      if(newValues[2] !== oldValues[2]){
        let unit = costUnitList.find(el => {return el.value == newValues[2]});
        unit.unit_price ? costUnit.price = unit.unit_price : costUnit.price = null;
        costUnit.count = unit.daily_allowance  ? props.count_days : null;
      }
    });

    watchEffect(() => {
      costUnit.id    ? errors.id    = null : '';
      costUnit.count ? errors.count = null : '';
      costUnit.price ? errors.price = null : '';
    })

    return{
      loading, svg, costUnitList, costUnit, errors, taskStatus, full_access,
      addCostUnit, deleteCostUnit, isGSM, formatNumber,
    }
  },
}
</script>

<style scoped>

</style>