<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <Grid
        :name="name"
        @gridReady="getData"
    />

<!--            <el-button @click="sendDefaultFilterData">-->
<!--              Загрузить дефолтовый фильтр-->
<!--            </el-button>-->

  </div>
</template>

<script>
import {ref, inject, reactive, computed, provide} from "vue";
import initGrid from '../../vdg3/use/initGrid';
import Grid from '../../vdg3/components/grid.n.vue';
import  {ElMessageBox }  from 'element-plus';
import { useRouter } from 'vue-router';

export default {
  name       : "listIndex",
  components : {Grid},
  setup(){
    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');
    const domain       = inject('domain');
    const taskId       = inject('taskId');

    const full_access  = inject('full_access');
    full_access.value  = 0;

    taskId.value       = null;
    const user         = inject('user');

    const router       = useRouter();

    const loading      = computed(() => { return dataGrid.loading });

    let paginationData  = inject('paginationDataList');
    let sortData        = inject('sortDataList');
    let filterData      = inject('filterDataList');
    let showValueFilter = inject('showValueListFilter');
    let activeProfile   = inject('activeProfileList');

    const name          = ref('businessTripList');
    const content       = reactive({
      setting         : true,
      header          : {
        id                  : {
          name: 'Номер',
          width: 100,
          show: true,
          sort: 100,
          contentSort: 'desc'
        },
        status              : {
          name: 'Статус',
          width: 300,
          show: true,
          sort: 200,
          contentSort: 'asc'
        },
        responsible          : {
          name: 'Ответственный',
          width: 300,
          show: true,
          sort: 300,
          contentSort: 'asc'
        },
        company             : {
          name: 'Организация',
          width: 300,
          show: true,
          sort: 400,
          contentSort: 'asc'
        },
        department          : {
          name: 'Подразделение',
          width: 300,
          show: true,
          sort: 500,
          //contentSort: 'asc'
        },
        position            : {
          name: 'Должность',
          width: 200,
          show: true,
          sort: 600,
          contentSort: 'asc'
        },
        accountant          : {
          name: 'Бухгалтер',
          width: 300,
          show: true,
          sort: 700,
          contentSort: 'asc'
        },
        city_start          : {
          name: 'Город выезда',
          width: 300,
          show: true,
          sort: 800,
          contentSort: 'asc'
        },
        city_final          : {
          name: 'Город возвращения',
          width: 300,
          show: true,
          sort: 900,
          contentSort: 'asc'
        },
        date_start          : {
          name: 'Дата выезда',
          width: 400,
          show: true,
          sort: 1000,
          contentSort: 'asc'
        },
        date_final          : {
          name: 'Дата возвращения',
          width: 300,
          show: true,
          sort: 1100,
          contentSort: 'asc'
        },
        dots                : {
          name: 'Посещаемые города',
          width: 300,
          show: true,
          sort: 1200,
       },
        auto_travel        : {
          name: 'Командировка на личном авто',
          width: 270,
          show: true,
          sort: 1300,
          contentSort: 'asc'
        },
        over_budget        : {
          name: 'Сверх бюджет',
          width: 250,
          show: true,
          sort: 1400,
          contentSort: 'asc'
        },
        date_created        : {
          name: 'Дата создания',
          width: 400,
          show: true,
          sort: 1500,
          contentSort: 'asc'
        },
      },
      context         : [
        {
          text: 'Перейти в задание',
          function: (e, row) => {
            full_access.value = row.row.full_access[0].value;
            taskId.value = row.row.id[0].value;
            router.push({name:'detailTask', params: { id: row.row.id[0].value}});
          }
        },
        {
          text: 'Редактировать задание',
          function: (e, row) => {
            if(!row.row.full_access[0].value){notify('Редактирование задания', 'У вас нет прав на редактирование задания', 'error'); return}

            if (row.row.status_eng[0].value != 'created' && row.row.status_eng[0].value != 'fixing_problem') return notify('Редактирование задания', `Редактирование допускается только на этапе оформления или устранении замечаний! Текущий статус - ${row.row.status[0].value}.`, 'error');

            ElMessageBox.confirm(`Вы уверены, что хотите редактировать задание с ID - ${row.row.id[0].value}?`)
                .then(() => {
                  taskId.value = row.row.id[0].value;
                  router.push({name:'editTask', params: { id: row.row.id[0].value }});
                })
                .catch(() => {})
          }
        },
        {
          text: 'Удалить задание',
          function: (e, row) => {
            if(!row.row.full_access[0].value){notify('Удаление задания', 'У вас нет прав на удаление задания', 'error'); return}

             if (row.row.status_eng[0].value != 'created' && row.row.status_eng[0].value != 'fixing_problem') return notify('Удаление задания', `Удаление задания допускается только на этапе оформления или устранении замечаний! Текущий статус - ${row.row.status[0].value}.`, 'error');

            ElMessageBox.confirm(`Вы уверены, что хотите удалить задание с ID - ${row.row.id[0].value}?`)
                .then(() => deleteTask(row.row.id[0].value))
                .catch(() => {})
          }
        },
      ],
      pagination      : {
        show: 'full',
        defaultSize : paginationData.count,
        page : paginationData.page,
        changeSize : function(value){
          paginationData.count = value;
          getData();
        },
        changePage : function(value){
          paginationData.page = value;
          getData();
        }
      },
      filter          : {
        profiles: [],
        show: true,
        showProfiles: true,
        showValue : showValueFilter,
        activeProfile : activeProfile,
        filter : function(filterData_new, showValueFilter_new, activeProfile_new){
          for (let prop of Object.getOwnPropertyNames(filterData)) {
            delete filterData[prop];
          }
          let normalFilter = {};
          for (let key in filterData_new){
            if ((filterData_new[key].type === 'number' || filterData_new[key].type === 'date')         && filterData_new[key].min)                normalFilter[key] = filterData_new[key];
            if ((filterData_new[key].type === 'list'   || filterData_new[key].type === 'searchList')   && filterData_new[key].value.length > 0 )  normalFilter[key] = filterData_new[key];
          };

          showValueFilter = showValueFilter_new;

          Object.assign(filterData, normalFilter);
          activeProfile.value = activeProfile_new.value
          getData()
        },
        clear : function(data){
          for (let prop of Object.getOwnPropertyNames(filterData)) {
            delete filterData[prop];
          }
          activeProfile.value =  null;
          getData();
        },
      },
      gridId          : null,
      networkSetting  : {
        domain: '', //домен для модуля грида может отличаться от домена основного приложения. Если домен тут не указать, то примениться домен приложения
        module: 'businessTrip',
        userId: user.id,
      },
      loading         : false,
      loadJson        : function (url, data) {
        return fetch(
            content.networkSetting.domain ? content.networkSetting.domain + url : domain.value +  url,
            {
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=utf-8'
              },
              body: JSON.stringify(data, function (key, val) {
                return (typeof val === 'function') ? '' + val : val;
              })
            }
        ).then(res => {
          return new Promise((resolve, reject) => {
            if (!res.ok)
              throw new Error('Response server - status code ' + res.status);
            else {
              res.json().then(json => {
                resolve(json)
              }).catch(err => {
                reject(err);
              })
            }
          })
        }).catch(err => {
          return new Promise((resolve, reject) => {
            reject({status: 'error', message: 'Некорректный ответ сервера', system: err.message})
          })
        });
      },
      sortContent     : function (sortData_new) {
        //sortData_new.name === 'type' ? sortData_new.name = 'type_id' : '';
        Object.assign(sortData, sortData_new);
        getData();
      },
    });
    const dataGrid      = initGrid(content);
    provide(name.value, dataGrid);

    async function getData(filter = filterData, sort = sortData){
      dataGrid.loading = true;

      let gridElements = [];
      let result = await loadJson('/business-trip/tasks/list', {
        count   : dataGrid.pagination.defaultSize,
        page    : dataGrid.pagination.page,
        filter  : filter,
        sort    : sort.name ? sort : {name : 'id', order : 'asc'} ,
        user_id : user.id,
      });
      if (result.status == 'success') {
        gridElements = result.data
        dataGrid.pagination.total = result.total;
      } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных с сервера.', 'error');

      dataGrid.methods.addElements(gridElements);
      dataGrid.loading = false;
    };

    async function deleteTask(task_id){
      let result = await loadJson('/business-trip/tasks/delete', {task_id, user_id : user.id});
      if (result.status === 'success') await getData();
    }

    //ниже чтоб на бэк залить дефолтовый фильтр... надо выше раскоментить нужную кнопку
    async function sendDefaultFilterData() {
      //создаст моковый дефолтный фильтр. запустить один раз при разработке, чтоб он записался на бэк
      let defaultFilterData = {
        // id                  : {
        //   show: true,
        //   type: 'number',
        //   name: 'Номер',
        //   min: '',
        //   max: '',
        //   operation: '=',
        // },
        // status              : {
        //   show: true,
        //   type: 'list',
        //   name: 'Статус',
        //   multiple: true,
        //   value: [],
        //   option: [
        //     {value: 'created', label: 'На оформлении'},
        //     {value: 'approving', label: 'На согласовании'},
        //     {value: 'fixing_problem', label: 'На устранении замечаний'},
        //     {value: 'signing', label: 'На подписании'},
        //     {value: 'working', label: 'В работе'},
        //     {value: 'report_approving', label: 'На утверждении отчета'},
        //     {value: 'canceled', label: 'Аннулировано'},
        //     {value: 'completed', label: 'Выполнено'},
        //   ],
        // },
        // responsible_id     : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Ответственный',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/business-trip/search/user', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // company_id     : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Организация',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/business-trip/search/company', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // department_id    : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Подразделение',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/business-trip/search/department', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // accountant_id     : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Бухгалтер',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/business-trip/search/user', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // city_start_id     : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Город выезда',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/business-trip/search/city', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // city_final_id     : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Город возврата',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/business-trip/search/city', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // date_start: {
        //   show: true,
        //   type: 'date',
        //   name: 'Дата выезда',
        //   min: '',
        //   max: '',
        //   operation: '=',
        // },
        // date_final: {
        //   show: true,
        //   type: 'date',
        //   name: 'Дата возвращения',
        //   min: '',
        //   max: '',
        //   operation: '=',
        // },
        // created_at: {
        //   show: true,
        //   type: 'date',
        //   name: 'Дата создания',
        //   min: '',
        //   max: '',
        //   operation: '=',
        // },
        // auto_travel              : {
        //   show: true,
        //   type: 'list',
        //   name: 'Командировка на личном авто',
        //   multiple: false,
        //   value: [],
        //   option: [
        //     {value: [1], label: 'Да'},
        //     {value: [0], label: 'Нет'},
        //   ],
        // },
        // over_budget              : {
        //   show: true,
        //   type: 'list',
        //   name: 'Сверх бюджет',
        //   multiple: false,
        //   value: [],
        //   option: [
        //     {value: [1], label: 'Да'},
        //     {value: [0], label: 'Нет'},
        //   ],
        // },
      };
      let result = await loadJson('/grid/filter/preset/default/add', {
        grid_name: name.value,
        module: dataGrid.networkSetting.module,
        data: {...defaultFilterData},
      });
      notify('Загрузка дефолтового фильтра', result.message, result.status)
    }

    return{
      loading, svg, name, router,
      getData, sendDefaultFilterData
    }
  },
}
</script>

<style scoped>

</style>