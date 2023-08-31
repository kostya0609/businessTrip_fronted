<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>Просмотр задания № {{route.params.id}}, статус - {{MAP[taskStatus]}}, режим - {{!full_access ? 'только просмотр' : 'полный доступ '}}.</h3>
      <returnButton class="no-print"/>
    </div>

    <el-tabs type="border-card" v-model="page">
      <el-tab-pane v-for="(item, key) in menu" :label="item" :name="key" :key="key">
      </el-tab-pane>
      <task             v-if="page === 'task'             && !loading" :value="data.task"/>
      <dots             v-if="page === 'dots'             && !loading" :value="data.dots"/>
      <route_sheet      v-if="page === 'route_sheet'      && !loading" :value="data.route_sheet"/>
      <estimate         v-if="page === 'estimate'         && !loading"
                        v-model:value="data.estimate"
                        :count_days="data.count_days"
                        :auto_travel="data.auto_travel"
      />
      <business_process
        v-if="page === 'business_process' && !loading"
        :value="data.task"
        :dots="data.dots"
        :over_budget="data.over_budget"
        :over_budget_approving="data.over_budget_approving"
      />
      <logs             v-if="page === 'logs'             && !loading"/>
      <data_link_doc    v-if="page === 'data_link_doc'    && !loading" :value="data.data_link_doc"/>
      <additional_files v-if="page === 'additional_files' && !loading" v-model:value="data.additional_files"/>
      <plan_report_not  v-if="page === 'plan_report_not'  && !loading" :value="data.plan_report_not" :total_cost="data.estimate[data.estimate.length - 1].sum"/>
    </el-tabs>
    <br>
    <el-row  v-if="page == 'estimate'" style="justify-content: space-between" >
      <el-col :span="5">
        <el-button
            class="add-edit-footer-button"
            @click="getDocument"
        >
          Скачать документы
        </el-button>
      </el-col>
      <el-col :span="5">
        <el-button
            v-if="changeEstimate && full_access"
            class="add-edit-footer-button"
            @click="saveEstimate"
        >
          Сохранить изменения в смете
        </el-button>
      </el-col>
    </el-row>

    <el-row
      v-if="(page == 'task' || page == 'dots' || page == 'route_sheet') && full_access"
    >
      <el-col :span="5"
        v-if="taskStatus == 'created' || taskStatus == 'fixing_problem'"
      >
        <el-button
          class="add-edit-footer-button"
          @click="editTask"
        >
          Редактировать задание
        </el-button>
      </el-col>

      <el-col :span="5"
        v-if="taskStatus == 'working'"
        class="el-col-padding-right-15"
      >
        <el-button
          class="add-edit-footer-button"
          @click="reportApproving"
        >
          Утверждение отчета
        </el-button>
      </el-col>

      <el-col :span="5"
        v-if="taskStatus == 'working'"
        class="el-col-padding-right-15"
      >
        <el-button
          type="danger"
          class="add-edit-footer-cancel-button"
          @click="cancelTask"
        >
          Аннулировать задание
        </el-button>
      </el-col>

      <el-col :span="14"
              v-if="taskStatus == 'working'"
      >
        <el-input
            v-model="data.cancel_comment"
            :class="[{'invalid' : errors.cancel_comment}]"
            type="textarea"
            :autosize="{minRows: 2, maxRows: 4}"
            placeholder="Укажите причину аннулирования"
        >
        </el-input>
        <small v-if="errors.cancel_comment">{{errors.cancel_comment}}</small>

      </el-col>

      <el-col :span="5"
              v-if="taskStatus == 'report_approving'"
              class="el-col-padding-right-15"
      >
        <el-button
            class="add-edit-footer-button"
            @click="completeTask"
        >
          Выполнить задание
        </el-button>
      </el-col>

    </el-row>

    <el-row
      v-if="(page == 'task' || page == 'dots' || page == 'route_sheet') && full_access"
    >
      <el-col :span="24">
        <strong><p
          v-if="CED_elements.status_not_complete"
          class="color-red"
        >
          {{CED_elements.err_text}}
        </p></strong>
        <p
          v-if="CED_elements.status_not_complete"
          v-for="element in CED_elements.err_elements"
          :key="element.ID"
        >
        <el-link
          :href="'/services/workflow/' + element.PROPERTY_762 ? '78' : '63' + '/element_view/0/' + element.ID + '/'"
          target="_blank"
        >
          <strong>Поручение(ознакомление) в СЭД, которые не дают изменить статус задания - {{element.NAME}}.</strong>
        </el-link>
        </p>
      </el-col>
    </el-row>

    <el-link
      class="no-print"
      href="/docs/shared/path/%D0%92%D0%9D%D0%94%D0%9A/%D0%92%D0%9D%D0%94%D0%9A%20%D0%BF%D0%BE%20%D0%9A%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8/%D0%9A%D0%9E%D0%A0%D0%9F/%D0%9F%D0%9E%D0%9B%D0%9E%D0%96%D0%95%D0%9D%D0%98%D0%AF%20%28%D0%9F%D0%A4%D0%A1%29/%D0%9F%D0%A4%D0%A1%20%D0%BE%20%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0%D1%85/"
      target="_blank"
      type="danger"
      style="margin-top: 25px"
    >
      Актуальная инструкцию (ПФС) и приложения
    </el-link>
  </div>
