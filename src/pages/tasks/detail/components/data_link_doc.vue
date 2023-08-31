<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <p
      v-if="value.length > 0"
      v-for="doc in value"
      :key="doc.ID"
    >
      <el-link
        :href="'/services/workflow/' + (doc.IBLOCK_ID ? doc.IBLOCK_ID : 78 )  + '/element_view/0/' + doc.ID + '/'"
        target="_blank"
      >
        {{doc.CATEGORY_NAME}} : {{doc.NAME}}
      </el-link>
    </p>

    <p
        v-else
    >
      По данному командировочному заданию нет поручений, заведенных в СЭД.
    </p>
  </div>
</template>

<script>
import {inject, ref, reactive} from 'vue'
import { useRoute } from 'vue-router';
export default {
  name  : "data_link_doc",
  props : ['value'],
  setup(props){
    const loadJson          = inject('loadJson');
    const svg               = inject('svg');

    const route             = useRoute();

    let loading             = ref(false);
    const data_link_doc     = reactive([])

    if (props.value.length == 0)  {
      getData()
    }else{
      data_link_doc.length = 0;
      props.value.forEach(el => data_link_doc.push(el));
    };

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/work-follow/get', {task_id : route.params.id});
      loading.value = false;

      if(result.status === 'success' && result.data){
        data_link_doc.length = 0;
        props.value.length = 0;

        result.data.forEach(el => {
          data_link_doc.push(el);
          props.value.push(el);
        })
      };
    };

    return{svg, loading, data_link_doc}
  }
}
</script>

<style scoped>

</style>