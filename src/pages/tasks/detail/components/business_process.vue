<template>
  <div
      v-loading="loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="app_container"
  >
    <h4
        v-if="taskStatus === 'fixing_problem'"
        class="color-red"
    >
      Обратите внимание - текущий статус задания {{MAP[taskStatus]}}. Не запускайте процесс согласования если не уверены, что все замечания устранены!
    </h4>
    <Process
        :config="configProcess"
        @process="getProcess"
    />

    <div class="no-print">
      <el-row>
        <el-col :span="5">
          <el-button
              class="add-edit-footer-button"
              @click="window.print()"
          >
            Печать истории согласования
          </el-button>
        </el-col>
      </el-row>

      <p class="color-red">
        При повторном согласовании (после возврата на корректировку), <span style="text-decoration: underline red">необходимо выбрать всех согласующих заново, независимо от того, приняли они уже решение или нет,</span> т.к. задание было отредактировано.
      </p>
      <h3>Согласующие:</h3>
      <ul style="list-style: none">
        <li>
          - <strong>Непосредственный руководитель</strong> командируемого сотрудника:
          <ul style="list-style: square">
            <li>
              согласовывает план командировки по существу (цель, задачи, сроки, маршрут);
            </li>
            <li>
              отвечает за минимизацию расходов по смете (оптимальный подбор перевозчика, отсутствие "лишних дней", отсутствие использования такси.
            </li>
          </ul>
        </li>
        <br/>
        <li>
          - <strong>Руководитель подразделения/ направления</strong> командируемого сотрудника:
          <ul style="list-style: square">
            <li>
              согласовывает план командировки по существу (цель, задачи, сроки, маршрут);
            </li>
            <li>
              отвечает за минимизацию расходов по смете (оптимальный подбор перевозчика, отсутствие "лишних дней", отсутствие использования такси.
            </li>
          </ul>
        </li>
        <br/>
        <li>
          - <strong>Бухгалтер соответствующего направления</strong>:
          <ul style="list-style: square">
            <li>
              проверяет актуальность цели для данной организации и должности;
            </li>
            <li>
              контролирует цель командировки;
            </li>
            <li>
              контролирует правильность расчета командировочных.
            </li>
          </ul>
        </li>
      </ul>
      <p class="color-red" style="text-decoration: underline red">
        В случае, если командировка не была утверждена в бюджете, в ОБЯЗАТЕЛЬНОМ ПОРЯДКЕ в согласующие добавляются:
      </p>
      <ul style="list-style: none">
        <li>
          - <strong>Заместитель директора департамента по финансам и учету</strong>
          <ul style="list-style: square">
            <li>
              согласовывает внебюджетную командировку с точки зрения финансовых возможностей.
            </li>
          </ul>
        </li>
        <li>
          - <strong>Генеральный директор Компании</strong>
          <ul style="list-style: square">
            <li>
              принимает решение по внебюджетной командировке.
            </li>
          </ul>
        </li>
      </ul>
      <h3>
        Подписант:
      </h3>
      <ul style="list-style: none">
        <li>
          - <strong>Руководитель – держатель бюджета</strong>:
          <ul style="list-style: square">
            <li>
              контролирует минимизацию расходов по смете;
            </li>
            <li>
              принимает решение по командировке.
            </li>
          </ul>
        </li>
      </ul>
    </div>

  </div>

</template>

<script>
import {ref, provide, inject, reactive} from 'vue';
import Process from "../../../../process/Process"
import { useRoute } from 'vue-router';
export default {
  name  : "process",
  props : ['value', 'dots', 'over_budget'],
  components: {Process},
  setup(props){
    const route             = useRoute();
    const user              = inject('user');

    const loadJson          = inject('loadJson');

    const notify            = inject('notify');
    const svg               = inject('svg');
    const taskStatus        = inject('taskStatus');
    const full_access       = inject('full_access');
    const MAP               = inject('MAP')

    const loading           = ref(false);
    provide('loading', loading);

    let sub_title           = reactive({
      city_start : '',
      city_final : '',
      date_start : '',
      date_final : '',
      dots       : '',
      title      : '',
    });

    sub_title.city_start = props.value.find(el => {return el.name_eng === 'city_start'}).value;
    sub_title.city_final = props.value.find(el => {return el.name_eng === 'city_final'}).value;
    sub_title.date_start = props.value.find(el => {return el.name_eng === 'date_start'}).value;
    sub_title.date_final = props.value.find(el => {return el.name_eng === 'date_final'}).value;
    props.dots.forEach(el => sub_title.dots = sub_title.dots +' - ' + el.city_name);
    sub_title.title = `${sub_title.city_start}${sub_title.dots} - ${sub_title.city_final} c ${sub_title.date_start} по ${sub_title.date_final}`

    let configProcess = reactive({
      process_id     : '6',
      document_id    : route.params.id,
      user           : user.id,
      subtitle       : [sub_title.title],
      full_access    : full_access.value,
      update_process : props.over_budget ? [ //данные чтоб добавить/заменить согласованта/утвержданта в процесс
        {
          stage_id        : 777,
          stage_option_id : 777,
          users           : [6362],
          action          : 'add' // replace
        },
      ] : null,
      data_notify    : { //данные для формирования уведомления
        executor : props.value.find(el => {return el.name_eng === 'FIO'}).value,
        date     : props.value.find(el => {return el.name_eng === 'date_start'}).value,
        id       : route.params.id
      }
    })

    async function getProcess(item){
      let status = {
        //статусы командировки
        19 : 'fixing_problem', //это если вернули на доработки
        20 : 'approving',
        21 : 'signing',
        22 : 'working' ,
      };

      //обновляем текущих согласовантов/утверждантов
      let result = await loadJson(
          '/business-trip/actions/update',
          {user_id: user.id, task_id: route.params.id, users_id : item.stage_current_users ? item.stage_current_users : []}
      );

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
      if (!['canceled', 'report_approving', 'completed'].includes(taskStatus.value) && status[item.status_current] && taskStatus.value != status[item.status_current]) {
        loading.value = true;
        let result = await loadJson('/business-trip/change-status', {
          task_id : route.params.id,
          user_id : user.id,
          status  : status[item.status_current]
        });
        loading.value = false;
        if (result.status == 'success') {
          taskStatus.value = status[item.status_current];

          if(status[item.status_current] === 'working'){
            //создать поручение в СЭД
            await workFollow(status[item.status_current]);
          }

        } else notify('Ошибка при изменении статуса', `При изменении статуса у задания для командировки возникла ошибка!`, 'error');
      };
    }

    async function workFollow(status){
      loading.value = true;
      let result = await loadJson('/business-trip/work-follow/set', {task_id : route.params.id, status});
      loading.value = false;

      if(result.status === 'success'){
        notify('Создание поручений в СЭД', `Необходимые для командировочного задания поручения в СЭД созданы.`, result.status);
      }
    };

    return {route, user, loading, svg, taskStatus, MAP, sub_title, configProcess, window,
      getProcess
    }
  },
}
</script>

<style scoped>

</style>