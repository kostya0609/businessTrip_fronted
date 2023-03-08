<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>{{route.name === 'addTask' ? 'Создание новой' : 'Редактирование'}} командировки{{route.name === 'editTask' ? ` c ID  - ${route.params.id}.` : '.'}}</h3>
      <returnButton/>
    </div>
    <el-tabs type="border-card" v-model="page">
      <el-tab-pane name="user" key="user">
        <template #label >
          <span :class="{'tab_red' : errors.user_tab}">
            <span>Информация о пользователе</span>
          </span>
        </template>
        <user v-if="page === 'user' && !loading" v-model:value="task"/>
      </el-tab-pane>
      <el-tab-pane name="trip" key="trip">
        <template #label>
          <span :class="[{'tab_red' : errors.trip_tab}]">
            <span>Информация о поездке</span>
          </span>
        </template>
        <trip v-if="page === 'trip' && !loading" v-model:value="task"/>
      </el-tab-pane>
      <el-tab-pane name="dots" key="dots">
        <template #label>
          <span :class="[{'tab_red' : errors.dots_tab}]">
            <span>Точки посещения</span>
          </span>
        </template>
        <dots v-if="page === 'dots' && !loading" v-model:value="task"/>
      </el-tab-pane>
    </el-tabs>
    <br/>
    <el-row>
      <el-col :span="5">
        <el-button
            class="add-edit-footer-button"
            @click="saveTask"
        >
          {{route.name === 'addTask' ? 'Создать' : 'Изменить'}} командировку
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import returnButton from "../../../components/return_button";
import user from "./components/user";
import trip from "./components/trip";
import dots from "./components/dots";
import {ref, inject, reactive, provide, computed, watchEffect, watch} from "vue";
import { useRouter, useRoute } from 'vue-router';

