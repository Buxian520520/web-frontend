// 讲师信息组件
const TeacherInfo = {
  template: `
    <div>
      <el-container>
        <el-main>
          <!-- 面包屑导航 -->
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>讲师信息</el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 教师信息卡片 -->
          <el-card class="teacher-card" style="margin-top: 30px;">
            <div slot="header" class="card-header">
              <span style="font-size: 20px; font-weight: bold;">
                <i class="el-icon-user-solid"></i> 教师个人信息
              </span>
            </div>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="teacher-avatar">
                  <el-upload class="avatar-uploader" :show-file-list="false" :http-request="uploadAvatar"
                             action="#" style="text-align: center;">
                    <img v-if="teacherInfo.avatar" :src="teacherInfo.avatarUrl" class="avatar-img">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  </el-upload>
                  <div style="text-align: center; margin-top: 10px;">
                    <el-button type="primary" size="mini" @click="uploadAvatar">上传头像</el-button>
                  </div>
                </div>
              </el-col>
              
              <el-col :span="16">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="姓名">
                    <el-input v-model="teacherInfo.name" :disabled="!isEdit" style="width: 200px;"></el-input>
                  </el-descriptions-item>
                  <el-descriptions-item label="工号">
                    <el-input v-model="teacherInfo.teacherNo" :disabled="true" style="width: 200px;"></el-input>
                  </el-descriptions-item>
                  <el-descriptions-item label="年龄">
                    <el-input-number v-model="teacherInfo.age" :disabled="!isEdit" :min="18" :max="100" style="width: 200px;"></el-input-number>
                  </el-descriptions-item>
                  <el-descriptions-item label="性别">
                    <el-select v-model="teacherInfo.gender" :disabled="!isEdit" style="width: 200px;">
                      <el-option label="男" value="男"></el-option>
                      <el-option label="女" value="女"></el-option>
                    </el-select>
                  </el-descriptions-item>
                  <el-descriptions-item label="手机号码">
                    <el-input v-model="teacherInfo.mobile" :disabled="!isEdit" style="width: 200px;"></el-input>
                  </el-descriptions-item>
                  <el-descriptions-item label="邮箱地址">
                    <el-input v-model="teacherInfo.email" :disabled="!isEdit" style="width: 200px;"></el-input>
                  </el-descriptions-item>
                  <el-descriptions-item label="所属部门">
                    <el-input v-model="teacherInfo.department" :disabled="!isEdit" style="width: 200px;"></el-input>
                  </el-descriptions-item>
                  <el-descriptions-item label="职称">
                    <el-select v-model="teacherInfo.title" :disabled="!isEdit" style="width: 200px;">
                      <el-option label="助教" value="助教"></el-option>
                      <el-option label="讲师" value="讲师"></el-option>
                      <el-option label="副教授" value="副教授"></el-option>
                      <el-option label="教授" value="教授"></el-option>
                    </el-select>
                  </el-descriptions-item>
                  <el-descriptions-item label="入职日期">
                    <el-date-picker v-model="teacherInfo.hireDate" value-format="yyyy-MM-dd" :disabled="!isEdit"
                                    type="date" placeholder="选择日期" style="width: 200px;"></el-date-picker>
                  </el-descriptions-item>
                  <el-descriptions-item label="个人简介" :span="2">
                    <el-input type="textarea" v-model="teacherInfo.description" :disabled="!isEdit" 
                              :rows="3" style="width: 100%;"></el-input>
                  </el-descriptions-item>
                </el-descriptions>
                
                <div style="margin-top: 20px; text-align: right;">
                  <el-button v-if="!isEdit" type="primary" icon="el-icon-edit" @click="editInfo">编辑信息</el-button>
                  <template v-else>
                    <el-button type="success" icon="el-icon-check" @click="saveInfo">保存</el-button>
                    <el-button type="info" icon="el-icon-close" @click="cancelEdit">取消</el-button>
                  </template>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-main>
      </el-container>
    </div>
  `,
  data() {
    return {
      baseURL: "http://127.0.0.1:8000/",
      isEdit: false,
      originalInfo: {},
      teacherInfo: {
        name: '',
        teacherNo: '',
        age: 0,
        gender: '',
        mobile: '',
        email: '',
        department: '',
        title: '',
        hireDate: '',
        description: '',
        avatar: '',
        avatarUrl: ''
      }
    }
  },
  mounted() {
    this.loadTeacherInfo();
  },
  methods: {
    // 加载教师信息（调用后端接口）
    loadTeacherInfo() {
      let that = this;
      const token = TokenManager.getAccessToken();
      if (!token) {
        this.$message.error('请先登录');
        return;
      }

      axios.get(that.baseURL + 'teacher/info/', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(res => {
          if (res.data.code === 1) {
            that.teacherInfo = res.data.data;
            // 保存原始信息用于取消编辑
            that.originalInfo = JSON.parse(JSON.stringify(that.teacherInfo));
          } else {
            // 如果未找到教师信息，使用默认值
            that.teacherInfo = res.data.data || {
              name: '',
              teacherNo: '',
              age: 0,
              gender: '',
              mobile: '',
              email: '',
              department: '',
              title: '',
              hireDate: '',
              description: '',
              avatar: '',
              avatarUrl: ''
            };
            that.originalInfo = JSON.parse(JSON.stringify(that.teacherInfo));
          }
        })
        .catch(err => {
          console.error('加载教师信息失败:', err);
          const msg = err?.response?.data?.msg || '加载教师信息失败';
          that.$message.error(msg);
        });
    },
    // 编辑信息
    editInfo() {
      this.isEdit = true;
      // 保存原始信息
      this.originalInfo = JSON.parse(JSON.stringify(this.teacherInfo));
    },
    // 保存信息（调用后端接口）
    saveInfo() {
      let that = this;
      const token = TokenManager.getAccessToken();
      if (!token) {
        this.$message.error('请先登录');
        return;
      }

      axios.post(that.baseURL + 'teacher/update/', that.teacherInfo, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.data.code === 1) {
            that.$message({
              message: '教师信息保存成功！',
              type: 'success'
            });
            that.isEdit = false;
            // 重新加载信息
            that.loadTeacherInfo();
          } else {
            that.$message.error(res.data.msg || '保存失败');
          }
        })
        .catch(err => {
          console.error('保存失败:', err);
          const msg = err?.response?.data?.msg || '保存失败';
          that.$message.error(msg);
        });
    },
    // 取消编辑
    cancelEdit() {
      // 恢复原始信息
      this.teacherInfo = JSON.parse(JSON.stringify(this.originalInfo));
      this.isEdit = false;
    },
    // 上传头像
    uploadAvatar(file) {
      // 这里应该调用后端接口上传头像
      // 由于不修改后端，这里只做前端模拟
      if (file && file.file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.teacherInfo.avatarUrl = e.target.result;
          this.$message({
            message: '头像上传成功！',
            type: 'success'
          });
        };
        reader.readAsDataURL(file.file);
      }
    }
  }
}
