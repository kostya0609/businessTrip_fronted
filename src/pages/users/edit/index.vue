<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>Редактирование пользователя</h3>
      <returnButton/>
    </div>

    <div class="add-edit-footer">
      <el-button
          class="add-edit-footer-button"
          @click="saveUser"
      >
        Сохранить
      </el-button>
    </div>

  </div>
</template>
<script>
import returnButton from "../../../components/return_button";
import {ref, inject, reactive} from "vue";
import { useRouter, useRoute } from 'vue-router';

export default {
  name: "editUserIndex",
  components: {returnButton},

  setup(){
    const router       = useRouter();
    const route        = useRoute();

    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');

    const user         = inject('user');

    const loading      = ref(false);
    const editUser      = reactive({});

    async function saveUser(){
      let result = await loadJson('/business-trip/user/add_edit', {...editUser, user_id : user.id});
      if (result.status === 'success') {
        router.push({name:'listUsers' });
      };
    }

    return{
      loading, svg,
      saveUser
    }
  }
}
</script>