<template>
  <div>
    <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :router=true
    >
      <el-menu-item v-for="(item, key) in menu" :index="item.path" :key="key">{{item.name}}</el-menu-item>
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
    const user = inject('user');
    const isAdmin  = ref( user.roles.indexOf('admin') >= 0 ? true : false);

    const route    = useRoute()
    const router   = useRouter()

    const menu    = reactive([]);
    router.getRoutes().forEach(el => {
      if (el.meta.name)
       !el.meta.forAdmin ? menu.push({path : el.path, name : el.meta.name}) : isAdmin.value ? menu.push({path : el.path, name : el.meta.name}) : '';
    })

    const activeIndex = ref(null);

    watchEffect(() => { activeIndex.value = route.path })

    return{ activeIndex, menu, route}
  },
}
</script>

<style scoped>

</style>