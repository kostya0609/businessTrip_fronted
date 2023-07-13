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
        <el-col :span="4" align="right">
          <el-switch
              v-model="activeTargets"
              active-text="Актив."
              inactive-text="Не актив."
          />
        </el-col>
      </el-row>
      <br/>
      <el-table :data="targets" style="width: 100%" border max-height="600" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="Название"/>
        <el-table-column prop="description" label="Описание" />
        <el-table-column label="Активность" width="110">
          <template #default="scope">
            {{scope.row.active ? 'Да' : 'Нет'}}
          </template>
        </el-table-column>
        <el-table-column label="Действие" width="160">
          <template #default="scope">
            <el-button
                size="small"
                type="info"
                @click="targetEdit(scope.$index, scope.row)"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-switch
                v-model="scope.row.active"
                size="small"
                :active-icon="Check"
                :inactive-icon="Close"
                style="margin-left: 15px"
                @click="changeActive(scope.$index, scope.row)"
            />
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
    </div>

  </div>
</template>
<script>
import { Check, Close } from '@element-plus/icons-vue'
import {ref, inject, reactive, watch} from "vue";
import { useRouter, useRoute } from 'vue-router';
import {ElMessageBox} from "element-plus";

export default {
  name: "targetsIndex",

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
    const activeTargets= ref(true);
    const targets      = reactive([]);

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
      let result = await loadJson('/business-trip/targets/list', {count : pageSize.value, page : currentPage.value, sort, active : activeTargets.value ? 1 : 0});
      if (result.status === 'success' && result.data) {
        total.value = result.data.total;
        targets.length = 0;
        result.data.targets.forEach(el => {
          el.active = el.active == 1 ? true : false;
          targets.push(el);
        })
      };
      loading.value = false;
    }
    getData();

    function targetEdit(idx, row){
      router.push({name:'editTarget', params: { id: row.id }});
    }
    async function changeActive(idx, row){
      ElMessageBox.confirm(`Вы уверены, что хотите ${row.active ? ' активировать ' : ' дективировать '} цель - ${row.name} ?`)
          .then(async () => {
            loading.value = true;
            let result = await loadJson('/business-trip/targets/active', {target_id : row.id, user_id : user.id, active : row.active ? 1 : 0});
            if (result.status =='success') {
              targets.splice(idx, 1);
              total.value = total.value - 1;
            } else targets[idx].active = !targets[idx].active;
            loading.value = false;
            notify(`Деактивация цели`, result.message, result.status);
          })
          .catch(() => {
            targets[idx].active = !targets[idx].active;
          })
    }

    watch(
      () => activeTargets.value,
     (value) => {currentPage.value = 1; getData()}
    )

    return{
      loading, svg, currentPage, pageSize, total, targets, Check, Close, activeTargets,
      handleSizeChange, handleCurrentChange, targetEdit, changeActive, getData
    }
  }
}
</script>