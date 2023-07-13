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
          Организация
        </label>
        <el-select
            v-model="value.company_id"
            :class="['add-edit-element', {'invalid' : errors.company_id}]"
            placeholder="Введите организацию"
            @change="companyChange"
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
        <el-select
            v-model="value.checking_account"
            :class="['add-edit-element', {'invalid' : errors.checking_account}]"
            placeholder="Введите расчетный счет"
            :disabled="!value.company_id"
        >
          <el-option
              v-for="item in value.checking_account_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
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
    <el-row>
      <el-col :span="8" class="el-col-padding-right-15">
        <label class="add-edit-detail-label">
          ФИО бухгалтера, отвечающего за финансовую отчетность
        </label>
        <el-select
            v-model="value.accountant_id"
            :class="['add-edit-element', {'invalid' : errors.accountant_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchAccountant"
            placeholder="Введите ФИО бухгалтера"
        >
          <el-option
              v-for="item in value.accountant_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.accountant_id">{{errors.accountant_id}}</small>
      </el-col>

      <el-col :span="8" class="el-col-padding-right-15">
        <label>
          Командировка сверх бюджета
        </label>
        <el-row>
          <el-col :span="3">
            <el-switch
                v-model="value.over_budget"
                :class="['add-edit-element']"
            />
          </el-col>
          <el-col :span="21" v-if="value.over_budget">
            <el-link
                href="/docs/shared/file/ВНДК/ШАБЛОНЫ-БЛАНКИ/ШАБЛОНЫ-БЛАНКИ%20ПО%20КОМПАНИИ/Образец%20СЗ%20Оплата%20сверх%20бюджета.docx"
                target="_blank"
                type="primary"
                style="padding-top: 15px"
            >
              Шаблон СЗ на оплату сверх бюджета
            </el-link>
          </el-col>
        </el-row>
      </el-col>

      <el-col :span="8" class="el-col-padding-right-15" v-if="value.over_budget">
        <label>
          <br/>
        </label>

        <div v-if="value.files.overBudgetList.length === 0">
          <el-upload
              action=""
              ref="uploadOverBudget"
              :auto-upload="false"
              :limit = "1"
              :on-exceed="uploadOverBudgetBtn"
              :on-change="overBudgetFile"
              v-model:file-list="value.files.overBudgetList"
              :on-preview = 'downLoadFile'
              :show-file-list="false"
          >
            <el-button
                :class="['add-edit-element', {'invalid' : errors.overBudgetFile}]"
            >
              Загрузить СЗ на оплату сверх бюджета
            </el-button>
          </el-upload>
          <small v-if="errors.overBudgetFile">{{errors.overBudgetFile}}</small>
        </div>

        <div class="two_fields" v-else>
          <el-button
              :class="['add-edit-element']"
              :disabled="!value.files.overBudgetList[0].id"
              @click="downLoadFile(value.files.overBudgetList[0])"
          >
            {{value.files.overBudgetList[0].name}}
          </el-button>
          <el-button
              @click="value.files.overBudgetList.length = 0; value.files.overBudgetFile = null; value.files.overBudgetId = null;"
              class="delete-scan-button"
          >
            X
          </el-button>
        </div>
      </el-col>
    </el-row>
    <br/>
  </div>
</template>

<script>
import {inject, ref} from "vue";
export default {
  name  : "addTripUser",
  props : ['value'],
  setup(props){
    const loadJson    = inject('loadJson');
    const svg         = inject('svg');
    const errors      = inject('errors');
    const user        = inject('user');
    const notify      = inject('notify');

    const loading     = ref(false);

    const uploadOverBudget    = ref();
    const uploadOverBudgetBtn = (files) => {
      uploadOverBudget.value.clearFiles()
      const file = files[0]
      file.uid = genFileId()
      uploadOverBudget.value.handleStart(file)
    };
    const overBudgetFile      = (file) => {
      props.value.files.overBudgetFile = file
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

    // function searchResponsible(query){
    //   let url = '/business-trip/search/user';
    //   if (query !== '')
    //     search(query,'responsible', url);
    // };
    //
    // function searchDepartment(query){
    //   let url = '/business-trip/search/department';
    //   if (query !== '')
    //     search(query,'department', url);
    // };
    //
    // function searchCompany(query){
    //   let url = '/business-trip/search/company';
    //   if (query !== '')
    //     search(query,'company', url);
    // };

    function searchAccountant(query){
      let url = '/business-trip/search/user';
      if (query !== '')
        search(query,'accountant', url);
    };

    function companyChange(id){
      let select_company = user.company.find(el => {return el.id == id});

      props.value.checking_account = null;
      props.value.checking_account_list.length = 0;

      select_company.accountNumber.forEach(account => props.value.checking_account_list.push({value : account, label : account}));
    };

    async function search(query, key, url){
      loading.value = true;
      let result = await loadJson(url, {q: query});
      if (result.status === 'success' && result.data) {
        //if (key === 'responsible')  props.value.responsible_list = result.data;
        //if (key === 'department')   props.value.department_list = result.data;
        //if (key === 'company')      props.value.company_list = result.data;
        if (key === 'accountant')   props.value.accountant_list = result.data;
      };
      loading.value = false;
    };

    return{
      errors, svg, loading, user, uploadOverBudget, uploadOverBudgetBtn, overBudgetFile,
      searchAccountant, companyChange, downLoadFile,
    }
  },
}
</script>

<style scoped>

</style>