<template>
  <div id="app">
    <el-container>
      <el-header style="height: 80px; display: flex; justify-content: space-between; align-items: center;">
        <!-- 左侧显示：学生信息管理系统 + 用户名 -->
        <div>
          <span id="userWelcome" style="margin-left: 20px"></span>
        </div>

        <!-- 右侧退出按钮 -->
        <el-button type="danger" @click="logout">安全退出</el-button>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px">
          <el-menu
            :default-active="activePath"
            class="el-menu-vertical-demo"
            router>
            <el-menu-item index="/class">
              <i class="el-icon-menu"></i>
              <span slot="title">班级管理123</span>
            </el-menu-item>
            <el-menu-item index="/student">
              <i class="el-icon-user"></i>
              <span slot="title">学生信息</span>
            </el-menu-item>
            <el-menu-item index="/teacher">
              <i class="el-icon-s-custom"></i>
              <span slot="title">讲师信息</span>
            </el-menu-item>
            <el-menu-item index="/course">
              <i class="el-icon-document"></i>
              <span slot="title">课程管理</span>
            </el-menu-item>
            <el-menu-item index="/image">
              <i class="el-icon-image"></i>
              <span slot="title">图像信息</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-container>
          <el-main>
            <!-- 路由视图 -->
            <router-view></router-view>
          </el-main>
          <el-footer style="height: 30px;">学生信息管理系统</el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activePath: '/student',
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
    }
  },
  created() {
    // 设置当前激活的菜单
    this.activePath = this.$route.path
  },
  watch: {
    // 更新激活菜单
    '$route'(to) {
      this.activePath = to.path
    }
  }
}
</script>
