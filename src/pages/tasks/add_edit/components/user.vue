<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          ФИО пользователя
        </label>
        <el-select
            v-model="value.responsible_id"
            :class="['add-edit-element', {'invalid' : errors.responsible_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchResponsible"
            placeholder="Введите ответственного"
            :disabled="!user.roles.includes('admin')"
        >
          <el-option
              v-for="item in value.responsible_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.responsible_id">{{errors.responsible_id}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Организаци
        </label>
        <el-select
            v-model="value.company_id"
            :class="['add-edit-element', {'invalid' : errors.company_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchCompany"
            placeholder="Введите организацию"
        >
          <el-option
              v-for="item in value.company_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.company_id">{{errors.company_id}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Подразделение
        </label>
        <el-select
            v-model="value.department_id"
            :class="['add-edit-element', {'invalid' : errors.department_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchDepartment"
            placeholder="Введите департамент"
        >
          <el-option
              v-for="item in value.department_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.department_id">{{errors.department_id}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Должность
        </label>
        <el-input
            v-model="value.position"
            :class="['add-edit-element', {'invalid' : errors.position}]"
        >
        </el-input>
        <small v-if="errors.position">{{errors.position}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Расчетный счет
        </label>
        <el-input
            v-model="value.checking_account"
            @change="value.checking_account = parseFloat(value.checking_account)"
            :class="['add-edit-element', {'invalid' : errors.checking_account}]"
        >
        </el-input>
        <small v-if="errors.checking_account">{{errors.checking_account}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Комментарий
        </label>
        <el-input
            v-model="value.comment"
            class="add-edit-element"
            type="textarea"
            rows="1"
        >
        </el-input>
      </el-col>
    </el-row>
    <br/>
  </div>
</template>

<script>
import {inject, ref} from "vue";
export default {
  name: "addTripUser",
  props: ['value'],
  setup(props){
    const loadJson    = inject('loadJson');
    const svg         = inject('svg');
    const errors      = inject('errors');
    const user        = inject('user');

    const loading     = ref(false);

    function searchResponsible(query){
      let url = '/business-trip/search/user';
      if (query !== '')
        search(query,'responsible', url);
    };

    function searchDepartment(query){
      let url = '/business-trip/search/department';
      if (query !== '')
        search(query,'department', url);
    };

    function searchCompany(query){
      let url = '/business-trip/search/company';
      if (query !== '')
        search(query,'company', url);
    };

    async function search(query, key, url){
      loading.value = true;
      let result = await loadJson(url, {q: query});
      if (result.status === 'success' && result.data) {
        if (key === 'responsible') props.value.responsible_list = result.data;
        if (key === 'department') props.value.department_list = result.data;
        if (key === 'company') props.value.company_list = result.data;
      };
      loading.value = false;
    };

    return{
      errors, svg, loading, user,
      searchResponsible, searchDepartment, searchCompany
    }
  },
}
</script>

<style scoped>

</style>