<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="access-container"
  >
    <br/>
    <el-tabs type="border-card" v-model="page">
      <el-tab-pane label="Администраторы" name="admin">
        <el-row>
          <el-col :span="8">
            <el-table
                :data="tableData_admin"
            >
              <el-table-column  prop="name" label="ФИО"/>
              <el-table-column  label=""  width="60">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="danger"
                      @click="userDelete(scope.$index, scope.row, userType='admin' )"
                  >
                    <el-icon><CloseBold /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Расширенные права" name="extended">
        <el-row>
          <el-col :span="20">
            <el-table
                :data="tableData_extended"
                border
            >
              <el-table-column  prop="name" label="ФИО" />
              <el-table-column  label="Сотрудники/Отделы" >
                <template #default="scope">
                  <p  v-for="item in scope.row.individuals" style="margin: 0px">
                    <span>{{item.name}} - {{item.full_access == 1 ? 'полный доступ' : 'только чтение'}}</span>
                  </p>
                  <p  v-for="item in scope.row.departments" style="margin: 0px">
                    <span>{{item.name}} - {{item.full_access == 1 ? 'полный доступ' : 'только чтение'}}</span>
                  </p>

                </template>
              </el-table-column>
              <el-table-column  label="Действие" width="110">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="info"
                      @click="userEdit(scope.$index, scope.row)"
                  >
                    <el-icon><Tools /></el-icon>
                  </el-button>
                  <el-button
                      size="small"
                      type="danger"
                      @click="userDelete(scope.$index, scope.row, userType='extended')"
                  >
                    <el-icon><CloseBold /></el-icon>
                  </el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Согласующие свербюджет" name="over_budget">
        <el-row>
          <el-col :span="8">
            <el-table
                :data="tableData_over_budget"
            >
              <el-table-column  prop="name" label="ФИО"/>
              <el-table-column  label=""  width="60">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="danger"
                      @click="userDelete(scope.$index, scope.row, userType='over_budget' )"
                  >
                    <el-icon><CloseBold /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import {ref, inject, reactive} from "vue";
import { useRouter, useRoute } from 'vue-router';
import  {ElMessageBox }  from 'element-plus';

export default {
  name: "listUsersIndex",

  setup(props){
    const router           = useRouter();
    const route            = useRoute();
    const loadJson         = inject('loadJson');
    const svg              = inject('svg');
    const notify           = inject('notify');

    const usersData        = inject('usersData');
    const user             = inject('user');

    user.roles.indexOf('admin') >= 0 ? '' : router.push({name : 'listTasks'});

    const loading          = ref(false);
    const page             = ref(route.params.page ? route.params.page : 'admin');

    let userType           = null;

    const tableData_admin       = reactive([]);
    const tableData_extended    = reactive([]);
    const tableData_over_budget = reactive([]);

    function userEdit(index, row){
      usersData.length =0;
      row.individuals.forEach(el => usersData.push({name : el.name, entity_id : el.id, full_access : el.full_access == 1 ? true : false, type : 'individual'}) );
      row.departments.forEach(el => usersData.push({name : el.name, entity_id : el.id, full_access : el.full_access == 1 ? true : false, type : 'department'}) );

      router.push({name:'userEdit', params: { user_id: row.user_id, user_name: row.name,  role_id : row.role_id}})
    };

    function userDelete(index, row, userType){
      let map = {admin : 'администратора', extended : 'расширнные права', over_budget : 'согласующего сверхбюджет'};

      ElMessageBox.confirm(`Вы уверены, что хотите удалить ${map[userType]} ${row.name} ?`)
          .then(async () => {
            loading.value = true
            let result = {};
            result = await loadJson('/business-trip/role/delete', {user_id : row.user_id, role_id : row.role_id});
            loading.value = false

            if (result.status == 'success') {
              userType === 'admin'       ?  tableData_admin.splice(index,1) : '';
              userType === 'extended'    ?  tableData_extended.splice(index,1) : '';
              userType === 'over_budget' ?  tableData_over_budget.splice(index,1) : '';

              notify(`Удаление ${map[userType]}`, result.message, result.status)
            }
          })
          .catch(() => {})
    };

    async function getData(){
      loading.value = true
      let result = await loadJson('/business-trip/role/list', {});
      loading.value = false

      if (result.status == 'success') {
        tableData_admin.length = 0;
        result.data.admin.forEach(el => {tableData_admin.push(el)})

        tableData_extended.length = 0;
        result.data.additional.forEach(el => {tableData_extended.push(el)})

        tableData_over_budget.length = 0;
        result.data.over_budget.forEach(el => {tableData_over_budget.push(el)})
      }
    };
    getData()

    return{
      loading, svg, page, tableData_admin, userType, tableData_extended, tableData_over_budget,
      userDelete, userEdit
    }
  }
}
</script>