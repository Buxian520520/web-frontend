// router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import ClassManage from '../views/ClassManage.vue'
import StudentInfo from '../views/StudentInfo.vue'
import TeacherInfo from '../views/TeacherInfo.vue'
import CourseManage from '../views/CourseManage.vue'
import ImageInfo from '../views/ImageInfo.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/class', component: ClassManage },
  { path: '/student', component: StudentInfo },
  { path: '/teacher', component: TeacherInfo },
  { path: '/course', component: CourseManage },
  { path: '/image', component: ImageInfo },
  { path: '/', redirect: '/student' }
]

const router = new VueRouter({
  routes
})

export default router