</template>
<script>
import {ref, inject, reactive, provide, watchEffect, watch} from "vue";
import { useRouter, useRoute } from 'vue-router';
import returnButton from "@/components/return_button";
import task from "./components/task"
import dots from "./components/dots"
import route_sheet from "./components/route_sheet"
import estimate from "./components/estimate"
import logs from "./components/logs"
import business_process from "./components/business_process"
import data_link_doc from "./components/data_link_doc"
import additional_files from "./components/additional_files"
import plan_report_not from "./components/plan_report_NOT"

import {ElMessageBox} from "element-plus";

export default {
  name: "detailTaskIndex",
  components: {returnButton, task, dots, route_sheet, estimate, logs, business_process, data_link_doc, additional_files, plan_report_not},
  setup(){
    const router          = useRouter();
    const route           = useRoute();

    const loadJson        = inject('loadJson');
    const svg             = inject('svg');
    const notify          = inject('notify');
    const user            = inject('user');
    const taskStatus      = inject('taskStatus');
    const full_access     = inject('full_access');
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
      data_link_doc    : 'Документы в СЭД',
      additional_files : 'Дополнительные файлы',
      plan_report_not  : 'План-отчет НОТ',
    });

    const data            = reactive({
       auto_travel           : 0,
       task                  : [],
       dots                  : [],
       route_sheet           : [],
       estimate              : [],
       data_link_doc         : [],
       additional_files      : {
         file          : [],
         file_save     : [],
         file_exists   : [],
         filesChange   :false,
       },
       plan_report_not       : [],
       count_days            : null,
       total_estimate        : null,
       cancel_comment        : null,
       full_access           : 0,
       over_budget           : 0,
       over_budget_approving : [],
    });

    const errors          = reactive({
      cancel_comment : null,
    });

    const costUnitList    = reactive([]);
    const changeEstimate  = ref(false);

    if(route.params.page && menu[route.params.page]){
      page.value = route.params.page;
    }

    const CED_elements = reactive ({
      elements            : [],
      err_elements        : [],
      error               : false,
      status_not_complete : false,
      err_text            : '',
    })

    const isAdmin  = ref( user.roles.indexOf('admin') >= 0 ? true : false);

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/tasks/detail', {task_id : route.params.id, user_id : user.id});

      if (result.status === 'success' && result.data) {
        Object.assign(data, result.data);
        if(!data.auto_travel) delete menu.route_sheet;
        data.estimate.push({sum : data.total_estimate})
        taskStatus.value = result.data.status;
        data.additional_files.filesChange = false;
      } else {
        //ниже если перешли в не санкционированно перешли в командировку и получили пустую дату, то выкинуть в общий список
        //или иные проблемы
          router.push({name : 'listTasks'})
          return;
      }

      if(full_access.value !== data.full_access) full_access.value = data.full_access;

      if (data.status === 'created' || data.status === 'fixing_problem') {
        let result = await loadJson('/business-trip/cost-units/list', {all_unit  : 1});
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

    async function getDocument(){
      loading.value = true;
      await getReportDoc();
      await getEstimateDoc();
      if (data.auto_travel) await getRouteDoc();
      loading.value = false;
    };

    async function getRouteDoc(){
      loading.value = true;
      try {
        let result = await loadJson('/business-trip/document/get', {task_id : route.params.id, user_id : user.id, type_file : 'ml'}, '', true);
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = 'Маршрутный лист задания ID_' + route.params.id;
        link.click();
        URL.revokeObjectURL(link.href);

        let deleteFile = await loadJson('/business-trip/document/delete', {task_id : route.params.id, user_id : user.id, file_name : 'ml'});

      }catch(e){
        notify('Ошибка загрузки файла', e.message, 'error')
      }
      loading.value = false;
    };

    async function getEstimateDoc(){
      loading.value = true;
      try {
        let result = await loadJson('/business-trip/document/get', {task_id : route.params.id, user_id : user.id, type_file : 'smeta'}, '', true);
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = 'Смета задания ID_' + route.params.id;
        link.click();
        URL.revokeObjectURL(link.href);

        let deleteFile = await loadJson('/business-trip/document/delete', {task_id : route.params.id, user_id : user.id, file_name : 'smeta'});
      }catch(e){
        notify('Ошибка загрузки файла', e.message, 'error')
      }
      loading.value = false;
    };

    async function getReportDoc(){
      loading.value = true;
      try {
        let result = await loadJson('/business-trip/document/get', {task_id : route.params.id, user_id : user.id, type_file : 'otchet'}, '', true);
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = 'Отчет по заданию ID_' + route.params.id;
        link.click();
        URL.revokeObjectURL(link.href);

        let deleteFile = await loadJson('/business-trip/document/delete', {task_id : route.params.id, user_id : user.id, file_name : 'otchet'});
      }catch(e){
        notify('Ошибка загрузки файла', e.message, 'error')
      }
      loading.value = false;
    };

    async function saveEstimate(){
      let estimate = [];
      let len = data.estimate.length;
      data.estimate.forEach((el, idx) => {if (idx != len - 1) estimate.push(el)})

      loading.value = true;
      let result = await loadJson('/business-trip/cost-units/estimate-edit', {
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

    async function getElementsCED(){
      CED_elements.error = false;
      CED_elements.status_not_complete = false;

      CED_elements.elements = [];
      CED_elements.err_elements = [];
      CED_elements.err_text = '';

      let elements = [];

      //получить поручения и ознакомления у этого задания
      loading.value = true;
      let result = await loadJson('/business-trip/work-follow/get', {task_id : route.params.id});
      loading.value = false;
      if(result.status === 'success' && result.data) elements.push(...result.data)

      //получаем поручения с СЭД
      if (elements.length > 0) {
        loading.value = true;
        for await (let el of elements) {
          let IBLOCK_ID = el.IBLOCK_ID ? el.IBLOCK_ID : 78;
          let result = await loadJson('/local/rest/element/get/', {
            ID            : el.ID,
            IBLOCK_ID,
            PROPERTIES_ID : IBLOCK_ID == 78 ? [762] : [379],
          }, '', '', true);

          if (result.status == 'success' && result.element) {
            CED_elements.elements.push(result.element);
          } else {
            CED_elements.error = true;
            notify('Получение статусов поручений командировочного задания в СЭД', result.message, 'error');
            return;
          }
        }
        loading.value = false;

      }else{
        CED_elements.error = true;
        notify('Получение статусов командировочного задания в СЭД', 'Не найдено ни одного поручения в СЭД по данному командировочному заданию.', 'error');
        return;
      }
    };

    function reportApproving(){
      ElMessageBox.confirm(`Вы уверены, что хотите перевести командировочное задание с ID - ${route.params.id} на этап утверждения отчета и изменить его статус на "На утверждении отчета" ?`)
          .then(async () => {
            loading.value = true;
            let result = await loadJson('/business-trip/change-status', {
              task_id : route.params.id,
              user_id : user.id,
              status  : 'report_approving',
            });
            loading.value = false;

            if (result.status == 'success') {
              taskStatus.value = 'report_approving';
            }
            notify('Изменение статуса командировочного задания', result.message, result.status);


          })
          .catch(() => {})
    };

    function completeTask(){
      ElMessageBox.confirm(`Вы уверены, что хотите выполнить командировочное задание с ID - ${route.params.id} и изменить его статус на "Выполнено" ?`)
          .then(async () => {

            await getElementsCED();

            if (!CED_elements.error ){

              CED_elements.elements.forEach(el => {
                if(el.PROPERTY_762 != 2504896){
                  CED_elements.status_not_complete = true;
                  CED_elements.err_elements.push(el);
                }
              });

              if(CED_elements.status_not_complete) {
                CED_elements.err_text = `Не возможно выполнить командировочное задание с ID - ${route.params.id} и изменить его статус на Выполнено, так как в СЭД есть не выполненные поручения`;
                notify('Изменение статуса командировочного задания', `Не возможно изменить статус командировочного задания, так как в СЭД есть не выполненные поручения.`, 'error');
                setTimeout(() => {window.scrollTo(0,15000)},0);
                return;
              };

              loading.value = true;
              let result = await loadJson('/business-trip/change-status', {
                task_id : route.params.id,
                user_id : user.id,
                status  : 'completed',
              });
              loading.value = false;

              if (result.status == 'success') {
                taskStatus.value = 'completed';
              }
              notify('Изменение статуса командировочного задания', result.message, result.status);

            }else{
              notify('Изменение статуса командировочного задания', 'Не возможно изменить статус командировочного задания, так как произошла ошибка с получением информации о поручениях в СЭД', 'error');
            }

          })
          .catch(() => {})
    };

    function cancelTask(){
      if (!data.cancel_comment) {
        errors.cancel_comment = 'Необходимо обязательно указать причину аннулирования коммандировочного задания!';
        return
      }

      ElMessageBox.confirm(`Вы уверены, что хотите аннулировать командировочное задание с ID - ${route.params.id} и изменить его статус на "Аннулировано" ?`)
          .then(async () => {
            await getElementsCED();

            if (!CED_elements.error ){

              CED_elements.elements.forEach(el => {
                if(el.PROPERTY_762 && el.PROPERTY_762 != 5444192 || el.PROPERTY_379 && el.PROPERTY_379 != 3494909){
                  CED_elements.status_not_complete = true;
                  CED_elements.err_elements.push(el);
                }
              });

              if(CED_elements.status_not_complete) {
                CED_elements.err_text = `Не возможно аннулировать командировочное задание с ID - ${route.params.id} и изменить его статус на "Аннулировано", так как в СЭД некоторые поручения/ознакомление уже были выполнены.`;
                notify('Изменение статуса командировочного задания', `Не возможно изменить статус командировочного задания, так как в СЭД некоторые поручения/ознакомления уже были выполнены.`, 'error');
                setTimeout(() => {window.scrollTo(0,15000)},0);
                return;
              };

              console.log(CED_elements);

              loading.value = true;
              for await (let el of CED_elements.elements){
                let result = await loadJson('/local/rest/element/setpropertyterminateprocess/', {
                  IBLOCK_ID     : el.PROPERTY_762 ? 78 : 63,
                  ID            : el.ID,
                  PROPERTY_CODE : 'STATE',
                  VALUE         : 2504897,
                }, '', '', true);
              }

              let result = await loadJson('/business-trip/change-status', {
                task_id        : route.params.id,
                user_id        : user.id,
                status         : 'canceled',
                cancel_comment : data.cancel_comment,
              });
              loading.value = false;

              if (result.status == 'success') {
                taskStatus.value = 'canceled';
                data.task.find(el => {return el.name === 'Причина аннулирования'}).value = data.cancel_comment
              }
              notify('Изменение статуса командировочного задания', result.message, result.status);

            }else{
              notify('Изменение статуса командировочного задания', 'Не возможно изменить статус командировочного задания, так как произошла ошибка с получением информации о поручениях в СЭД', 'error');
            }

          })
          .catch(() => {})
    };

    watch(
        () => page.value,
        (value) => {
          if(changeEstimate.value){
            page.value = 'estimate';
            notify('Изменения в смете', `Необходимо сначала нажать кнопку "Сохранить изменения в смете"!`, 'error');
          }
        }
    )

    watchEffect(() => {
      data.cancel_comment ? errors.cancel_comment = null : '';
    })

    provide('changeEstimate', changeEstimate);
    provide('costUnitList', costUnitList);

    return{
      loading, svg,  route, data, page, menu, changeEstimate, MAP, taskStatus, CED_elements, errors, full_access,
      saveEstimate, editTask, getDocument, completeTask, cancelTask, isAdmin, reportApproving
    }
  }
}

</script>