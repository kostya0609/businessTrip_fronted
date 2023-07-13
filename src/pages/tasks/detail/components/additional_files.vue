<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <el-row>
      <el-col :span="9">
        <el-upload
            v-model:file-list="value.file_exists"
            drag
            ref="upload"
            action=""
            multiple
            :auto-upload="false"
            :on-change="fileChange"
            :on-remove="fileRemove"
            :on-preview = 'downLoadFile'
            :disabled="taskStatus !== 'created' && taskStatus !== 'fixing_problem' && !full_access"
        >
          <div
              v-if="(taskStatus === 'created' || taskStatus === 'fixing_problem') && full_access"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Перенесите файл в эту область или <em>нажмите на иконку загрузки</em>
            </div>
          </div>
          <div
              v-else
          >
            <p>
              Изменять дополнительные файлы разрешается если командировочное задание имеет статус "На оформлении" или "На устранении замечаний"
            </p>
          </div>

        </el-upload>
      </el-col>
    </el-row>
    <el-row
        v-if="(taskStatus === 'created' || taskStatus === 'fixing_problem') && full_access"
    >
      <el-col :span="4">
        <el-button
            v-if="value.filesChange"
            class="add-edit-footer-button"
            @click="uploadFiles"
        >
          Сохранить
        </el-button>
      </el-col>
      <el-col :span="1">
      </el-col>
      <el-col :span="4">
        <el-button
            v-if="value.filesChange"
            class="add-edit-footer-button"
            @click="getFiles"
        >
          Отменить
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {inject, ref, reactive, watch} from 'vue'
import { useRoute } from 'vue-router';
export default {
  name  : "additional_files",
  props : ['value'],
  setup(props){
    const loadJson       = inject('loadJson');
    const svg            = inject('svg');
    const notify         = inject('notify');
    const taskStatus     = inject('taskStatus');
    const user           = inject('user');
    const full_access    = inject('full_access');

    const route          = useRoute();

    let loading          = ref(false);

    function fileChange(file){
      let newFilName = file.name;

      let err_there_is_file      = !!props.value.file.find(item =>
        newFilName === item.name
      );

      let err_there_is_file_save = !!props.value.file_save.find(item =>
        newFilName === `${item.name}.${item.type}`
      );

      if (!err_there_is_file && !err_there_is_file_save ){
        props.value.file.push(file.raw);
        props.value.filesChange = true;
      } else {
        notify('Ошибка добавления дополнительного файла', 'Файл с таким именем уже существует.', 'error');
        setTimeout(() => {props.value.file_exists.splice(props.value.file_exists.length - 1 , 1)}, 0);
      };
    };

    function fileRemove(file){
      props.value.file_save = props.value.file_save.filter(el => el.id !== file.id);
      props.value.file      = props.value.file.filter(el => el.name !== file.name);
      props.value.filesChange = true;
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

    async function uploadFiles(){

      let additional_files = new FormData();
      additional_files.append('user_id', user.id);
      additional_files.append('task_id', route.params.id);

      for(let i = 0; i < props.value.file.length; i++){
        additional_files.append('file['+i+']', props.value.file[i]);
      }

      for(let i = 0; i < props.value.file_save.length; i++){
        additional_files.append('file_save['+i+']', props.value.file_save[i].id);
      }

      loading.value = true;
      let result = await loadJson('/business-trip/files/update',  additional_files, 'file');

      if (result.status === 'success' && result.file_save){
        props.value.file.length = 0;
        props.value.file_save.length = 0;
        props.value.file_exists.length  =0;
        result.file_save.forEach( file => {
          props.value.file_save.push(file);
          props.value.file_exists.push(file);
        })
        props.value.filesChange = false;
      }
      notify('Сохранение файлов','', result.status)
      loading.value = false;
    };

    async function getFiles(){
      loading.value = true;
      let result = await loadJson('/business-trip/files/get', {task_id : route.params.id, type : 'all'});

      if (result.status === 'success' && result.file_save){
        props.value.file_save.length = 0;
        props.value.file_exists.length  =0;
        result.file_save.forEach( file => {
          props.value.file_save.push(file);
          props.value.file_exists.push(file);
        })
        props.value.filesChange = false;
      } else notify('Получение фалйов','', result.status)
      loading.value = false;
    }

    return{
      svg, loading, taskStatus, full_access,
      uploadFiles, fileChange, fileRemove, downLoadFile, getFiles,
    }
  },

}
</script>

<style scoped>

</style>