<template>
  <div
      v-loading="loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="app_container"
  >
    <Process
        :data="data"
        :process_id="6"
        :document_id="route.params.id"
        :user="user.id"
        @process="getProcess"
    />
  </div>


</template>

<script>
import {ref, provide, inject, reactive} from 'vue';
import Process from "../../../../process/Process"
import { useRoute } from 'vue-router';
export default {
  name: "process",
  props: ['task'],
  components: {Process},
  setup(props){
    const route             = useRoute();

    const user              = inject('user');
    const loadJson          = inject('loadJson');
    const notify            = inject('notify');
    const svg               = inject('svg');
    const taskStatus        = inject('taskStatus');

    const loading           = ref(false);
    provide('loading', loading);

    let data                = {
      executor : props.task[0].value,
      date     : props.task[8].value,
    };

    async function getProcess(item){
      let status = {
        //статусы командировки
        19 : 'fixing_problem', //это если вернули на доработки
        20 : 'approving',
        21 : 'signing',
        22 : 'working' ,
      };

      //ниже если прошло аннулирование процесса надо статусы вернуть на предыдущие
      if(!item.status_current && ['approving', 'signing'].includes(taskStatus.value)){

        let status = item.history[item.history.length - 1].result.indexOf('Вернуть на корректировку') < 0  ? 'created' : 'fixing_problem'; // не совсем уданый вариант.. но по другому никак
        loading.value = true;
        let result = await loadJson('/business-trip/change-status', {
          task_id : route.params.id,
          user_id : user.id,
          status,
        });
        loading.value = false;
        if (result.status == 'success') {
          taskStatus.value = status;
        } else notify('Ошибка при аннулировании', `При аннулировании процесса согласования/утверждения задания для командировки возникла ошибка!`, 'error');
      };

      //обновляем статус командировки от модуля согласования если прошло изменение
      if (status[item.status_current] && taskStatus.value != status[item.status_current]) {
        loading.value = true;
        let result = await loadJson('/business-trip/change-status', {
          task_id : route.params.id,
          user_id : user.id,
          status  : status[item.status_current]
        });
        loading.value = false;
        if (result.status == 'success') {
          taskStatus.value = status[item.status_current];
        } else notify('Ошибка при изменении статуса', `При изменении статуса у задания для командировки возникла ошибка!`, 'error');
      };
    }

    return { route, data, user, loading, svg,
      getProcess
    }
  },
}
</script>

<style scoped>

</style>