// 配置 axios 默认设置
axios.defaults.baseURL = 'http://127.0.0.1:8000/';
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// 请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('响应错误:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求已发出，但没有收到响应（通常是 CORS 错误或网络错误）
      console.error('请求错误:', error.request);
      // 检查是否是 CORS 错误
      if (error.message && (error.message.includes('CORS') || error.message.includes('Access-Control'))) {
        console.error('CORS 跨域错误：');
        console.error('  当前前端地址: ' + window.location.origin);
        console.error('  后端地址: http://127.0.0.1:8000');
        console.error('  解决方案: 需要在后端 Django 的 settings.py 中添加当前前端地址到 CORS_ALLOWED_ORIGINS');
        console.error('  例如: CORS_ALLOWED_ORIGINS = ["http://localhost:63342", "http://127.0.0.1:5500"]');
      } else {
        console.error('网络错误: 请检查后端服务是否正常运行在 http://127.0.0.1:8000');
      }
    } else {
      // 其他错误
      console.error('错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 路由配置，映射对应vue组件
// 注意：组件代码已分离到 js/components/ 目录下的独立文件中
const routes = [
  { path: '/class', component: ClassManage },
  { path: '/student', component: StudentInfo },
  { path: '/teacher', component: TeacherInfo },
  { path: '/course', component: CourseManage },
  { path: '/image', component: ImageInfo },
  { path: '/leave', component: LeaveManage },  // 教师请假管理
  { path: '/student-leave', component: StudentLeave },  // 学生请假申请
  { path: '/', redirect: '/student' }
]

// 创建路由实例
const router = new VueRouter({
  routes
})

// 创建Vue实例
const app = new Vue({
  el: '#app',
  router,
  data() {
    return {
      activePath: '/student',
      userRole: 'student',  // 用户角色：student/teacher
    }
  },
  methods: {
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 用户点击确定后执行
          if (typeof window.logout === 'function') {
            window.logout();
          } else {
            console.error('全局 logout 函数未定义');
          }
        })
        .catch(() => {
          // 用户点击取消，不执行任何操作
          console.log('已取消退出');
        });
    },
    // 从 token 中获取用户角色
    getUserRole() {
      try {
        const token = TokenManager.getAccessToken()
        if (token) {
          // 解析 JWT token 获取角色
          let decoded = null
          if (typeof jwt_decode !== 'undefined') {
            decoded = jwt_decode(token)
          } else {
            // 手动解析
            const payload = token.split('.')[1]
            decoded = JSON.parse(atob(payload))
          }
          this.userRole = decoded.role || 'student'
        }
      } catch (e) {
        console.error('获取用户角色失败:', e)
        this.userRole = 'student'
      }
    }
  },
  created() {
    // 设置当前激活的菜单
    this.activePath = this.$route.path
    // 从 token 中获取用户角色
    this.getUserRole()
  },
  watch: {
    // 更新激活菜单
    '$route'(to) {
      this.activePath = to.path
    }
  },
})
