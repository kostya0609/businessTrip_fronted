<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>{{route.name === 'addCostUnit' ? 'Добавление' : 'Редактирование'}} статьи расходов{{route.name === 'editCostUnit' ? ` c ID  - ${route.params.id}` : ''}}</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Название
        </label>
        <el-input
            v-model="costUnit.name"
            :class="['add-edit-element', {'invalid' : errors.name}]"
            placeholder="Введите статьи расходов"
        >
        </el-input>
        <small v-if="errors.name">{{errors.name}}</small>
      </el-col>

      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Наименование еденицы
        </label>
        <el-input
            v-model="costUnit.name_unit"
            :class="['add-edit-element', {'invalid' : errors.name_unit}]"
            placeholder="Введите наименование еденицы"
        >
        </el-input>
        <small v-if="errors.name_unit">{{errors.name_unit}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Стоимость еденицы, руб
        </label>
        <el-input
            v-model="costUnit.unit_price"
            type="number"
            :class="['add-edit-element']"
            placeholder="Введите стоимость"
        >
        </el-input>
      </el-col>

      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Лимит стоимости за еденицу, руб
        </label>
        <el-input
            v-model="costUnit.limit_cost_unit"
            type="number"
            :class="['add-edit-element']"
            placeholder="Введите лимит стоимости за единицу."
        >
        </el-input>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          Расходы на суточные
        </label>
        <div>
          <el-switch
              v-model="costUnit.daily_allowance"
              size="large"
              active-text="Да"
              inactive-text="Нет"
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
            @click="saveCostUnit"
        >
          Сохранить
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>

import returnButton from "../../../components/return_button";
import {ref, inject, reactive, watchEffect} from "vue";
import { useRouter, useRoute } from 'vue-router';

export default {
  name: "addEditCostUnitIndex",
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
    const costUnit     = reactive({
      id               : route.params.id ? route.params.id : null,
      name             : null,
      name_unit        : null,
      unit_price       : null,
      limit_cost_unit  : null,
      daily_allowance  : false,
    });
    const errors       = reactive({
      name             : null,
      name_unit        : null,
    });

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/cost-units/get', {cost_unit_id : route.params.id});
      loading.value = false;

      if (result.status === 'success' && result.data) {
        costUnit.name            = result.data.name;
        costUnit.name_unit       = result.data.name_unit;
        costUnit.unit_price      = result.data.unit_price;
        costUnit.limit_cost_unit = result.data.limit_cost_unit;
        costUnit.daily_allowance = result.data.daily_allowance ? true : false;
      }
    };

    route.name === 'editCostUnit' ? getData() : '';

    function isValid(){
      let valid = true;
      if (!costUnit.name)      { errors.name      = 'Необходимо указать название статьи расходов'; valid = false};
      if (!costUnit.name_unit) { errors.name_unit = 'Необходимо указать наименование еденицы';     valid = false};
      return valid
    };


    async function saveCostUnit(){
      if(!isValid()) return;
      loading.value = true;
      let url = route.name === 'addCostUnit' ? '/business-trip/cost-units/add' : '/business-trip/cost-units/edit'
      let result = await loadJson(url, {...costUnit, daily_allowance : costUnit.daily_allowance ? 1 : 0, user_id : user.id});
      loading.value = false;

      if (result.status === 'success') {
        router.push({name:'ListCostUnits'});
      };

      notify(`${route.name === 'addCostUnit' ? 'Добавление' : 'Изменение'} статьи расходов`, result.message, result.status);
    }

    watchEffect(() => {
      costUnit.name      ? errors.name      = null : '';
      costUnit.name_unit ? errors.name_unit = null : '';
    });

    return{
      loading, svg, costUnit, errors, route,
      saveCostUnit
    }
  }
}
</script>