<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div style="padding: 15px">
      <el-row>
        <el-col :span="20">
          <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </el-col>
      </el-row>
      <br/>
      <el-table :data="costUnits" style="width: 100%" border max-height="600" stripe>
        <el-table-column prop="value" label="ID" width="70" />
        <el-table-column prop="label" label="Название"/>
        <el-table-column prop="name_unit" label="Наименование ед." width="130"/>
        <el-table-column prop="unit_price" label="Стоимость ед., руб" width="105"/>
        <el-table-column prop="limit_cost_unit" label="Лимит стоимости за ед., руб" width="150"/>
        <el-table-column prop="daily_allowance" label="Суточные" width="95">
          <template #default="scope">
            {{scope.row.daily_allowance ? 'Да' : 'Нет'}}
          </template>
        </el-table-column>

        <el-table-column label="Действие" width="110">
          <template #default="scope">
            <div v-if="scope.row.value != 5">
              <el-button
                  size="small"
                  type="info"
                  @click="costUnitEdit(scope.$index, scope.row)"
              >
                <el-icon><Setting /></el-icon>
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="costUnitDelete(scope.$index, scope.row)"
              >
                <el-icon><Remove /></el-icon>
              </el-button>
            </div>
            <div v-else>
              Запрещены
            </div>
          </template>
        </el-table-column>
      </el-table>
      <br/>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
      <br/>
      <p class="color-red">
        * ГСМ должен быть всегда ID = 5.
      </p>
    </div>

  </div>
</template>
<script>
import { Check, Close } from '@element-plus/icons-vue'
import {ref, inject, reactive, watch} from "vue";
import { useRouter, useRoute } from 'vue-router';
import {ElMessageBox} from "element-plus";

export default {
  name: "costUnitsIndex",

  setup(){
    const router       = useRouter();
    const route        = useRoute();

    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');
    const user         = inject('user');

    user.roles.indexOf('admin') >= 0 ? '' : router.push({name : 'listTasks'});

    const loading      = ref(false);
    const currentPage  = ref(1);
    const pageSize     = ref(10);
    const total        = ref(1000);
    const sort         = reactive({name : 'id', order : 'asc' });
    const costUnits    = reactive([]);

    const handleSizeChange = (val) => {
      pageSize.value = val;
      getData();
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      getData();
    }

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/cost-units/list', {count : pageSize.value, page : currentPage.value, sort, all_unit : 0});
      if (result.status === 'success' && result.data) {
        total.value = result.data.total;
        costUnits.length = 0;
        result.data.costUnit.forEach(el => {
          costUnits.push(el);
        })
      };
      loading.value = false;
    }
    getData();

    function costUnitEdit(idx, row){
      router.push({name:'editCostUnit', params: { id: row.value }});
    }

    function costUnitDelete(idx, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить статью расходов - ${row.label} ?`)
          .then(async () => {
            loading.value = true;
            let result = await loadJson('/business-trip/cost-units/delete', {cost_unit_id : row.value});
            loading.value = false;
            if (result.status === 'success') {
              costUnits.splice(idx, 1)
            };
            notify(`Удаление статьи расходов`, result.message, result.status);
          })
          .catch(() => {

          })
    }

    return{
      loading, svg, currentPage, pageSize, total, costUnits, Check, Close,
      handleSizeChange, handleCurrentChange, costUnitEdit, costUnitDelete, getData
    }
  }
}
</script>