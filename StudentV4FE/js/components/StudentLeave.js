// 学生请假申请组件
const StudentLeave = {
  template: `
    <div>
      <el-container>
        <el-main>
          <!-- 面包屑导航 -->
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>我的请假申请</el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 申请请假表单 -->
          <el-card class="leave-card" style="margin-top: 30px;">
            <div slot="header" class="card-header">
              <span style="font-size: 18px; font-weight: bold;">
                <i class="el-icon-plus"></i> 申请请假
              </span>
            </div>
            
            <el-form :model="leaveForm" :rules="rules" ref="leaveForm" label-width="120px" size="small">
              <el-form-item label="请假类型：" prop="leaveType">
                <el-select v-model="leaveForm.leaveType" placeholder="请选择请假类型" style="width: 100%;">
                  <el-option label="事假" value="事假"></el-option>
                  <el-option label="病假" value="病假"></el-option>
                  <el-option label="其他" value="其他"></el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="开始日期：" prop="startDate">
                <el-date-picker v-model="leaveForm.startDate" value-format="yyyy-MM-dd" type="date" 
                                placeholder="选择开始日期" style="width: 100%;"></el-date-picker>
              </el-form-item>
              
              <el-form-item label="结束日期：" prop="endDate">
                <el-date-picker v-model="leaveForm.endDate" value-format="yyyy-MM-dd" type="date" 
                                placeholder="选择结束日期" style="width: 100%;"></el-date-picker>
              </el-form-item>
              
              <el-form-item label="请假原因：" prop="reason">
                <el-input type="textarea" v-model="leaveForm.reason" :rows="4" 
                          placeholder="请输入请假原因"></el-input>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="submitLeave">提交申请</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 我的请假记录 -->
          <el-card class="leave-list-card" style="margin-top: 30px;">
            <div slot="header" class="card-header">
              <span style="font-size: 18px; font-weight: bold;">
                <i class="el-icon-tickets"></i> 我的请假记录
              </span>
            </div>

            <!-- 查询表单 -->
            <el-form :inline="true" style="margin-bottom: 20px;">
              <el-form-item label="请假状态：">
                <el-select v-model="queryStatus" placeholder="请选择状态" style="width: 200px;" clearable @change="queryLeaves">
                  <el-option label="待审批" value="pending"></el-option>
                  <el-option label="已批准" value="approved"></el-option>
                  <el-option label="已拒绝" value="rejected"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="queryLeaves">查询</el-button>
                <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 请假列表表格 -->
            <el-table :data="pageLeaves" border style="width: 100%" size="mini">
              <el-table-column type="index" label="序号" align="center" width="60"></el-table-column>
              <el-table-column prop="leaveType" label="请假类型" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getLeaveTypeTag(scope.row.leaveType)">{{ scope.row.leaveType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startDate" label="开始日期" width="120" align="center"></el-table-column>
              <el-table-column prop="endDate" label="结束日期" width="120" align="center"></el-table-column>
              <el-table-column prop="days" label="请假天数" width="100" align="center"></el-table-column>
              <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip></el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getStatusTag(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="applyTime" label="申请时间" width="160" align="center"></el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-view" size="mini" @click="viewLeave(scope.row)">查看</el-button>
                  <el-button v-if="scope.row.status === 'pending'" type="danger" icon="el-icon-delete" size="mini" 
                             @click="deleteLeave(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                           :current-page="currentpage" :page-sizes="[5, 10, 50, 100]" :page-size="pagesize"
                           layout="total, sizes, prev, pager, next, jumper" :total="total" 
                           style="margin-top: 20px; text-align: right;">
            </el-pagination>
          </el-card>

          <!-- 查看请假详情对话框 -->
          <el-dialog title="请假详情" :visible.sync="viewDialogVisible" width="50%">
            <el-descriptions :column="2" border v-if="currentLeave">
              <el-descriptions-item label="请假类型">
                <el-tag :type="getLeaveTypeTag(currentLeave.leaveType)">{{ currentLeave.leaveType }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="请假状态">
                <el-tag :type="getStatusTag(currentLeave.status)">{{ getStatusText(currentLeave.status) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ currentLeave.startDate }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ currentLeave.endDate }}</el-descriptions-item>
              <el-descriptions-item label="请假天数">{{ currentLeave.days }} 天</el-descriptions-item>
              <el-descriptions-item label="申请时间">{{ currentLeave.applyTime }}</el-descriptions-item>
              <el-descriptions-item label="请假原因" :span="2">
                <div style="padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
                  {{ currentLeave.reason }}
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="审批意见" :span="2" v-if="currentLeave.status !== 'pending'">
                <div style="padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
                  {{ currentLeave.approvalComment || '无' }}
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="审批时间" v-if="currentLeave.status !== 'pending'">
                {{ currentLeave.approvalTime || '无' }}
              </el-descriptions-item>
            </el-descriptions>
            <span slot="footer" class="dialog-footer">
              <el-button @click="viewDialogVisible = false">关 闭</el-button>
            </span>
          </el-dialog>
        </el-main>
      </el-container>
    </div>
  `,
  data() {
    return {
      baseURL: "http://127.0.0.1:8000/",
      leaveForm: {
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      },
      rules: {
        leaveType: [
          { required: true, message: '请选择请假类型', trigger: 'change' }
        ],
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入请假原因', trigger: 'blur' },
          { min: 5, message: '请假原因至少5个字符', trigger: 'blur' }
        ]
      },
      leaves: [],
      pageLeaves: [],
      currentLeave: null,
      viewDialogVisible: false,
      queryStatus: '',
      total: 0,
      currentpage: 1,
      pagesize: 10
    }
  },
  mounted() {
    this.loadLeaves();
  },
  methods: {
    // 加载请假列表
    loadLeaves() {
      let that = this;
      const token = TokenManager.getAccessToken();
      if (!token) {
        this.$message.error('请先登录');
        return;
      }

      axios.get(that.baseURL + 'leaves/', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(res => {
          if (res.data.code === 1) {
            that.leaves = res.data.data;
            that.total = res.data.data.length;
            that.getPageLeaves();
          } else {
            that.$message.error(res.data.msg || '获取请假列表失败');
          }
        })
        .catch(err => {
          console.error('获取请假列表失败:', err);
          that.$message.error('获取请假列表失败');
        });
    },
    // 提交请假申请
    submitLeave() {
      this.$refs.leaveForm.validate((valid) => {
        if (valid) {
          // 验证日期
          if (this.leaveForm.startDate > this.leaveForm.endDate) {
            this.$message.error('结束日期不能早于开始日期');
            return;
          }

          let that = this;
          const token = TokenManager.getAccessToken();
          if (!token) {
            this.$message.error('请先登录');
            return;
          }

          axios.post(that.baseURL + 'leave/apply/', that.leaveForm, {
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          })
            .then(res => {
              if (res.data.code === 1) {
                that.$message({
                  message: '请假申请提交成功！',
                  type: 'success'
                });
                that.resetForm();
                that.loadLeaves();
              } else {
                that.$message.error(res.data.msg || '申请失败');
              }
            })
            .catch(err => {
              console.error('申请请假失败:', err);
              that.$message.error('申请请假失败');
            });
        } else {
          return false;
        }
      });
    },
    // 重置表单
    resetForm() {
      this.$refs.leaveForm.resetFields();
    },
    // 查询请假记录
    queryLeaves() {
      this.loadLeaves();
    },
    // 重置查询
    resetQuery() {
      this.queryStatus = '';
      this.loadLeaves();
    },
    // 获取当前页的请假记录
    getPageLeaves() {
      let filtered = this.leaves;
      if (this.queryStatus) {
        filtered = filtered.filter(item => item.status === this.queryStatus);
      }
      
      this.pageLeaves = [];
      for (let i = (this.currentpage - 1) * this.pagesize; i < filtered.length && i < (this.currentpage * this.pagesize); i++) {
        this.pageLeaves.push(filtered[i]);
      }
      this.total = filtered.length;
    },
    // 查看请假详情
    viewLeave(row) {
      this.currentLeave = JSON.parse(JSON.stringify(row));
      this.viewDialogVisible = true;
    },
    // 删除请假记录
    deleteLeave(row) {
      this.$confirm('确定要删除这条请假记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this;
        const token = TokenManager.getAccessToken();
        
        axios.post(that.baseURL + 'leave/delete/', {
          leaveIds: [row.id]
        }, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        })
          .then(res => {
            if (res.data.code === 1) {
              that.$message({
                message: '删除成功！',
                type: 'success'
              });
              that.loadLeaves();
            } else {
              that.$message.error(res.data.msg || '删除失败');
            }
          })
          .catch(err => {
            console.error('删除失败:', err);
            that.$message.error('删除失败');
          });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 分页相关方法
    handleSizeChange(size) {
      this.pagesize = size;
      this.currentpage = 1;
      this.getPageLeaves();
    },
    handleCurrentChange(pageNumber) {
      this.currentpage = pageNumber;
      this.getPageLeaves();
    },
    // 获取状态标签类型
    getStatusTag(status) {
      const statusMap = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      };
      return statusMap[status] || '';
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待审批',
        'approved': '已批准',
        'rejected': '已拒绝'
      };
      return statusMap[status] || status;
    },
    // 获取请假类型标签
    getLeaveTypeTag(type) {
      const typeMap = {
        '事假': 'info',
        '病假': 'warning',
        '其他': ''
      };
      return typeMap[type] || '';
    }
  }
}
