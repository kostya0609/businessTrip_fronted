<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <h3>Пользователи</h3>

  </div>
</template>
<script>
import {ref, inject, reactive} from "vue";
import { useRouter, useRoute } from 'vue-router';

export default {
  name: "listUsersIndex",

  setup(){
    const router       = useRouter();
    const route        = useRoute();

    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');

    const user         = inject('user');

    const loading      = ref(false);

    return{
      loading, svg,
    }
  }
}
</script>