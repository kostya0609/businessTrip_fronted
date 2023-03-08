<template>
  <div
      v-loading="loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="app_container"
  >
    <div v-if="isOK">
      <navBar v-if="navBarVisible"/>
      <router-view/>
    </div>

  </div>
</template>

<script>
import navBar from "./components/navBar";
import { useRouter, useRoute } from 'vue-router';
import {ref, provide, reactive, computed} from "vue";
import  {ElNotification}  from 'element-plus'

export default {
  name : 'App',
  components :{navBar},
  setup(){
    const router            = useRouter();
    const isOK              = ref(null);
    const timerId           = ref(null);

    const svg               = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
    const loading           = ref(false);
    const domain            = ref( process.env.NODE_ENV == 'production' ? window.location.origin + '/api' : 'http://localhost:8000');
    //const domain            = ref( 'https://bitrix.bsi.local/api');
    const notify            = (title, message, type) => {
      ElNotification({
        title: title,
        message: message,
        type: type,
        duration: 4000,
      })
    };

    const taskId            = ref(null);
    const taskStatus        = ref(null);

    const user              = reactive({
      id         : null,
      roles      : [],
      fio        : null,
      department : {id : null, name : null},
      company    : {id : null, name : null},
      position   : null,
    });

    const navBarVisible     = computed(() => {
      let currentRoute = router.currentRoute.value.name;
      return['listTasks', 'listCities', 'listTargets', 'listUsers'].includes(currentRoute)
    });

    let paginationDataList  = reactive({page : 1, count : 10});
    let sortDataList        = reactive({name: "id", order: "desc"});
    let filterDataList      = reactive({});
    let showValueListFilter = reactive([]);
    let activeProfileList   = ref(null);

    const MAP = {
      created         : 'Новое задание',
      approving       : 'На согласовании',
      fixing_problem  : 'На устранении замечаний',
      signing         : 'На подписании',
      working         : 'В работе',
      archived        : 'Архив',
      canceled        : 'Аннулирован',
      completed       : 'Выполнено',
    };

    function loadJson(url , data, type, downloadRequest){
      let body, header = {};

      if(type === 'file'){
        body = data;
      }else{
        body = {...data};
        header['Content-Type'] = 'application/json;charset=utf-8';
      }

      return fetch(
          domain.value + url,
          {
            method: 'post',
            headers: header,
            body: type === 'file' ? body : JSON.stringify(body, function(key, val) {
              return (typeof val === 'function') ? ''+ val : val;
            })
          }
      ).then(res => {
        return new Promise((resolve,reject) => {
          if(!res.ok)
            throw new Error('Response server - status code ' + res.status);
          else{

            if (downloadRequest) {
              resolve(res)
            } else {
              res.json().then(json => {
                resolve(json)
              }).catch(err => {
                reject(err);
              })
            }

          }
        })
      }).catch(err => {
        return new Promise((resolve,reject) => {
          reject({status : 'error',message : 'Некорректный ответ сервера',system : err.message})
        })
      });
    };

    async function initData(){
      window._userId ? user.id      = window._userId : user.id      = null;
      window._token  ? window.token = window._token  : window.token = null;
    }

    async function auth(){
      loading.value = true;
      await initData();
      if (window.token) {
        setTimeout(() => {clearInterval(timerId.value)});

        let result = await loadJson('/business-trip/users/get', {user_id: user.id, token : window.token});

        if (result.status == 'success' && result.data) {
          user.roles.length = 0;
          result.data.roles.forEach(el => user.roles.push(el));
          user.fio             = result.data.user.fio;
          user.department.id   = result.data.user.department.id;
          user.department.name = result.data.user.department.name;
          user.company.id      = result.data.user.company.id;
          user.company.name    = result.data.user.company.name;
          user.position        = result.data.user.position;
          isOK.value = true;
        } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных с сервера.', 'error');

        loading.value = false;
      } else {
        user.roles.length = 0;
        user.fio          = null;
        user.department   = {id : null, name : null};
        user.company      = {id : null, name : null};
        user.position     = null;
        isOK.value        = false;
        notify('Проблема с авторизацией на портале', 'Нет токена.', 'error');
        timerId.value   = setInterval(async () => await initData(), 15000 );
      };
    };
    auth();

    window.businessTripLoadFile = async (id, fileName, type) => {
      try {
        let result    = await loadJson('/business-trip/files/load', {file_id : id}, '', true);
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = fileName;

        link.click();
        URL.revokeObjectURL(link.href);
      }catch(e){
        notify('Ошибка загрузки файла', e.message, 'error')
      }
      return false;
    };

    provide('domain', domain);
    provide('loadJson', loadJson);
    provide('svg', svg);
    provide('notify', notify);

    provide('taskId', taskId);
    provide('taskStatus', taskStatus);
    provide('user', user);
    provide('paginationDataList', paginationDataList);
    provide('sortDataList', sortDataList);
    provide('filterDataList', filterDataList);
    provide('showValueListFilter', showValueListFilter);
    provide('activeProfileList', activeProfileList);

    provide('MAP', MAP);

    return{
      svg, loading, navBarVisible, isOK,
    }
  },
}
</script>

