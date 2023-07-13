<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div style="padding: 15px">
      <el-row>
        <el-col :span="20">
          <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </el-col>
        <el-col :span="4" align="right">
          <el-switch
              v-model="activeCities"
              active-text="Актив."
              inactive-text="Не актив."
          />
        </el-col>
      </el-row>
      <br/>

      <el-row>
        <el-col :span="12">
          <el-select
              v-model="find_city.id"
              :class="['add-edit-element']"
              filterable
              remote
              reserve-keyword
              :remote-method="findCity"
              placeholder="Поиск города в базе по названию"
          >
            <el-option
                v-for="item in find_city.list"
                :key="item.value"
                :label="`ID - ${item.value}, ${item.label}, население - ${item.population}`"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
      </el-row>

      <br/>
      <el-table :data="cities" style="width: 100%" border max-height="600" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="Название"/>
        <el-table-column prop="region" label="Регион" />
        <el-table-column prop="population" label="Население" />
        <el-table-column label="Активность" width="110">
          <template #default="scope">
            {{scope.row.active ? 'Да' : 'Нет'}}
          </template>
        </el-table-column>
        <el-table-column label="Действие" width="160">
          <template #default="scope">
            <el-button
                size="small"
                type="info"
                @click="cityEdit(scope.$index, scope.row)"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-switch
                v-model="scope.row.active"
                size="small"
                :active-icon="Check"
                :inactive-icon="Close"
                style="margin-left: 15px"
                @click="changeActive(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <br/>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

  </div>
</template>
<script>
import { Check, Close } from '@element-plus/icons-vue'
import {ref, inject, reactive, watch} from "vue";
import { useRouter, useRoute } from 'vue-router';
import  {ElMessageBox }  from 'element-plus';

export default {
  name: "citiesIndex",

  setup(){
    const router       = useRouter();
    const route        = useRoute();

    const loadJson     = inject('loadJson');
    const svg          = inject('svg');
    const notify       = inject('notify');
    const user         = inject('user');
    const loading      = ref(false);

    user.roles.indexOf('admin') >= 0 ? '' : router.push({name : 'listTasks'});

    const currentPage  = ref(1);
    const pageSize     = ref(10);
    const total        = ref(1000);
    const sort         = reactive({name : 'id', order : 'asc' });
    const activeCities = ref(true);
    const cities       = reactive([]);

    const find_city    = reactive({
      id   : null,
      list : [],
    })

    const handleSizeChange = (val) => {
      pageSize.value = val;
      getData();
    }
    const handleCurrentChange = (val) => {
      currentPage.value = val;
      getData();
    }

    async function getData(){
      loading.value = true;
      let result = await loadJson('/business-trip/cities/list', {count : pageSize.value, page : currentPage.value, sort, active : activeCities.value ? 1 : 0});
      if (result.status === 'success' && result.data) {
        total.value = result.data.total;
        cities.length = 0;
        result.data.cities.forEach(el => {
          el.active = el.active == 1 ? true : false;
          cities.push(el);
        })
      };
      loading.value = false;
    }
    getData();

    function cityEdit(idx, row){
      router.push({name:'editCity', params: { id: row.id }});
    }

    async function changeActive(idx, row){
      ElMessageBox.confirm(`Вы уверены, что хотите ${row.active ? ' активировать ' : ' дективировать '} город - ${row.name} ?`)
          .then(async () => {
            loading.value = true;
            let result = await loadJson('/business-trip/cities/active', {city_id : row.id, user_id : user.id, active : row.active ? 1 : 0});
            if (result.status =='success') {
              cities.splice(idx, 1);
              total.value = total.value -1;
            } else cities[idx].active = !cities[idx].active;
            loading.value = false;
            notify(`Деактивация города`, result.message, result.status);
          })
          .catch(() => {
            cities[idx].active = !cities[idx].active;
          })
    }

    function findCity(query){
      let url = '/business-trip/search/city';
      if (query !== '')
        search(query,'find_city', url);
    };

    async function search(query, key, url){
      loading.value = true;
      let result = await loadJson(url, {q: query, limit : 30, population : true});
      if (result.status === 'success' && result.data) {
        if (key === 'find_city') find_city.list = result.data;
      };
      loading.value = false;
    };

    watch(
        () => activeCities.value,
        (value) => {currentPage.value = 1; getData()}
    )


    return{
      loading, svg, currentPage, pageSize, total, cities, Check, Close, activeCities, find_city,
      handleSizeChange, handleCurrentChange, cityEdit, changeActive, findCity
    }
  }
}
</script>