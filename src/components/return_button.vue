<template>
  <el-button class="returnButton" @click="goBack">Вернуться назад</el-button>
</template>
<script setup>

import { useRouter } from 'vue-router';
import {inject} from "vue";
const router = useRouter();
const taskId = inject('taskId');

function goBack(){
  if(!router.previous) {
    router.push({name:'listTasks'});
    return;
  }else{
    if (router.previous === 'addTask' ||router.previous === 'editTask') {
      router.push({name:'listTasks'});
      return;
    }
  }
  router.back(1);
};

</script>

<style scoped>

</style>