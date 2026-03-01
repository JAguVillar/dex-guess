import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RoomsView from '../views/RoomsView.vue'
import LobbyView from '../views/LobbyView.vue'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Inicio',
      component: HomeView,
      meta: { bgColor: '#E2DFFE' },
    },
    {
      path: '/rooms',
      name: 'Salas',
      component: RoomsView,
      meta: { bgColor: '#DFEEFF' },
    },
    {
      path: '/lobby',
      name: 'Lobby',
      component: LobbyView,
      meta: { bgColor: '#3c315b' },
    },
    {
      path: '/game',
      name: 'Juego',
      component: GameView,
      meta: { bgColor: '#3c315b' },
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

export default router
