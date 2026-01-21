// axios 配置文件
import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 允许携带凭证
  withCredentials: false
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 可以在这里添加token等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 处理错误
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('响应错误:', error.response.status, error.response.data)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('请求错误:', error.request)
    } else {
      // 其他错误
      console.error('错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export default instance
