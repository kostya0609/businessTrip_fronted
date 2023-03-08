<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>Просмотр задания № {{route.params.id}}, статус - {{MAP[taskStatus]}}.</h3>
      <returnButton/>
    </div>

    <el-tabs type="border-card" v-model="page">
      <el-tab-pane v-for="(item, key) in menu" :label="item" :name="key" :key="key">
      </el-tab-pane>
      <task             v-if="page === 'task'             && !loading" v-model:value="data.task"/>
      <dots             v-if="page === 'dots'             && !loading" v-model:value="data.dots"/>
      <route_sheet      v-if="page === 'route_sheet'      && !loading" v-model:value="data.route_sheet"/>
      <estimate         v-if="page === 'estimate'         && !loading" v-model:value="data.estimate"/>
      <business_process v-if="page === 'business_process' && !loading" :task="data.task"/>
      <logs             v-if="page === 'logs'             && !loading"/>
    </el-tabs>
    <br>
    <el-row style="justify-content: space-between" v-if="page != 'business_process' && page != 'logs'">
      <el-col :span="5">
        <el-button
            v-if="taskStatus == 'created' || taskStatus == 'fixing_problem'"
            class="add-edit-footer-button"
            @click="editTask"
        >
          Редактировать задание
        </el-button>

      </el-col>
      <el-col :span="5">
        <el-button
            v-if="changeEstimate"
            class="add-edit-footer-button"
            @click="saveEstimate"
        >
          Сохранить изменения в смете
        </el-button>
      </el-col>

    </el-row>
    <br/>
    <el-link href="https://bitrix.bsi.local/docs/shared/path/%D0%92%D0%9D%D0%94%D0%9A/%D0%92%D0%9D%D0%94%D0%9A%20%D0%BF%D0%BE%20%D0%9A%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8/%D0%9A%D0%9E%D0%A0%D0%9F/%D0%9F%D0%9E%D0%9B%D0%9E%D0%96%D0%95%D0%9D%D0%98%D0%AF%20%28%D0%9F%D0%A4%D0%A1%29/%D0%9F%D0%A4%D0%A1%20%D0%BE%20%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0%D1%85/" target="_blank" type="danger">Актуальная инструкцию (ПФС) и приложения</el-link>

  </div>
</template>
<script>
import {ref, inject, reactive, provide} from "vue";
import { useRouter, useRoute } from 'vue-router';
import returnButton from "@/components/return_button";
import task from "./components/task"
import dots from "./components/dots"
import route_sheet from "./components/route_sheet"
import estimate from "./components/estimate"
import logs from "./components/logs"
import business_process from "./components/business_process"
import {ElMessageBox} from "element-plus";

export default {
  name: "detailTaskIndex",
  components: {returnButton, task, dots, route_sheet, estimate, logs, business_process},
  setup(){
    const router          = useRouter();
    const route           = useRoute();

    const loadJson        = inject('loadJson');
    const svg             = inject('svg');
    const notify          = inject('notify');
    const user            = inject('user');
    const taskStatus      = inject('taskStatus');
    const MAP             = inject('MAP')

    const loading         = ref(false);
    const page            = ref('task');
    const menu            = reactive({
      task             : 'Задание',
      dots             : 'Точки посещения',
      route_sheet      : 'Маршрутный лист',
      estimate         : 'Смета',
      business_process : 'Бизнес-процесс',
      logs             : 'История',
    });

    const data            = reactive({
       task           : [],
       dots           : [],
       route_sheet    : [],
       estimate       : [],
       status         : '',
       total_estimate : null,
    });

    const costUnitList    = reactive([]);
    const changeEstimate  = ref(false);

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/tasks/detail', {task_id : route.params.id, user_id : user.id});
      if (result.status === 'success' && result.data) {
        Object.assign(data, result.data);
        if(!data.auto_travel) delete menu.route_sheet;
        data.estimate.push({sum : data.total_estimate})
        taskStatus.value = result.data.status;
      };

      if (data.status == 'created') {
        let result = await loadJson('/business-trip/cost-units/list', {});
        if (result.status === 'success' && result.data) {
          costUnitList.length = 0;
          result.data.costUnit.forEach(el => costUnitList.push(el));
        };
      }

      loading.value = false;
    };
    getData();

    async function editTask(){
      ElMessageBox.confirm(`Вы уверены, что хотите редактировать задание с ID - ${route.params.id}?`)
          .then(() => {
            router.push({name:'editTask', params: { id: route.params.id }});
          })
          .catch(() => {})
    };

    async function saveEstimate(){
      let estimate = [];
      let len = data.estimate.length;
      data.estimate.forEach((el, idx) => {if (idx != len - 1) estimate.push(el)})

      loading.value = true;
      let result = await loadJson('/business-trip/cost-units/edit', {
        task_id  : route.params.id,
        estimate,
        user_id  : user.id,
      });
      if (result.status === 'success') {
        changeEstimate.value = false;
      };
      notify('Сохранение сметы', result.message, result.status);
      loading.value = false;
    };

    provide('changeEstimate', changeEstimate);
    provide('costUnitList', costUnitList);

    return{
      loading, svg,  route, data, page, menu, changeEstimate, MAP, taskStatus,
      saveEstimate, editTask,
    }
  }
}
</script>