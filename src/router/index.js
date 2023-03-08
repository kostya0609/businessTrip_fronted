import { createRouter, createWebHistory } from 'vue-router'
import ListTasks from "@/pages/tasks";
import DetailTask from "@/pages/tasks/detail";
import AddEditTask from "@/pages/tasks/add_edit";

import ListCities from "@/pages/cities";
import AddCity from "@/pages/cities/add";
import EditCity from "@/pages/cities/edit";

import ListTargets from "@/pages/targets";
import AddTarget from "@/pages/targets/add";
import EditTarget from "@/pages/targets/edit";

import ListUsers from "@/pages/users";
import UserAdd from "@/pages/users/add";
import UserEdit from "@/pages/users/edit";

const routes = [
  {
    path: '/business-trip/tasks/',
    children : [
      {
        path: 'list',
        name: 'listTasks',
        component: ListTasks,
        meta : {name : 'Задания', forAdmin : false, path : '/business-trip/tasks/add', label : 'задание'},
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
        path: 'detail/:id',
        name: 'detailTask',
        component: DetailTask,
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
        meta : {name : 'Города', forAdmin : false, path : '/business-trip/cities/add', label : 'город'},
      },
      {
        path: 'add',
        name: 'addCity',
        component: AddCity,
      },
      {
        path: 'edit/:id',
        name: 'editCity',
        component: EditCity,
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
        meta : {name : 'Цели', forAdmin : false, path : '/business-trip/targets/add', label : 'цель'},
      },
      {
        path: 'add',
        name: 'addTarget',
        component: AddTarget,
      },
      {
        path: 'edit/:id',
        name: 'editTarget',
        component: EditTarget,
      },
    ],
  },

  {
    path: '/business-trip/users',
    children: [
      {
        path: 'list',
        name: 'listUsers',
        component: ListUsers,
        meta : {name : 'Права доступа', forAdmin : true, path : '/business-trip/users/add', label : 'пользователя'},
      },
      {
        path: 'add',
        name: 'userAdd',
        component: UserAdd,
      },
      {
        path: 'edit/:id',
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

router.beforeEach((to, from, next) => {router.previous = from.name; next()})

export default router
