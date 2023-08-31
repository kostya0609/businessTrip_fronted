<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Город выезда
        </label>
        <el-select
            v-model="value.city_start_id"
            :class="['add-edit-element', {'invalid' : errors.city_start_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchCityStart"
            placeholder="Выберите город выезда"
        >
          <el-option
              v-for="item in value.city_start_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.city_start_id">{{errors.city_start_id}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Дата выезда
        </label>
        <el-date-picker
            v-model="value.date_start"
            :class="['add-edit-element', {'invalid' : errors.date_start}]"
            type="date"
            format="DD.MM.YYYY"
            valueFormat="DD.MM.YYYY"
            placeholder="Выберите дату"
        >
        </el-date-picker>
        <small v-if="errors.date_start">{{errors.date_start}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Город возврата
        </label>
        <el-select
            v-model="value.city_final_id"
            :class="['add-edit-element', {'invalid' : errors.city_final_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchCityFinal"
            placeholder="Выберите город возврата"
        >
          <el-option
              v-for="item in value.city_final_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.city_final_id">{{errors.city_final_id}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Дата возврата
        </label>
        <el-date-picker
            v-model="value.date_final"
            :class="['add-edit-element', {'invalid' : errors.date_final}, {'invalid' : errors.date_final_bad}]"
            type="date"
            format="DD.MM.YYYY"
            valueFormat="DD.MM.YYYY"
            placeholder="Выберите дату"
        >
        </el-date-picker>
        <small v-if="errors.date_final">{{errors.date_final}}</small>
        <small v-if="errors.date_final_bad">{{errors.date_final_bad}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15" v-if="value.auto_travel">
        <label>
          Км до точки возврата
        </label>
        <el-input
            v-model="value.back_distance"
            @change="value.back_distance = parseFloat(value.back_distance)"
            :class="['add-edit-element', {'invalid' : errors.back_distance}]"
            placeholder="Введите км до точки возврата"
        >
        </el-input>
        <small v-if="errors.back_distance">{{errors.back_distance}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :span="4">
        <label>
          Командировка на личном авто
        </label>
        <el-switch
            v-model="value.auto_travel"
            :class="['add-edit-element']"
        />
      </el-col>
    </el-row>
    <br/>
    <el-row v-if="value.auto_travel">
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Марка авто
        </label>
        <el-input
            v-model="value.mark"
            :class="['add-edit-element', {'invalid' : errors.mark}]"
            placeholder="Введите марку автомобиля"
        >
        </el-input>
        <small v-if="errors.mark">{{errors.mark}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Модель авто
        </label>
        <el-input
            v-model="value.model"
            :class="['add-edit-element', {'invalid' : errors.model}]"
            placeholder="Введите модель автомобиля"
        >
        </el-input>
        <small v-if="errors.model">{{errors.model}}</small>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Гос.номер
        </label>
        <el-input
            v-model="value.number"
            :class="['add-edit-element', {'invalid' : errors.number}]"
            placeholder="Введите гос.номер автомобиля"
        >
        </el-input>
        <small v-if="errors.number">{{errors.number}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row v-if="value.auto_travel">
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
         Стоимость бензина (за 1 литр)
        </label>
        <el-input
            v-model="value.gasoline"
            @change="value.gasoline = parseFloat(value.gasoline)"
            :class="['add-edit-element', {'invalid' : errors.gasoline}]"
            placeholder="Введите стоимость 1л бензина, руб"
        >
        </el-input>
      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          <br/>
        </label>

        <div v-if="value.files.agreementList.length === 0">
          <el-upload
              action=""
              ref="uploadAgreement"
              :auto-upload="false"
              :limit = "1"
              :on-exceed="uploadAgreementBtn"
              :on-change="agreementFile"
              v-model:file-list="value.files.agreementList"
              :on-preview = 'downLoadFile'
              :show-file-list="false"
          >
            <el-button
                :class="['add-edit-element', {'invalid' : errors.agreementFile}]"
            >
              Соглашение об использовании автомобиля в служебных целях
            </el-button>
          </el-upload>
          <small v-if="errors.agreementFile">{{errors.agreementFile}}</small>
        </div>

        <div class="two_fields" v-else>
          <el-button
              :class="['add-edit-element']"
              :disabled="!value.files.agreementList[0].id"
              @click="downLoadFile(value.files.agreementList[0])"
          >
            {{value.files.agreementList[0].name}}
          </el-button>
          <el-button
              @click="value.files.agreementList.length = 0; value.files.agreementFile = null; value.files.agreementId = null;"
              class="delete-scan-button"
          >
            X
          </el-button>
        </div>

      </el-col>
      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          <br/>
        </label>

        <div v-if="value.files.vicariousList.length === 0">
          <el-upload
              action=""
              ref="uploadVicarious"
              :auto-upload="false"
              :limit = "1"
              :on-exceed="uploadVicariousBtn"
              :on-change="vicariousFile"
              v-model:file-list="value.files.vicariousList"
              :on-preview = 'downLoadFile'
              :show-file-list="false"
          >
            <el-button
                :class="['add-edit-element', {'invalid' : errors.vicariousFile}]"
            >
              Доверенность
            </el-button>
          </el-upload>
          <small v-if="errors.vicariousFile">{{errors.vicariousFile}}</small>
        </div>

        <div class="two_fields" v-else>
          <el-button
              :class="['add-edit-element']"
              :disabled="!value.files.vicariousList[0].id"
              @click="downLoadFile(value.files.vicariousList[0])"
          >
            {{value.files.vicariousList[0].name}}
          </el-button>
          <el-button
              @click="value.files.vicariousList.length = 0; value.files.vicariousFile = null; value.files.vicariousId = null;"
              class="delete-scan-button"
          >
            X
          </el-button>
        </div>

      </el-col>
    </el-row>

    <el-link
        v-if="value.auto_travel"
        href="/docs/shared/file/%D0%92%D0%9D%D0%94%D0%9A/%D0%92%D0%9D%D0%94%D0%9A%20%D0%9F%D0%9E%20%D0%9A%D0%9E%D0%9C%D0%9F%D0%90%D0%9D%D0%98%D0%98/%D0%9A%D0%9E%D0%A0%D0%9F/%D0%9F%D0%9E%D0%9B%D0%9E%D0%96%D0%95%D0%9D%D0%98%D0%AF%20%28%D0%9F%D0%A4%D0%A1%29/%D0%9F%D0%A4%D0%A1%20%D0%BE%20%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0%D1%85/3.%20%D0%A1%D0%BE%D0%B3%D0%BB%D0%B0%D1%88%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D0%B1%20%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B8%20%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D1%8F%20%D0%B2%20%D1%81%D0%BB%D1%83%D0%B6%D0%B5%D0%B1%D0%BD%D1%8B%D1%85%20%D1%86%D0%B5%D0%BB%D1%8F%D1%85.doc"
        target="_blank"
        type="primary"
        style="margin-top: 25px"
    >
      Шаблон соглашения об использовании автомобиля в служебных целях
    </el-link>
  </div>
</template>

<script>

import {reactive, inject, ref} from "vue";

export default {
  name  : "addTripTrip",
  props : ['value'],
  setup(props){
    const loadJson    = inject('loadJson');
    const svg         = inject('svg');
    const errors      = inject('errors');
    const notify      = inject('notify');

    const loading            = ref(false);

    const uploadAgreement    = ref();
    const uploadAgreementBtn = (files) => {
      uploadAgreement.value.clearFiles()
      const file = files[0]
      file.uid = genFileId()
      uploadAgreement.value.handleStart(file)
    };
    const agreementFile      = (file) => {
      props.value.files.agreementFile = file
    };

    const uploadVicarious    = ref();
    const uploadVicariousBtn = (files) => {
      uploadVicarious.value.clearFiles()
      const file = files[0]
      file.uid = genFileId()
      uploadVicarious.value.handleStart(file)
    };
    const vicariousFile      = (file) => {
      props.value.files.vicariousFile = file
    };

    function searchCityStart(query){
      let url = '/business-trip/search/city';
      if (query !== '')
        search(query,'city_start', url);
    };
    function searchCityFinal(query){
      let url = '/business-trip/search/city';
      if (query !== '')
        search(query,'city_final', url);
    };

    async function search(query, key, url){
      loading.value = true;
      let result = await loadJson(url, {q: query});
      if (result.status === 'success' && result.data) {
        if (key === 'city_start') props.value.city_start_list = result.data;
        if (key === 'city_final') props.value.city_final_list = result.data;
      };
      loading.value = false;
    };

    const downLoadFile = async(file) =>{
      if(file.id) {
        try {
          let result = await loadJson('/business-trip/files/load', {file_id : file.id}, '', true); //параметры - url, объкт с данными(id файла), type (если указать 'file' то это для отправки файла и отсылаемые данные уйдут не json-ом а как форма), downLoadRequest - если true то результат не будет преобразован через json )
          let blob      = await result.blob();
          let url       = URL.createObjectURL(blob);
          let link      = document.createElement('a');
          link.href     = url;
          link.download = `${file.name}.${file.type}`;

          link.click();
          URL.revokeObjectURL(link.href);
        }catch(e){
          notify('Ошибка загрузки файла', e.message, 'error')
        }
      } else {
        notify('Ошибка загрузки файла', 'Этот файл недоступен для скачивания. Так как был только что добавлен.', 'error')
      }
    };

    return {
      svg, loading, uploadAgreement, uploadVicarious, agreementFile, vicariousFile, errors,
      uploadAgreementBtn, uploadVicariousBtn, downLoadFile, searchCityStart, searchCityFinal
    }
  },
}
</script>

<style scoped>

</style>