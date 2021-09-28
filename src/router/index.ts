import { createRouter, createWebHistory} from 'vue-router'
import Layout from "../components/Layout.vue";
import BaseInput from '../components/BaseInput.vue'
import About from '../components/About.vue'


const routes = [
  {
		path: '/',
		component: Layout,
		children: [{
			path: '',
			component: BaseInput
		}]
	},
	{
		path: '/about',
		component: Layout,
		children: [
			{
				path:'',
				component: About
			}
		]
	}
]

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes: routes, // short for `routes: routes`
})

export default router