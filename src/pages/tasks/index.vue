<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <br/>
    <Grid
        :name="name"
        @gridReady="getData"
    />

  </div>
</template>

<script>
import {ref, inject, reactive, computed, provide} from "vue";
import initGrid from '../../vdg3/use/initGrid';
import Grid from '../../vdg3/components/grid.n.vue';
import  {ElMessageBox }  from 'element-plus';
import { useRouter } from 'vue-router';

export default {
  name: "listIndex",
  components: {Grid},
  setup(){
    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');
    const domain       = inject('domain');
    const taskId       = inject('taskId');
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
          name: 'Подразделение',
          width: 200,
          show: true,
          sort: 600,
          contentSort: 'asc'
        },
        city_start          : {
          name: 'Город выезда',
          width: 300,
          show: true,
          sort: 700,
          contentSort: 'asc'
        },
        city_final          : {
          name: 'Город возвращения',
          width: 300,
          show: true,
          sort: 800,
          contentSort: 'asc'
        },
        date_start          : {
          name: 'Дата выезда',
          width: 400,
          show: true,
          sort: 900,
          contentSort: 'asc'
        },
        date_final          : {
          name: 'Дата возвращения',
          width: 300,
          show: true,
          sort: 1000,
          //contentSort: 'asc'
        },
        dots                : {
          name: 'Посещаемые города',
          width: 300,
          show: true,
          sort: 1100,
          //contentSort: 'asc'
        },
        date_created        : {
          name: 'Дата создания',
          width: 400,
          show: true,
          sort: 1200,
        },
      },
      context         : [
        {
          text: 'Перейти в задание',
          function: (e, row) => {
            taskId.value = row.row.id[0].value;
            router.push({name:'detailTask', params: { id: row.row.id[0].value }});
          }
        },
        {
          text: 'Редактировать задание',
          function: (e, row) => {

            if (row.row.status_eng[0].value != 'created') return notify('Редактирование задание', `Редактирование допускается только на этапе подготовки! Текущий статус - ${row.row.status[0].value}.`, 'error');

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
             if (row.row.status_eng[0].value != 'created') return notify('Удаление задания', `Удаление задания допускается только на этапе подготовки! Текущий статус - ${row.row.status[0].value}.`, 'error');

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
            content.networkSetting.domain ? content.networkSetting.domain + url : domain.value + url,
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
        sortData_new.name === 'type' ? sortData_new.name = 'type_id' : '';
        Object.assign(sortData, sortData_new);
        getData();
      },
    });
    const dataGrid     = initGrid(content);
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

    return{
      loading, svg, name, router,
      getData,
    }
  },
}
</script>

<style scoped>

</style>