<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>{{route.name === 'addCity' ? 'Добавление' : 'Редактирование'}} города{{route.name === 'editCity' ? ` c ID  - ${route.params.id}` : ''}}</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Название
        </label>
        <el-input
            v-model="city.name"
            :class="['add-edit-element', {'invalid' : errors.name}]"
            placeholder="Введите название города"
        >
        </el-input>
        <small v-if="errors.name">{{errors.name}}</small>
      </el-col>

      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Регион
        </label>
        <el-input
            v-model="city.region"
            :class="['add-edit-element', {'invalid' : errors.region}]"
            placeholder="Введите регион города"
        >
        </el-input>
        <small v-if="errors.region">{{errors.region}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Население
        </label>
        <el-input
            v-model="city.population"
            type="number"
            :class="['add-edit-element', {'invalid' : errors.population}]"
            placeholder="Введите население города"
        >
        </el-input>
        <small v-if="errors.population">{{errors.population}}</small>
      </el-col>

      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Активность
        </label>
        <div>
          <el-switch
              v-model="city.active"
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
            @click="saveCity"
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
  name: "addEditCityIndex",
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
    const city         = reactive({
      id         : route.params.id ? route.params.id : null,
      name       : null,
      region     : null,
      population : null,
      active     : false,

    });
    const errors       = reactive({
      name       : null,
      region     : null,
      population : null,
    });

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/cities/get', {city_id : route.params.id});
      loading.value = false;

      if (result.status === 'success' && result.data) {
        city.name       = result.data.name;
        city.region     = result.data.region;
        city.population = result.data.population;
        city.active     = result.data.active == 1 ? true : false;
      }
    };

    route.name === 'editCity' ? getData() : '';

    function isValid(){
      let valid = true;
      if (!city.name)            { errors.name       = 'Необходимо указать название города';       valid = false};
      if (!city.region)          { errors.region     = 'Необходимо указать регион города';         valid = false};
      if (city.population <= 0 ) { errors.population = 'Необходимо указать численность населения'; valid = false};
      return valid
    };

    async function saveCity(){
      if(!isValid()) return;
      loading.value = true;
      let url = route.name === 'addCity' ? '/business-trip/cities/add' : '/business-trip/cities/edit'
      let result = await loadJson(url, {...city, active : city.active ? 1 : 0, user_id : user.id});
      loading.value = false;

      if (result.status === 'success') {
        router.push({name:'listCities' });
      };

      notify(`${route.name === 'addCity' ? 'Добавление' : 'Изменение'} города`, result.message, result.status);
    }

    watchEffect(() => {
      city.name       ? errors.name       = null : '';
      city.region     ? errors.region     = null : '';
      city.population ? errors.population = null : '';
    });

    return{
      loading, svg, Check, Close, city, errors, route,
      saveCity
    }
  }
}
</script>