// 请假管理组件
const LeaveManage = {
  template: `
    <div>
      <el-container>
        <el-main>
          <!-- 面包屑导航 -->
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>请假管理</el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 查询表单 -->
          <el-form :inline="true" style="margin-top:30px;">
            <el-row>
              <el-col :span="8">
                <el-form-item label="学生姓名：">
                  <el-input v-model="queryForm.studentName" placeholder="请输入学生姓名" style="width: 200px;" clearable>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="请假状态：">
                  <el-select v-model="queryForm.status" placeholder="请选择状态" style="width: 200px;" clearable>
                    <el-option label="待审批" value="pending"></el-option>
                    <el-option label="已批准" value="approved"></el-option>
                    <el-option label="已拒绝" value="rejected"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" style="text-align: right;">
                <el-button type="primary" icon="el-icon-search" @click="queryLeaves">查询</el-button>
                <el-button type="primary" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
              </el-col>
            </el-row>
          </el-form>

          <!-- 请假列表表格 -->
          <el-table :data="pageLeaves" border style="width: 100%" size="mini" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" label="序号" align="center" width="60"></el-table-column>
            <el-table-column prop="studentName" label="学生姓名" width="100" align="center"></el-table-column>
            <el-table-column prop="studentNo" label="学号" width="100" align="center"></el-table-column>
            <el-table-column prop="leaveType" label="请假类型" width="120" align="center">
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
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-view" size="mini" @click="viewLeave(scope.row)">查看</el-button>
                <el-button v-if="scope.row.status === 'pending'" type="success" icon="el-icon-check" size="mini" 
                           @click="approveLeave(scope.row)">批准</el-button>
                <el-button v-if="scope.row.status === 'pending'" type="danger" icon="el-icon-close" size="mini" 
                           @click="rejectLeave(scope.row)">拒绝</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-row style="margin-top: 20px;">
            <el-col :span="8" style="text-align: left">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="batchDelete" :disabled="selectLeaves.length === 0">
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

          <!-- 查看请假详情对话框 -->
          <el-dialog title="请假详情" :visible.sync="viewDialogVisible" width="50%">
            <el-descriptions :column="2" border v-if="currentLeave">
              <el-descriptions-item label="学生姓名">{{ currentLeave.studentName }}</el-descriptions-item>
              <el-descriptions-item label="学号">{{ currentLeave.studentNo }}</el-descriptions-item>
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
              <el-button v-if="currentLeave && currentLeave.status === 'pending'" type="success" 
                         @click="approveLeave(currentLeave)">批准</el-button>
              <el-button v-if="currentLeave && currentLeave.status === 'pending'" type="danger" 
                         @click="rejectLeave(currentLeave)">拒绝</el-button>
            </span>
          </el-dialog>

          <!-- 审批对话框 -->
          <el-dialog :title="approvalDialogTitle" :visible.sync="approvalDialogVisible" width="40%">
            <el-form :model="approvalForm" label-width="100px">
              <el-form-item label="审批意见">
                <el-input type="textarea" v-model="approvalForm.comment" :rows="4" 
                          placeholder="请输入审批意见（可选）"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="approvalDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="submitApproval">确 定</el-button>
            </span>
          </el-dialog>
        </el-main>
      </el-container>
    </div>
  `,
  data() {
    return {
      baseURL: "http://127.0.0.1:8000/",
      queryForm: {
        studentName: '',
        status: ''
      },
      leaves: [], // 所有请假记录
      pageLeaves: [], // 分页后的请假记录
      selectLeaves: [], // 选中的请假记录
      currentLeave: null, // 当前查看的请假记录
      viewDialogVisible: false, // 查看对话框显示
      approvalDialogVisible: false, // 审批对话框显示
      approvalDialogTitle: '', // 审批对话框标题
      approvalForm: {
        comment: '',
        action: '' // 'approve' 或 'reject'
      },
      // 分页相关
      total: 0,
      currentpage: 1,
      pagesize: 10
    }
  },
  mounted() {
    this.loadLeaves();
  },
  methods: {
    // 加载请假列表（调用后端接口）
    loadLeaves() {
      let that = this;
      const token = TokenManager.getAccessToken();
      if (!token) {
        this.$message.error('请先登录');
        return;
      }

      // 构建查询参数
      let params = {};
      if (this.queryForm.studentName) {
        params.student_name = this.queryForm.studentName;
      }
      if (this.queryForm.status) {
        params.status = this.queryForm.status;
      }

      axios.get(that.baseURL + 'leaves/', {
        params: params,
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(res => {
          if (res.data.code === 1) {
            that.leaves = res.data.data;
            that.total = res.data.data.length;
            that.getPageLeaves();
            that.$message({
              message: '请假数据加载成功！',
              type: 'success'
            });
          } else {
            that.$message.error(res.data.msg || '获取请假列表失败');
          }
        })
        .catch(err => {
          console.error('获取请假列表失败:', err);
          that.$message.error('获取请假列表失败');
        });
    },
    // 查询请假记录
    queryLeaves() {
      this.currentpage = 1;
      this.loadLeaves();
    },
    // 重置查询
    resetQuery() {
      this.queryForm = {
        studentName: '',
        status: ''
      };
      this.loadLeaves();
    },
    // 获取当前页的请假记录
    getPageLeaves() {
      this.pageLeaves = [];
      for (let i = (this.currentpage - 1) * this.pagesize; i < this.total && i < this.leaves.length; i++) {
        this.pageLeaves.push(this.leaves[i]);
        if (this.pageLeaves.length === this.pagesize) break;
      }
    },
    // 查看请假详情
    viewLeave(row) {
      this.currentLeave = JSON.parse(JSON.stringify(row));
      this.viewDialogVisible = true;
    },
    // 批准请假
    approveLeave(row) {
      this.currentLeave = row;
      this.approvalDialogTitle = '批准请假';
      this.approvalForm = {
        comment: '',
        action: 'approve'
      };
      this.approvalDialogVisible = true;
    },
    // 拒绝请假
    rejectLeave(row) {
      this.currentLeave = row;
      this.approvalDialogTitle = '拒绝请假';
      this.approvalForm = {
        comment: '',
        action: 'reject'
      };
      this.approvalDialogVisible = true;
    },
    // 提交审批
    submitApproval() {
      if (!this.currentLeave) return;
      
      let that = this;
      const token = TokenManager.getAccessToken();
      if (!token) {
        this.$message.error('请先登录');
        return;
      }

      const url = this.approvalForm.action === 'approve' 
        ? that.baseURL + 'leave/approve/'
        : that.baseURL + 'leave/reject/';

      axios.post(url, {
        leaveId: this.currentLeave.id,
        comment: this.approvalForm.comment
      }, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.data.code === 1) {
            that.$message({
              message: that.approvalForm.action === 'approve' ? '请假已批准！' : '请假已拒绝！',
              type: 'success'
            });
            that.approvalDialogVisible = false;
            that.viewDialogVisible = false;
            that.loadLeaves();
          } else {
            that.$message.error(res.data.msg || '审批失败');
          }
        })
        .catch(err => {
          console.error('审批失败:', err);
          that.$message.error('审批失败');
        });
    },
    // 批量删除
    batchDelete() {
      if (this.selectLeaves.length === 0) {
        this.$message.warning('请选择要删除的记录');
        return;
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectLeaves.length} 条请假记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this;
        const token = TokenManager.getAccessToken();
        if (!token) {
          this.$message.error('请先登录');
          return;
        }

        const ids = this.selectLeaves.map(item => item.id);
        axios.post(that.baseURL + 'leave/delete/', {
          leaveIds: ids
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
      this.getPageLeaves();
    },
    handleCurrentChange(pageNumber) {
      this.currentpage = pageNumber;
      this.getPageLeaves();
    },
    handleSelectionChange(data) {
      this.selectLeaves = data;
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
