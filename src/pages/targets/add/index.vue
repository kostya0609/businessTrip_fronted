<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="add-edit-detail-header">
      <h3>Добавление цели</h3>
      <returnButton/>
    </div>

    <div class="add-edit-footer">
      <el-button
          class="add-edit-footer-button"
          @click="saveTarget"
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
  name: "addTargetIndex",
  components: {returnButton},

  setup(){
    const router       = useRouter();
    const route        = useRoute();

    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');

    const user         = inject('user');

    const loading      = ref(false);
    const newTarget    = reactive({});

    async function saveTarget(){
      let result = await loadJson('/business-trip/cities/add_edit', {...newTarget, user_id : user.id});
      if (result.status === 'success') {
        router.push({name:'listTargets' });
      };
    }

    return{
      loading, svg,
      saveTarget
    }
  }
}
</script>