<style>
/* ниже стили общие на все приложение*/
#workarea {
  overflow-x: hidden!important;
}
#workarea-content {
  overflow: unset !important;
}
.workarea-content-paddings{
  overflow-x: unset !important;
}
.app_container{
  padding: 15px;
}
#app ::selection {
  background: #cfcfcf;
}

/*ниже класс для ссылок на загрузку файлов*/
.businessTrip_vicarious{
  font-weight: bold;
}

/*Общий класс - если не все поля на форме заполнены*/
small {
  color: #ff2400;
}
.color-red{
  color: #ff2400;
}
.color-red-mg-left-20{
  color: #ff2400;
  margin-left: 20px;
}
.invalid {
  border:solid 1px !important;
  border-color: #ff2400 !important;
}
.tab_red {
  color: red !important;
}

/*чтоб в таблицах переносились слова*/
table.el-table__body td .cell {
  word-break: break-word;
}

/* ниже стили для отдельного компонента  - Меню navBar */
.el-menu--horizontal{
  display: block !important;
}
.menu-right-element{
  float: right !important;
  padding-top: 10px!important;
}
.menu-right-element-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.menu-right-element-button:hover{
  background: #3fddff !important;
}
.el-menu--horizontal .el-menu-item:focus{
  background-color: #ffffff!important;
}
.el-menu--horizontal .el-menu-item:hover:last-child{
  background-color: #ffffff!important;
}
.el-menu--horizontal>.el-menu-item.is-active
{
  background-color: #ecf5ff!important;
}

/* нижи стили для отдельного компонента return_button - кнопка Вернуться назад*/
.returnButton{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.returnButton:hover{
  background: #3fddff !important;
}

/*ниже два стиля для табов с городами, чтоб был пренос слов в названии городов и ограничение ширины левой стороны*/
.cityTabs .el-tabs__nav{
  white-space: normal;
}
.cityTabs .el-tabs__item{
  max-width: 200px;
  word-wrap: break-word;
  line-height: normal;
  height: 50px;
}

/*ниже стили для форм добавления, редактирования, деталки*/
.add-edit-detail-header{
  display: flex;
  justify-content: space-between;
}
.add-edit-detail-label{
  font-weight: 500;
}
.add-edit-element{
  margin-top: 5px !important;
  width: 100% !important;
}
.el-col-padding-right-15{
  padding-right: 15px;
}
.el-row-add-tasks{
  padding-right: 15px;
  margin-bottom: 15px
}
.el-row-justify-content{
  justify-content : end;
}
.el-col .el-upload {width : 100%}

.add-edit-footer-button{
  width : 100%;
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.add-edit-footer-button:hover{
  background: #3fddff !important;
}
.two_fields{
  display: grid !important;
  grid-template-columns: 88% 10%;
  grid-gap: 2%;
  margin-bottom: 10px;
}

.delete-scan-button {
  margin-top: 5px !important;
  background: #ed6161e0   !important;
  border-color: #ed6161e0   !important;
  color : white !important;
  text-transform: uppercase;
}

span.userPhoto {
  border-radius: 50%;
  overflow: hidden;
  display: block;
  width: 32px;
  height: 32px;
}
.userPhoto img{
  width: 32px;
}

/**/


</style>
