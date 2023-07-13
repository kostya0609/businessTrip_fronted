import { createRouter, createWebHistory } from 'vue-router'
import ListTasks from "@/pages/tasks";
import DetailTask from "@/pages/tasks/detail";
import AddEditTask from "@/pages/tasks/add_edit";

import ListTasksNeedAction from "@/pages/task_need_action"

import ListCities from "@/pages/cities";
import AddEditCity from "@/pages/cities/add_edit";

import ListTargets from "@/pages/targets";
import AddEditTarget from "@/pages/targets/add_edit";

import ListCostUnits from "@/pages/cost_units";
import AddEditCostUnit from "@/pages/cost_units/add_edit";

import ListUsers from "@/pages/users";
import UserAdd from "@/pages/users/add";
import UserEdit from "@/pages/users/edit";


const routes = [
  {
    path: '/business-trip/tasks',
    children : [
      {
        path: 'list/',
        name: 'listTasks',
        component: ListTasks,
        meta : { order : 1, name : 'Задания', forAdmin : false, path : '/business-trip/tasks/add', label : 'задание'},
      },
      {
        path: 'add',
        name: 'addTask',
        component: AddEditTask,
      },
      {
        path: 'edit/:id',
        name: 'editTask',
        component: AddEditTask,
      },
      {
        path: 'detail/:id/:page?',
        name: 'detailTask',
        component: DetailTask,
      },
    ]
  },
  {
    path: '/business-trip/tasks-need-action',
    children: [
      {
        path: 'list',
        name: 'listTasksNeedAction',
        component: ListTasksNeedAction,
        meta: {order : 2, name: 'Требует вашей реакции', forAdmin: false, path: '/business-trip/tasks/add', label: 'задание'},
      },
    ]
  },

  {
    path: '/business-trip/cities',
    children: [
      {
        path: 'list',
        name: 'listCities',
        component: ListCities,
        meta : {name : 'Города', forAdmin : true, path : '/business-trip/cities/add', label : 'город', order : 3},
      },
      {
        path: 'add',
        name: 'addCity',
        component: AddEditCity,
      },
      {
        path: 'edit/:id',
        name: 'editCity',
        component: AddEditCity,
      }
    ],
  },

  {
    path: '/business-trip/targets',
    children: [
      {
        path: 'list',
        name: 'listTargets',
        component: ListTargets,
        meta : {order : 4, name : 'Цели', forAdmin : true, path : '/business-trip/targets/add', label : 'цель'},
      },
      {
        path: 'add',
        name: 'addTarget',
        component: AddEditTarget,
      },
      {
        path: 'edit/:id',
        name: 'editTarget',
        component: AddEditTarget,
      },
    ],
  },

  {
    path: '/business-trip/cost-units',
    children: [
      {
        path: 'list',
        name: 'ListCostUnits',
        component: ListCostUnits,
        meta : {order : 5, name : 'Статьи затрат', forAdmin : true, path : '/business-trip/cost-units/add', label : 'статью затрат'},
      },
      {
        path: 'add',
        name: 'addCostUnit',
        component: AddEditCostUnit,
      },
      {
        path: 'edit/:id',
        name: 'editCostUnit',
        component: AddEditCostUnit,
      },
    ],
  },

  {
    path: '/business-trip/users',
    children: [
      {
        path: 'list/:page?',
        name: 'listUsers',
        component: ListUsers,
        meta : {order : 6 ,name : 'Администраторы', forAdmin : true, path : '/business-trip/users/add', label : 'пользователя'},
      },
      {
        path: 'add',
        name: 'userAdd',
        component: UserAdd,
      },
      {
        path: 'edit/:user_id?/:user_name?/:role_id?',
        name: 'userEdit',
        component: UserEdit,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  previous : null,
})

router.beforeEach((to, from, next) => {
   router.previous = from.name;
  !router.getRoutes().find(el => {return el.name === to.name}) ? router.push({name : 'listTasks'}) : '';
  next();
})

export default router
