<template>
  <div>
    <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :router=true
    >
<!--      <el-menu-item v-for="(item, key) in menu" :index="item.path" :key="key">{{item.name}}</el-menu-item>-->
      <template v-for="(item, key) in menu" :key="key">
        <el-menu-item :index="item.path.split('/:')[0]"> {{item.name}} </el-menu-item>
        <span v-if="item.name == 'Требует вашей реакции'" style="position: relative"><span class="badgeItem"> {{needActions}}</span></span>
      </template>

      <el-menu-item
          class="menu-right-element"
          :index="route.meta.path"
      >
        <el-button class="menu-right-element-button">
          Добавить {{route.meta.label}}
        </el-button>
      </el-menu-item>
    </el-menu>
  </div>

</template>

<script>

import {ref, reactive, inject, watchEffect} from "vue";
import {useRoute, useRouter} from 'vue-router'

export default {
  name: "navBar",
  setup(){
    const user     = inject('user');
    const loadJson = inject('loadJson');
    const isAdmin  = ref( user.roles.indexOf('admin') >= 0 ? true : false);

    const route    = useRoute()
    const router   = useRouter()

    const loading  = ref(false);

    const menu     = reactive([]);

    router.getRoutes().forEach(el => {
      if (el.meta.name)
       !el.meta.forAdmin ? menu.push({path : el.path, name : el.meta.name, order : el.meta.order}) : isAdmin.value ? menu.push({path : el.path, name : el.meta.name, order : el.meta.order}) : '';
    })

    menu.sort((a, b) => a.order > b.order ? 1 : -1);

    const activeIndex = ref(null);
    const needActions = ref('');

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/actions/badge', {user_id: user.id})
      loading.value = false;
      if (result.status == 'success' && result.data) needActions.value = result.data.count; else needActions.value = '';
    };
    getData();



    watchEffect(() => { activeIndex.value = route.path })

    return{ activeIndex, menu, route, needActions}
  },
}
</script>

<style scoped>

</style>