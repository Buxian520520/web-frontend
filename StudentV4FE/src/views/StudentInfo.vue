<template>
  <div>
    <el-container>
      <!-- 主窗体 -->
      <el-main>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>学生管理</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 表单 -->
        <el-form :inline="true" style="margin-top:30px;">
          <el-row>
            <el-col :span="12">
              <el-form-item label="请输入查询条件：">
                <el-input v-model="inputStr" placeholder="输入查询条件" style="width: 420px;">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8" style="text-align: right;padding-right:10px;">
              <el-button-group>
                <el-button type="primary" icon="el-icon-search" @click="queryStudents()">查询
                </el-button>
                <el-button type="primary" icon="el-icon-tickets" @click="getAllStudents()">全部
                </el-button>
                <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addStudent()">
                  添加
                </el-button>
              </el-button-group>
            </el-col>
            <el-col :span="2">
              <el-upload :show-file-list="false" :http-request="uploadExcelPost">
                <el-button type="primary">导入Excel</el-button>
              </el-upload>
            </el-col>
            <el-col :span="2">
              <el-button type="primary" @click="exportToExcel()">导出Excel</el-button>
            </el-col>
          </el-row>
        </el-form>
        <!-- 表格 -->
        <el-table :data="pageStudents" border style="width: 100%" size="mini"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection">
          </el-table-column>
          <el-table-column type="index" label="序号" align="center" width="60">
          </el-table-column>
          <el-table-column prop="sno" label="学号" width="80">
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="80">
          </el-table-column>
          <el-table-column prop="gender" label="性别" width="60">
          </el-table-column>
          <el-table-column prop="birthday" label="出生日期" align="center" width="100">
          </el-table-column>
          <el-table-column prop="mobile" label="电话" align="center" width="120">
          </el-table-column>
          <el-table-column prop="email" label="邮箱" align="center" width="220">
          </el-table-column>
          <el-table-column prop="address" label="地址" align="center">
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <el-button type="success" icon="el-icon-more" size="mini" circle
                         @click="viewStudent(scope.row)"></el-button>
              <el-button type="primary" icon="el-icon-edit" size="mini" circle
                         @click="updateStudent(scope.row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" circle
                         @click="deleteStudent(scope.row)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-row style="margin-top: 20px;">
          <el-col :span="8" style="text-align: left">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteStudents()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="16" style="text-align: right">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                           :current-page="currentpage" :page-sizes="[5, 10, 50, 100]" :page-size="pagesize"
                           layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
          </el-col>
        </el-row>
        <!-- 弹出框的学生明细表单 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%"
                   @close="closeDialogForm('studentForm')">
          <el-form :model="studentForm" :rules="rules" ref="studentForm" :inline="true"
                   style="margin-left: 20px;"
                   label-width="110px" label-position="right" size="mini">
            <el-upload class="avatar-uploader" :show-file-list="false" :http-request="uploadPicturePost"
                       :disabled="isView" style="text-align: center;margin:20px;">
              <img v-if="studentForm.image" :src="studentForm.imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <el-form-item label="学号：" prop="sno">
              <el-input v-model="studentForm.sno" :disabled="isEdit||isView"
                        suffix-icon="el-icon-edit"></el-input>
            </el-form-item>
            <el-form-item label="姓名：" prop="name">
              <el-input v-model="studentForm.name" :disabled="isView" suffix-icon="el-icon-edit">
              </el-input>
            </el-form-item>
            <el-form-item label="性别：" prop="gender">
              <el-select v-model="studentForm.gender" :disabled="isView" placeholder="请选择性别">
                <el-option value="男"></el-option>
                <el-option value="女"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="出生日期：" prop="birthday">
              <el-date-picker v-model="studentForm.birthday" value-format="yyyy-MM-dd" :disabled="isView"
                              type="date" placeholder="选择日期" style="width:93% ">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="手机号码：" prop="mobile">
              <el-input v-model="studentForm.mobile" :disabled="isView"
                        suffix-icon="el-icon-edit"></el-input>
            </el-form-item>
            <el-form-item label="邮箱地址：" prop="email">
              <el-input v-model="studentForm.email" :disabled="isView" suffix-icon="el-icon-edit">
              </el-input>
            </el-form-item>
            <el-form-item label="家庭住址：" prop="address">
              <el-input v-model="studentForm.address" :disabled="isView" suffix-icon="el-icon-edit"
                        style="width:262%"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" size="mini" v-show="!isView" @click="submitStudentForm('studentForm')">确定</el-button>
            <el-button type="info" size="mini" @click="closeDialogForm('studentForm')">取 消</el-button>
          </span>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'StudentInfo',
  data() {
    const rulesSNo = (rule, value, callback) => {
      if (this.isEdit) {
        callback();
        return;
      }
      //使用Axios进行校验
      axios.post(
        this.baseURL + 'sno/check/',
        {
          sno: value,
        }
      )
        .then((res) => {
          //请求成功
          if (res.data.code === 1) {
            if (res.data.exists) {
              callback(new Error("学号已存在！"));
            } else {
              callback();
            }
          } else {
            //请求失败
            callback(new Error("校验学号后端出现异常！"))
          }
        })
        .catch((err) => {
          //如果请求失败在控制台打印
          console.log(err);
        });
    }
    return {
      students: [], //所有的学生信息
      pageStudents: [], //分页后当前页的学生
      baseURL: "http://127.0.0.1:8000/",
      inputStr: '', //输入的查询条件
      selectStudents: [], //选择复选框是把选择记录存在这个几个

      //====分页相关的变量====
      total: 0, //数据的总行数
      currentpage: 1, //当前的所在的页
      pagesize: 10, //每页显示多少行数据
      //====弹出框表单====
      dialogVisible: false, //控制弹出框表单是否展示
      dialogTitle: "", //弹出框的标题
      isView: false, //标识是否是查看
      isEdit: false, //标识是否是修改
      studentForm: {    //弹出框表单对相应绑定数据
        sno: '',
        name: '',
        gender: '',
        birthday: '',
        mobile: '',
        email: '',
        address: '',
        image: '',
        imageUrl: '',
      },
      rules: {
        sno: [
          { required: true, message: '学号不能为空', trigger: 'blur' },
          { pattern: /^[9][5]\d{3}$/, message: '学号必须是95开头的五位数', trigger: 'blur' },
          { validator: rulesSNo, trigger: 'blur' }, //校验学号是否存在！
        ],
        name: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { pattern: /^[\u4e00-\u9fa5]{2,5}$/, message: '姓名必须是2-5个汉字', trigger: 'blur' },
        ],
        gender: [
          { required: true, message: '性别不能为空', trigger: 'change' },
        ],
        birthday: [
          { required: true, message: '出生日期不能为空', trigger: 'change' },
        ],
        mobile: [
          { required: true, message: '手机号码不能为空', triggler: 'blur' },
          { pattern: /^[1][35789]\d{9}$/, message: '手机号码必须要符合规范', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          { pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: '邮箱地址必须要符合规范', trigger: 'blur' },
        ],
        address: [
          { required: true, message: '家庭住址不能为空', trigger: 'blur' },
        ]
      }
    }
  },
  mounted() {
    //自动加载数据
    this.getStudents();
  },
  methods: {
    //获取所有学生信息
    getStudents: function () {
      //记录this的地址
      let that = this
      //使用Axios实现Ajax请求
      axios
        .get(that.baseURL + "students/")
        .then(function (res) {
          //请求成功后执行的函数
          if (res.data.code === 1) {
            //把数据给students
            that.students = res.data.data;
            //获取返回记录的总行数
            that.total = res.data.data.length;
            //获取当前页的数据
            that.getPageStudents();
            //提示：
            that.$message({
              message: '数据加载成功！',
              type: 'success'
            });


          } else {
            //失败的提示！
            that.$message.error(res.data.msg);

          }
        })
        .catch(function (err) {
          //请求失败后执行的函数
          console.log(err);
        });
    },
    getAllStudents() {
      //清空输入的inputStr
      this.inputStr = "";
      //获取所有的数据
      this.getStudents();
    },
    //获取当前页的学生数据
    getPageStudents() {
      //清空pageStudents中的数据
      this.pageStudents = [];
      //获得当前页的数据
      for (let i = (this.currentpage - 1) * this.pagesize; i < this.total; i++) {
        //遍历数据添加到pageStudent中
        this.pageStudents.push(this.students[i]);
        //判断是否达到一页的要求
        if (this.pageStudents.length === this.pagesize) break;
      }
    },
    //实现学生信息查询
    queryStudents() {
      //使用Ajax请求--POST-->传递InputStr
      let that = this
      //开始Ajax请求
      axios
        .post(
          that.baseURL + "students/query/",
          {
            inputstr: that.inputStr,
          }
        )
        .then(function (res) {
          if (res.data.code === 1) {
            //把数据给students
            that.students = res.data.data;
            //获取返回记录的总行数
            that.total = res.data.data.length;
            //获取当前页的数据
            that.getPageStudents();
            //提示：
            that.$message({
              message: '查询数据加载成功！',
              type: 'success'
            });

          } else {
            //失败的提示！
            that.$message.error(res.data.msg);
          }
        })
        .catch(function (err) {
          console.log(err);
          that.$message.error("获取后端查询结果出现异常！");
        });
    },
    //添加学生时打开表单
    addStudent() {
      //修改标题
      this.dialogTitle = "添加学生明细";
      //弹出表单
      this.dialogVisible = true;
    },
    //根据Id获取image
    getImageBySno(sno) {
      //遍历
      for (let oneStudent of this.students) {
        //判断
        if (oneStudent.sno == sno) {
          return oneStudent.image;
        }
      }
    },
    //查看学生的明细
    viewStudent(row) {
      //修改标题
      this.dialogTitle = "查看学生明细";
      //修改isView变量
      this.isView = true;
      //弹出表单
      this.dialogVisible = true;
      //深拷贝方法：
      this.studentForm = JSON.parse(JSON.stringify(row))
      //获取照片
      this.studentForm.image = this.getImageBySno(row.sno);
      //获取照片URL
      this.studentForm.imageUrl = this.baseURL + 'media/' + this.studentForm.image;

    },
    //修改学生的明细
    updateStudent(row) {
      //修改标题
      this.dialogTitle = "修改学生明细";
      //修改isEdit变量
      this.isEdit = true;
      //弹出表单
      this.dialogVisible = true;
      //深拷贝方法：
      this.studentForm = JSON.parse(JSON.stringify(row))
      //获取照片
      this.studentForm.image = this.getImageBySno(row.sno);
      //获取照片URL
      this.studentForm.imageUrl = this.baseURL + 'media/' + this.studentForm.image;

    },
    //提交学生的表单（添加、修改）
    submitStudentForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //校验成功后，执行添加或者修改？
          if (this.isEdit) {
            //修改
            this.submitUpdateStudent();
          } else {
            //添加
            this.submitAddStudent();
          }

        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    //添加到数据库的函数
    submitAddStudent() {
      //定义that
      let that = this;
      //执行Axios请求
      axios
        .post(that.baseURL + 'student/add/', that.studentForm)
        .then(res => {
          //执行成功
          if (res.data.code === 1) {
            //获取所有学生的信息
            that.students = res.data.data;
            //获取记录条数
            that.total = res.data.data.length;
            //获取分页信息
            that.getPageStudents();
            //提示：
            that.$message({
              message: '数据添加成功！',
              type: 'success'
            });
            //关闭窗体
            this.closeDialogForm('studentForm');
          } else {
            //失败的提示！
            that.$message.error(res.data.msg);
          }
        })
        .catch(err => {
          //执行失败
          console.log(err);
          that.$message.error("获取后端查询结果出现异常！");
        })
    },
    //修改更新到数据库
    submitUpdateStudent() {
      //定义that
      let that = this;
      //执行Axios请求
      axios
        .post(that.baseURL + 'student/update/', that.studentForm)
        .then(res => {
          //执行成功
          if (res.data.code === 1) {
            //获取所有学生的信息
            that.students = res.data.data;
            //获取记录条数
            that.total = res.data.data.length;
            //获取分页信息
            that.getPageStudents();
            //提示：
            that.$message({
              message: '数据修改成功！',
              type: 'success'
            });
            //关闭窗体
            this.closeDialogForm('studentForm');
          } else {
            //失败的提示！
            that.$message.error(res.data.msg);
          }
        })
        .catch(err => {
          //执行失败
          console.log(err);
          that.$message.error("修改时获取后端查询结果出现异常！");
        })

    },
    //删除一条学生记录
    deleteStudent(row) {
      //等待确认
      this.$confirm('是否确认删除学生信息【学号：' + row.sno + '\t姓名：' + row.name + '】信息？',
        '提示', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确认删除响应事件
        let that = this
        //调用后端接口
        axios.post(that.baseURL + 'student/delete/', { sno: row.sno })
          .then(res => {
            if (res.data.code === 1) {
              //获取所有学生信息
              that.students = res.data.data;
              //获取记录数
              that.total = res.data.data.length;
              //分页
              that.getPageStudents();
              //提示
              that.$message({
                message: '数据删除成功！',
                type: 'success'
              });
            } else {
              that.$message.error(res.data.msg);
            }
          })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    deleteStudents() {
      //等待确认
      this.$confirm("是否确认批量删除" + this.selectStudents.length + "个学生信息吗？",
        '提示', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确认删除响应事件
        let that = this
        //调用后端接口
        axios.post(that.baseURL + 'students/delete/', { student: that.selectStudents })
          .then(res => {
            if (res.data.code === 1) {
              //获取所有学生信息
              that.students = res.data.data;
              //获取记录数
              that.total = res.data.data.length;
              //分页
              that.getPageStudents();
              //提示
              that.$message({
                message: '数据批量删除成功！',
                type: 'success'
              });
            } else {
              that.$message.error(res.data.msg);
            }
          })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    //关闭弹出框的表单
    closeDialogForm(formName) {
      //重置表单的校验
      this.$refs[formName].resetFields();
      //清空
      this.studentForm.sno = "";
      this.studentForm.name = "";
      this.studentForm.gender = "";
      this.studentForm.birthday = "";
      this.studentForm.mobile = "";
      this.studentForm.email = "";
      this.studentForm.address = "";
      this.studentForm.image = "";
      this.studentForm.imageUrl = "";
      //关闭
      this.dialogVisible = false;
      //初始化isView和isEdit值
      this.isEdit = false;
      this.isView = false;

    },
    //选择学生头像后点击确定后触发的事件
    uploadPicturePost(file) {
      //定义that
      let that = this;
      //定义一个FormData类
      let fileReq = new FormData();
      //把照片穿进去
      fileReq.append('avatar', file.file);
      //使用Axios发起Ajax请求
      axios(
        {
          method: 'post',
          url: that.baseURL + 'upload/',
          data: fileReq
        }
      ).then(res => {
        // 根据code判断是否成功
        if (res.data.code === 1) {
          //把照片给image
          that.studentForm.image = res.data.name;
          //拼接imageurl
          that.studentForm.imageUrl = that.baseURL + "media/" + res.data.name;
        } else {
          //失败的提示！
          that.$message.error(res.data.msg);
        }

      }).catch(err => {
        console.log(err);
        that.$message.error("上传头像出现异常！");
      })

    },
    uploadExcelPost(file) {
      let that = this
      //实例化一个formdata
      //定义一个FormData类
      let fileReq = new FormData();
      //把照片穿进去
      fileReq.append('excel', file.file);
      //使用Axios发起Ajax请求
      axios(
        {
          method: 'post',
          url: that.baseURL + 'excel/import/',
          data: fileReq
        }
      ).then(res => {
        // 根据code判断是否成功
        if (res.data.code === 1) {
          //把照片给image
          that.students = res.data.data;
          //计算总共多少条
          that.total = res.data.data.length;
          //分页
          that.getPageStudents();
          //弹出框体显示结果
          this.$alert('本次导入完成! 成功：' + res.data.success + '失败：' + res.data.error
            , '导入结果展示', {
            confirmButtonText: '确定',
            callback: action => {
              this.$message({
                type: 'info',
                message: "本次导入失败数量为：" + res.data.error + ",具体的学号：" + res.data.errors,
              });
            }
          });
          //把失败明细打印
          console.log("本次导入失败数量为：" + res.data.error + ",具体的学号：");
          console.log(res.data.errors);
        } else {
          //失败的提示！
          that.$message.error(res.data.msg);
        }

      }).catch(err => {
        console.log(err);
        that.$message.error("上传Excel出现异常！");
      })

    },
    exportToExcel() {
      let that = this
      axios.get(that.baseURL + 'excel/export/')
        .then(res => {
          if (res.data.code === 1) {
            //拼接excel 的完整URL
            let url = that.baseURL + 'media/' + res.data.name;
            //下载
            window.open(url);
          } else {
            that.$message.error("导出Excel出现异常！");
          }
        })
        .catch(err => {
          console.log(err);
        });

    },
    //分页时修改每页的行数
    handleSizeChange(size) {
      //修改当前每页数据行数
      this.pagesize = size;
      //数据重新分页
      this.getPageStudents();
    },
    //调整当前的页码
    handleCurrentChange(pageNumber) {
      //修改当前的页码
      this.currentpage = pageNumber;
      //数据重新分页
      this.getPageStudents();
    },
    //选择复选框时触发的操作
    handleSelectionChange(data) {
      this.selectStudents = data;
      console.log(data);
    },

  },

}
</script>

<style scoped>
.avatar-uploader {
  text-align: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