export default {
  name: "addTaskIndex",
  components: {returnButton, user, trip, dots},

  setup(){
    const router       = useRouter();
    const route        = useRoute();

    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');

    const user         = inject('user');

    const page         = ref('user');

    const loading      = ref(false);

    const task         = reactive({
      responsible_id   : user.id,
      responsible_list : [{value : user.id, label : user.fio}],
      company_id       : user.company.id,
      company_list     : [{value : user.company.id, label : user.company.name}],
      department_id    : user.department.id,
      department_list  : [{value : user.department.id, label : user.department.name}],
      position         : user.position,
      checking_account : null,
      comment          : null,
      city_start_id    : null,
      city_start_list  : [],
      city_final_id    : null,
      city_final_list  : [],
      date_start       : null,
      date_final       : null,
      auto_travel      : false,
      mark             : null,
      model            : null,
      number           : null,
      gasoline         : null,
      back_distance    : null,
      document_link    : null,
      dots             : [],
      files            : {
        agreementList    : [],
        agreementFile    : null,
        agreementId      : null,

        vicariousList    : [],
        vicariousFile    : null,
        vicariousId      : null,
      },
    });

    const targetsList  = reactive([]);

    async function getTargets(){
      loading.value = true;
      let result = await loadJson('/business-trip/targets/get', {});
      if (result.status === 'success' && result.data) {
        targetsList.length = 0;
        result.data.forEach(el => targetsList.push(el));
      };
      loading.value = false;
    };
    getTargets();

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/tasks/get', {task_id : route.params.id, user_id : user.id});
      if (result.status === 'success' && result.data) {
        result.data.auto_travel = result.data.auto_travel ? true : false;
        Object.assign(task, result.data)
      };
      loading.value = false;
    };

    if(route.name === 'editTask') getData();

    const errors       = reactive({
      responsible_id   : null,
      company_id       : null,
      department_id    : null,
      position         : null,
      checking_account : null,
      city_start_id    : null,
      city_final_id    : null,
      date_start       : null,
      date_final       : null,
      date_final_bad   : null,
      mark             : null,
      model            : null,
      number           : null,
      gasoline         : null,
      back_distance    : null,
      agreementFile    : null,
      vicariousFile    : null,
      dots             : null,
      dotsData         : null,
      user_tab         : false,
      trip_tab         : false,
      dots_tab         : false,
    });

    function validation(){
      let valid = true;
      //ниже валидация вкладки user
      if (!task.responsible_id)     {valid = false; errors.responsible_id    = 'Необходимо указать ответственного!'};
      if (!task.company_id)         {valid = false; errors.company_id        = 'Необходимо указать организацию!'};
      if (!task.department_id)      {valid = false; errors.department_id     = 'Необходимо указать подразделение!'};
      if (!task.position)           {valid = false; errors.position          = 'Необходимо указать должность!'};
      if (!task.checking_account)   {valid = false; errors.checking_account  = 'Необходимо указать расчетный счет!'};
      //ниже валидация вкладки trip
      if (!task.city_start_id)      {valid = false; errors.city_start_id     = 'Необходимо указать город выезда!'};
      if (!task.city_final_id)      {valid = false; errors.city_final_id     = 'Необходимо указать город возврата!'};
      if (!task.date_start)         {valid = false; errors.date_start        = 'Необходимо указать дату выезда!'};
      if (!task.date_final)         {valid = false; errors.date_final        = 'Необходимо указать дату возврата!'};
      if (task.date_start && task.date_final) {
        if (Number(task.date_final.split('.').reverse().join('')) - Number(task.date_start.split('.').reverse().join('')) < 0) {
          valid = false; errors.date_final_bad = 'Дата возврата не может быть раньше даты выезда!';
        }
      }
      if (task.auto_travel){
        if (!task.mark)                           {valid = false; errors.mark          = 'Необходимо указать Марку авто!'};
        if (!task.model)                          {valid = false; errors.model         = 'Необходимо указать Модель авто!'};
        if (!task.number)                         {valid = false; errors.number        = 'Необходимо указать Гос. номер!'};
        if (!task.gasoline)                       {valid = false; errors.gasoline      = 'Необходимо указать Стоимость 1л. бензина!'};
        if (!task.back_distance)                  {valid = false; errors.back_distance = 'Необходимо указать Км до точки возврата!'};
        if (task.files.agreementList.length == 0) {valid = false; errors.agreementFile = 'Необходимо прикрепить соглашение об использовании автомобиля в личных целях!'};
        if (task.files.vicariousList.length == 0) {valid = false; errors.vicariousFile = 'Необходимо прикрепить доверенность!'};
      };
      //ниже валидация вкладки dots
      if (task.dots.length == 0)    {valid = false; errors.dots = 'Необходимо добавить хотя бы один посещаемый город !'}
        else {
          let messages = [];
          task.dots.forEach(dot => {
            if (!dot.days)                         {valid = false; messages.push(`- количество дней прибывания в городе ${dot.city.name} (${dot.city.region}).`); errors.dotsData = [...messages];}
            if (task.auto_travel && !dot.distance) {valid = false; messages.push(`- количество Км до города ${dot.city.name} (${dot.city.region}).`); errors.dotsData = [...messages];}
            if (!dot.sort)                         {valid = false; messages.push(`- сортировку для города ${dot.city.name} (${dot.city.region}).`); errors.dotsData = [...messages];}
            if (dot.targets.length == 0)           {valid = false; messages.push(`- хотя бы одну цель прибывания в городе ${dot.city.name} (${dot.city.region}).`); errors.dotsData = [...messages];}
              else {
                dot.targets.forEach((target, idx) => {
                  if (!target.target_id)  {valid = false; messages.push(`- конкретную цель посещения №${idx +1} в городе ${dot.city.name} (${dot.city.region}).`); errors.dotsData = [...messages];}
                  if (!target.contractor) {valid = false; messages.push(`- контрагента для цели №${idx +1} в городе ${dot.city.name} (${dot.city.region}).`); errors.dotsData = [...messages];}
                  if (!target.sort)       {valid = false; messages.push(`- сортировку для цели №${idx +1} в городе ${dot.city.name} (${dot.city.region}).`); errors.dotsData = [...messages];}
                })
            }
          })
        };

      if(!valid) notify('Ошибка заполнения формы','Проверте заполнение обязательных полей. Обратите внимание на вкладки, выделенные красным цветом!','error');
      return valid;
    }

    async function saveTask(){
      if (!validation()) return;

      let taskToSend = {
        task_id     : route.params.id ? route.params.id : null,
        user_id     : user.id,
        auto_travel : task.auto_travel ? 1 : 0,
      };
      for (let key in task){
        if( key !== 'responsible_list' &&
            key !== 'company_list' &&
            key !== 'department_list' &&
            key !== 'city_start_list' &&
            key !== 'city_final_list' &&
            key !== 'auto_travel' &&
            key !== 'files'
        ) taskToSend[key] = task[key]
      }
      let data = new FormData();
      data.append('data', JSON.stringify(taskToSend));

      if(task.auto_travel) {
        task.files.agreementFile ? data.append('agreement_file',    task.files.agreementFile.raw) : '';
        task.files.agreementId   ? data.append('agreement_file_id', task.files.agreementId) : '';
        task.files.vicariousFile ? data.append('vicarious_file',    task.files.vicariousFile.raw) : '';
        task.files.vicariousId   ? data.append('vicarious_file_id', task.files.vicariousId) : '';
      }

      let url = route.name === 'addTask' ? '/business-trip/tasks/create' : '/business-trip/tasks/edit';
      loading.value = true;
      let result = await loadJson(url, data, 'file');
      loading.value = false;

      if (result.status === 'success') router.push({name:'listTasks' });

      notify('Сохранение командировки', result.message, result.status);
    }

    provide('errors', errors);
    provide('targetsList', targetsList);

    watch( [
      () => task.auto_travel,
      task.dots,
      () => task.checking_account,
      () => task.back_distance,
      () => task.gasoline
    ], (newValues, oldValues) => {
      if (oldValues[0] && !newValues[0]) {
        errors.mark          = null;
        errors.model         = null;
        errors.number        = null;
        errors.gasoline      = null;
        errors.back_distance = null;
        errors.agreementFile = null;
        errors.vicariousFile = null;
      };
      newValues[1] ? errors.dotsData = null : '';
      newValues[2] ? task.checking_account = String(newValues[2]).replace(/[^\d.]/ig, '') : '';
      newValues[3] ? task.back_distance    = String(newValues[3]).replace(/[^\d.]/ig, '') : '';
      newValues[4] ? task.gasoline         = String(newValues[4]).replace(/[^\d.]/ig, '') : '';
    });

    watchEffect(() => {
      task.responsible_id   ? errors.responsible_id   = null : '';
      task.company_id       ? errors.company_id       = null : '';
      task.department_id    ? errors.department_id    = null : '';
      task.position         ? errors.position         = null : '';
      task.checking_account ? errors.checking_account = null : '';
      task.city_start_id    ? errors.city_start_id    = null : '';
      task.city_final_id    ? errors.city_final_id    = null : '';
      task.date_start       ? errors.date_start       = null : '';
      task.date_final       ? errors.date_final       = null : '';
      task.date_final       ? errors.date_final_bad   = null : '';
      task.mark                       ? errors.mark          = null : '';
      task.model                      ? errors.model         = null : '';
      task.number                     ? errors.number        = null : '';
      task.gasoline                   ? errors.gasoline      = null : '';
      task.back_distance              ? errors.back_distance = null : '';
      task.files.agreementList.length ? errors.agreementFile = null : '';
      task.files.vicariousList.length ? errors.vicariousFile = null : '';
      task.dots.length                ? errors.dots          = null : '';
      errors.user_tab = (errors.responsible_id || errors.company_id || errors.department_id || errors.position || errors.checking_account) ? true : false;
      errors.trip_tab = (errors.city_start_id || errors.city_final_id || errors.date_start || errors.date_final ||
      (task.auto_travel && (errors.mark || errors.model || errors.number || errors.gasoline || errors.back_distance || errors.agreementFile || errors.vicariousFile))) ? true : false;
      errors.dots_tab = (errors.dots || errors.dotsData) ? true : false;
    })

    return{
      loading, svg, page, route, task, errors,
      saveTask
    }
  }
}
</script>