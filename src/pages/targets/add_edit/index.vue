<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>{{route.name === 'addTarget' ? 'Добавление' : 'Редактирование'}} цели{{route.name === 'editTarget' ? ` c ID  - ${route.params.id}` : ''}}</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Название
        </label>
        <el-input
            v-model="target.name"
            type="textarea"
            rows="3"
            :class="['add-edit-element', {'invalid' : errors.name}]"
            placeholder="Введите название цели"
        >
        </el-input>
        <small v-if="errors.name">{{errors.name}}</small>
      </el-col>

      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Описание
        </label>
        <el-input
            v-model="target.description"
            type="textarea"
            rows="3"
            :class="['add-edit-element', {'invalid' : errors.description}]"
            placeholder="Введите описание цели"
        >
        </el-input>
        <small v-if="errors.description">{{errors.description}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Активность
        </label>
        <div>
          <el-switch
              v-model="target.active"
              size="large"
              :active-icon="Check"
              :inactive-icon="Close"
              style="margin-left: 15px"
          />
        </div>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="5">
        <el-button
            class="add-edit-footer-button"
            @click="saveTarget"
        >
          Сохранить
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { Check, Close } from '@element-plus/icons-vue'
import returnButton from "../../../components/return_button";
import {ref, inject, reactive, watchEffect} from "vue";
import { useRouter, useRoute } from 'vue-router';

export default {
  name: "addEditTargetIndex",
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
    const target       = reactive({
      id          : route.params.id ? route.params.id : null,
      name        : null,
      description : null,
      active      : false,

    });
    const errors       = reactive({
      name        : null,
      description : null,
    });

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/targets/get', {target_id : route.params.id, all : 0});
      loading.value = false;

      if (result.status === 'success' && result.data) {
        target.name        = result.data.name;
        target.description = result.data.description;
        target.active      = result.data.active == 1 ? true : false;
      }
    };

    route.name === 'editTarget' ? getData() : '';

    function isValid(){
      let valid = true;
      if (!target.name)        { errors.name        = 'Необходимо указать название цели'; valid = false};
      if (!target.description) { errors.description = 'Необходимо указать описание цели'; valid = false};
      return valid
    };


    async function saveTarget(){
      if(!isValid()) return;
      loading.value = true;
      let url = route.name === 'addTarget' ? '/business-trip/targets/add' : '/business-trip/targets/edit'
      let result = await loadJson(url, {...target, active : target.active ? 1 : 0, user_id : user.id});
      loading.value = false;

      if (result.status === 'success') {
        router.push({name:'listTargets' });
      };

      notify(`${route.name === 'addTarget' ? 'Добавление' : 'Изменение'} цели`, result.message, result.status);
    }

    watchEffect(() => {
      target.name        ? errors.name        = null : '';
      target.description ? errors.description = null : '';
    });

    return{
      loading, svg, target, errors, Close, Check, route,
      saveTarget
    }
  }
}
</script>