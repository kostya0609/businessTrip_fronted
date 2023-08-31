<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>Добавление пользователя</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">Пользователь</label>
        <el-select
            v-model="newUser.user_id"
            :class="['add-edit-element', {'invalid' : errors.user_id}]"
            style="width: 100%"
            filterable
            remote
            reserve-keyword
            :remote-method="searchUser"
            placeholder="Пользователь"
        >
          <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.user_id">{{errors.user_id}}</small>
      </el-col>
      <el-col :span="12" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">Роль</label>
        <el-select
            v-model="newUser.role_id"
            :class="['add-edit-element', {'invalid' : errors.role_id}]"
            style="width: 100%"
            placeholder="Установить"
        >
          <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.role_id">{{errors.role_id}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row v-if="isExtended">
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">Тип</label>
        <el-select
            v-model="type"
            :class="['add-edit-element']"
            style="width: 100%"
            placeholder="Отдел"
            @change="individualList.length = 0; individual = null; errors.individuals = null; departmentList.length = 0; department = null; errors.departments = null"
        >
          <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
      </el-col>

      <el-col :span="12" class="el-col-padding-right-15">
        <template v-if="type === 'individual'">
          <label class="add-edit-detail-label">Сотрудник</label>
          <el-select
              v-model="individual"
              :class="['add-edit-element', {'invalid' : errors.individuals}]"
              style="width: 100%"
              filterable
              remote
              reserve-keyword
              :remote-method="searchIndividual"
              placeholder="Сотрудник"
          >
            <el-option
                v-for="item in individualList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
          <small v-if="errors.individuals">{{errors.individuals}}</small>
        </template>
        <template v-else>
          <label class="add-edit-detail-label">Отдел</label>
          <el-select
              v-model="department"
              :class="['add-edit-element', {'invalid' : errors.departments}]"
              style="width: 100%"
              filterable
              remote
              reserve-keyword
              :remote-method="searchDepartment"
              placeholder="Отдел"
          >
            <el-option
                v-for="item in departmentList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
          <small v-if="errors.departments">{{errors.departments}}</small>
        </template>

        <label class="add-edit-detail-label"><br/></label>
        <el-table
            :data="tableData"
        >
          <el-table-column  prop="name" label="ФИО сотрудника / название отдела"/>
          <el-table-column label="Действие" align="center" width="180">
            <template #default="scope">
              <el-button
                  size="small"
                  type="danger"
                  @click="userDelete(scope.$index, scope.row)"
              >
                <el-icon><CloseBold /></el-icon>
              </el-button>
              <el-switch
                  v-model="scope.row.full_access"
                  style="margin-left: 15px"
                  size="small"
                  active-text="full"
                  inactive-text="read"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="1">
        <label class="add-edit-detail-label"><br/></label>
        <el-button
            style="margin-top: 5px"
            class="menu-right-element-button"
            @click="userAdd"
            :disabled="(!individual && type==='individual') || (!department && type==='department')"
        >
          +
        </el-button>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="5">
        <el-button
            class="add-edit-footer-button"
            @click="saveUser"
        >
          Сохранить
        </el-button>
      </el-col>
    </el-row>
  </div>

</template>
<script>
import returnButton from "../../../components/return_button";
import {ref, inject, reactive, watchEffect, computed} from "vue";
import { useRouter, useRoute } from 'vue-router';
import  {ElMessageBox }  from 'element-plus';

