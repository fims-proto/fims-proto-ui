import { createRouter, createWebHistory} from 'vue-router'
import BaseInput from '../components/BaseInput.vue'
import About from '../components/About.vue'


const routes = [
  {
		path: '/',
		component: BaseInput,
		// children: [{
		// 	path: '',
		// 	component: () => import(/* webpackChunkName: "example-create" */ '../components/views/Home.vue')
		// }]
	},
	{
		path: '/about',
		component: About
	}
]

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes: routes, // short for `routes: routes`
})

export default router