<template>
  <el-button class="returnButton" @click="goBack">Вернуться назад</el-button>
</template>
<script setup>

import { useRouter } from 'vue-router';
import {inject} from "vue";
const router      = useRouter();
const taskId = inject('taskId');

function goBack(){
  //if(router.previous == 'detailTask') {router.push({name:'detailTask'}); return} //это на случай если из деталки будет переход в редактирование и чтоб потом уйти назад в деталку... и там дальше надо будет думать по факту
  router.back(1);
};

</script>

<style scoped>

</style>