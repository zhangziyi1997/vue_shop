import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
 {
   path: '/login',
   component: Login
 },
 {
  path: '/home',
  component: Home
}
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫，进行token验证，有token可以进入后台主页，没有token强制返回登录页面
router.beforeEach((to,from,next)=> {
  // 如果用户访问登录页面直接放行
  if(to.path === '/login') return next();
  // 先判断用户是否有token，没有强制返回登录页面，有则放行
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) {
    return next('/login')
  }else {
    next()
  }
}) 

export default router