export default {
  name: "addUserIndex",
  components: {returnButton},

  setup(){
    const router       = useRouter();
    const route        = useRoute();

    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');

    const user         = inject('user');

    user.roles.indexOf('admin') >= 0 ? '' : router.push({name : 'listTasks'});

    const loading      = ref(false);

    const type         = ref('individual');
    const typeList     = reactive([{value : 'individual', label : 'Сотрудник'},{value : 'department', label : 'Отдел'}]);


    const newUser      = reactive({
      user_id     : null,
      role_id     : null,
      departments : [],
      individuals : [],
    });
    const errors       = reactive({
      user_id       : null,
      role_id       : null,
      departments   : null,
      individuals   : null,
    });

    const userList     = reactive([]);
    const roleList     = reactive([]);

    const department     = ref(null);
    const departmentList = reactive([]);

    const individual     = ref(null);
    const individualList = reactive([]);

    const tableData      = reactive([]);

    function searchUser(query){
      let url = '/business-trip/search/user';
      if (query !== '')
        search(query,'user', url);
    };

    function searchIndividual(query){
      let url = '/business-trip/search/user';
      if (query !== '')
        search(query,'individual', url);
    };

    function searchDepartment(query){
      let url = '/business-trip/search/department';
      if (query !== '')
        search(query,'department', url);
    };

    async function search(query, key, url){
      let result = await loadJson(url, {q: query});
      if (result.status === 'success') {

        if (key === 'user') {
          userList.length = 0;
          result.data.forEach(el => userList.push(el));
        };

        if (key === 'individual') {
          individualList.length = 0;
          result.data.forEach(el => individualList.push(el));
        };

        if (key === 'department') {
          departmentList.length = 0;
          result.data.forEach(el => departmentList.push(el));
        };

      };
    };

    async function getData(){
      loading.value = true
      let result = await loadJson('/business-trip/role/get',{});

      if (result.status == 'success') {
        roleList.length = 0;
        result.data.forEach(el => {roleList.push(el)})
      }
      loading.value = false
    };
    getData();

    function userAdd(){
      let name = null;
      if(type.value == 'individual'){
        individualList.forEach(el => {
          el.value === individual.value ? name = el.label : '';
        })
      } else {
        departmentList.forEach(el => {
          el.value === department.value ? name = el.label : '';
        })
      }

      let entity_id = type.value == 'individual' ? individual.value : department.value;

      if (!tableData.find(el => (el.entity_id == entity_id && el.type == type.value))) {

        tableData.push({name, type : type.value, entity_id, full_access : false});

        if(type.value == 'individual'){
          individualList.length = 0;
          individual.value = null;
        } else {
          departmentList.length = 0;
          department.value = null;
        }

      } else notify(`Добавление ${type.value == 'individual' ? 'сотрудника' : 'отдела'}`, `Данный ${type.value == 'individual' ? 'сотрудник' : 'отдел'}  был добавлен ранее`, 'error');

    };

    function userDelete(index, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить ${type.value == 'individual' ? 'сотрудника' : 'отдел'} ${row.name} ?`)
          .then(() => {
            tableData.splice(index,1);
          })
          .catch(() => {})
    };

    function isValid(){
      let valid = true;
      if (!newUser.user_id)                                                           {errors.user_id     = 'Необходимо выбрать пользователя'; valid = false};
      if (!newUser.role_id)                                                           {errors.role_id     = 'Необходимо выбрать роль';         valid = false};
      if (isExtended.value && type.value === 'individual' && tableData.length === 0)  {errors.individuals = 'Необходимо добавить сотрудника';  valid = false};
      if (isExtended.value && type.value === 'department' && tableData.length === 0)  {errors.departments = 'Необходимо добавить отдел';       valid = false};
      return valid
    };

    async function saveUser(){
      if (!isValid()) return;

      loading.value = true;

      let result = await loadJson('/business-trip/role/add', {...newUser});
      if (result.status === 'success') {

        if (isExtended.value) {
          tableData.forEach(el => el.type == 'individual' ?
              newUser.individuals.push({entity_id: el.entity_id, full_access: el.full_access}) :
              newUser.departments.push({entity_id: el.entity_id, full_access: el.full_access})
          );

          result = await loadJson('/business-trip/role/additional/set', {
            user_id     : user.id,
            client_id   : newUser.user_id,
            individuals : newUser.individuals,
            departments : newUser.departments,
          });
        }

        //ниже еще раз проверить не изменился ли result.status после второго запроса в случае расширенных прав
        if (result.status == 'success') {
          let page = null;
          roleList.forEach(el => {
            if (el.value == newUser.role_id) {
              page = el.name
            }
            ;
          })

          page === 'additional'  ? page = 'extended'    : ''
          page === 'over_budget' ? page = 'over_budget' : ''

          router.push({name: 'listUsers', params : {page}});
        };

      }
      loading.value = false;
      notify('Добавление пользователя', result.message, result.status);
    };

    let isExtended = computed(() => {
      let isExtended = false
      roleList.forEach(el => {
        if(el.value == newUser.role_id){ el.name == 'additional' ? isExtended = true : isExtended = false}
      })
      return isExtended;
    });

    watchEffect(() => {
      newUser.user_id  ? errors.user_id     = null : '';
      newUser.role_id  ? errors.role_id     = null : '';
      if (tableData.length) {errors.departments = null; errors.individuals = null};

    });

    return{
      loading, svg, newUser, errors, roleList, userList, type, typeList, department, departmentList,individual,
      individualList, tableData,
      saveUser, searchUser, searchDepartment, searchIndividual, isExtended, userAdd, userDelete
    }
  }
}
</script>