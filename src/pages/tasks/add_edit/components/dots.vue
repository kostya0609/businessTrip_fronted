<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <el-row class="el-row-justify-content">
      <el-col :span="4" class="el-col-padding-right-15">
        <label>Посещаемый город</label>
        <el-select
            v-model="city"
            :class="['add-edit-element', {'invalid' : errors.add_city_dot}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchCity"
            placeholder="Выберете город"
        >
          <el-option
              v-for="item in citiesList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.add_city_dot">{{errors.add_city_dot}}</small>
      </el-col>
      <el-col :span="4">
        <label><br/></label>
        <el-button
            :class="['add-edit-element']"
            @click="addCity(value.dots.length + 1)"
        >
          Добавить посещаемый город
        </el-button>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="24">
        <el-tabs tab-position="left" v-model="page" v-if="value.dots.length > 0" class="cityTabs">
          <el-tab-pane v-for="(item, key) in value.dots" :label="item.city.name + ' (' +item.city.region + ')'" :name="key" :key="key" >

            <el-row class="el-col-padding-right-15">
              <el-col :span="5" class="el-col-padding-right-15">
                <label>
                  Дней прибывания
                </label>
                <el-input
                    v-model="value.dots[page].days"
                    @input="value.dots[page].days = (value.dots[page].days).replace(/[^\d.]/ig, '')"
                    @change="value.dots[page].days = parseFloat(value.dots[page].days)"
                    :class="['add-edit-element']"
                    placeholder="Введите количество дней"
                >
                </el-input>
              </el-col>
              <el-col :span="5" class="el-col-padding-right-15" v-if="value.auto_travel">
                <label>
                  Км до города
                </label>
                <el-input
                    v-model="value.dots[page].distance"
                    @input="value.dots[page].distance = String(value.dots[page].distance).replace(/[^\d.]/ig, '')"
                    @change="value.dots[page].distance = parseFloat(value.dots[page].distance)"
                    :class="['add-edit-element']"
                    placeholder="Введите км"
                >
                </el-input>
              </el-col>
              <el-col :span="5" class="el-col-padding-right-15">
                <label>
                  Сортировка
                </label>
                <el-input
                    v-model="value.dots[page].sort"
                    @input="value.dots[page].sort = (value.dots[page].sort).replace(/[^\d.]/ig, '')"


                    :class="['add-edit-element']"
                    placeholder="Введите число для сортировки"
                >
                </el-input>
              </el-col>
              <el-col :span="5" class="el-col-padding-right-15">
                <label>
                  <br/>
                </label>
                <el-button
                    :class="['add-edit-element']"
                    @click="deleteCity(page)"
                >
                  Удалить город
                </el-button>
              </el-col>
            </el-row>
            <br/>

            <el-row class="el-row-justify-content">
              <el-col :span="4">
                <el-button
                    :class="['add-edit-element']"
                    @click="addTarget(value.dots[page].targets.length + 1)"
                >
                  Добавить цель
                </el-button>
              </el-col>
            </el-row>

            <el-row v-for="(target, idx) in value.dots[page].targets" :key="idx" class="el-row-add-tasks">
              <el-col :span="4" class="el-col-padding-right-15">
                <label>
                  Цель посещения - {{idx + 1}}
                </label>
                <el-select
                    v-model="value.dots[page].targets[idx].target_id"
                    :class="['add-edit-element']"
                    placeholder="Выберете цель"
                >
                  <el-option
                      v-for="item in targetsList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4" class="el-col-padding-right-15">
                <label>
                  Контрагент
                </label>
                <el-input
                    v-model="value.dots[page].targets[idx].contractor"
                    :class="['add-edit-element']"
                    placeholder="Введите контрагента"
                >
                </el-input>
              </el-col>
              <el-col :span="4" class="el-col-padding-right-15">
                <label>
                  Сортировка
                </label>
                <el-input
                    v-model="value.dots[page].targets[idx].sort"
                    @input="value.dots[page].targets[idx].sort = String(value.dots[page].targets[idx].sort).replace(/[^\d.]/ig, '')"
                    :class="['add-edit-element']"
                    placeholder="Введите число для сортировки"
                >
                </el-input>
              </el-col>
              <el-col :span="4" class="el-col-padding-right-15">
                <label>
                  Комментарий
                </label>
                <el-input
                    v-model="value.dots[page].targets[idx].comment"
                    :class="['add-edit-element']"
                    type="textarea"
                    rows="1"
                    placeholder="Введите комментарий"
                >
                </el-input>
              </el-col>
              <el-col :span="4" class="el-col-padding-right-15">
                <label><br/></label>
                <el-button
                    :class="['add-edit-element']"
                    @click="deleteTask(idx)"
                >
                  Удалить цель
                </el-button>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <label v-if="errors.dots" class="color-red"> {{errors.dots}} </label>
        <label v-if="errors.dotsData" class="color-red">Необходимо указать:</label><br/>
        <label v-if="errors.dotsData" v-for="item in errors.dotsData" class="color-red-mg-left-20">
          {{item}}<br/>
        </label>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import {ref, inject, reactive, watchEffect} from "vue";
export default {
  name  : "addTripDots",
  props :['value'],
  setup(props){
    const loadJson    = inject('loadJson');
    const svg         = inject('svg');
    const errors      = inject('errors');
    const targetsList = inject('targetsList');

    const page        = ref(0);
    const loading     = ref(false);

    const city        = ref(null);
    const citiesList  = reactive([]);

    function searchCity(query){
      let url = '/business-trip/search/city';
      if (query !== '')
        search(query,'city', url);
    };

    async function search(query, key, url){
      loading.value = true;
      let result = await loadJson(url, {q: query});
      if (result.status === 'success' && result.data) {

        if (key === 'city') {
          citiesList.length = 0;
          result.data.forEach(el => citiesList.push(el));
        };

      };
      loading.value = false;
    };

    function addCity(idx){
      if(city.value){
        let label = citiesList.find(el => {if (el.value === city.value) return el}).label.trim();

        let start = label.indexOf('(');
        let end   = label.indexOf(')');

        let name = label.slice(0, start - 1);
        let region = label.slice(start + 1, end);

        page.value = props.value.dots.length;
        props.value.dots.push({
          city_id   : city.value,
          targets   : [],
          days      : null,
          sort      : idx * 100,
          distance  : null,
          city      : { name, region },
        });
        city.value = null;
      } else {errors.add_city_dot = 'Необходимо выбрать город'};
    };

    function addTarget(idx){
      props.value.dots[page.value].targets.push({
        target_id   : null,
        contractor  : null,
        sort        : idx * 100,
        comment     : null,
      })
    };

    function deleteCity(idx){
      props.value.dots.splice(idx, 1);
      page.value = props.value.dots.length - 1;
    };

    function deleteTask(idx){
      props.value.dots[page.value].targets.splice(idx, 1);
    }

    watchEffect(() => {
      city.value ? errors.add_city_dot = null : '';
    })

    return {
      page, city, svg, loading, citiesList, targetsList, errors,
      addCity, addTarget, deleteCity, deleteTask, searchCity,
    }
  },

}
</script>

<style scoped>

</style>