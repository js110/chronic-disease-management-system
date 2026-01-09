<template>
  <Layout>
    <div class="dashboard">
      <h2>系统概览</h2>
      
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalPatients }}</div>
              <div class="stat-label">总患者数</div>
            </div>
            <el-icon class="stat-icon"><User /></el-icon>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeRecords }}</div>
              <div class="stat-label">活跃病历</div>
            </div>
            <el-icon class="stat-icon"><Document /></el-icon>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.todayIndicators }}</div>
              <div class="stat-label">今日指标记录</div>
            </div>
            <el-icon class="stat-icon"><TrendCharts /></el-icon>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.alertCount }}</div>
              <div class="stat-label">异常提醒</div>
            </div>
            <el-icon class="stat-icon"><Warning /></el-icon>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="content-row">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>最近患者</span>
            </template>
            <el-table :data="recentPatients" style="width: 100%">
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="gender" label="性别" />
              <el-table-column prop="phone" label="电话" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button size="small" @click="viewPatient(scope.row.id)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>系统公告</span>
            </template>
            <div class="announcements">
              <div v-for="item in announcements" :key="item.id" class="announcement-item">
                <div class="announcement-title">{{ item.title }}</div>
                <div class="announcement-date">{{ item.date }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import api from '../utils/api'
import { User, Document, TrendCharts, Warning } from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    Layout,
    User,
    Document,
    TrendCharts,
    Warning
  },
  setup() {
    const router = useRouter()
    
    const stats = ref({
      totalPatients: 0,
      activeRecords: 0,
      todayIndicators: 0,
      alertCount: 0
    })
    
    const recentPatients = ref([])
    const announcements = ref([
      { id: 1, title: '慢性病管理系统正式上线', date: '2024-12-17' },
      { id: 2, title: '头像上传功能已修复', date: '2024-12-17' },
      { id: 3, title: '系统运行稳定，欢迎使用', date: '2024-12-16' }
    ])

    const loadDashboardData = async () => {
      try {
        // 加载统计数据
        const [patientsResponse, statsResponse] = await Promise.all([
          api.get('/patients'),
          api.get('/reports/stats')
        ])
        
        // 更新统计数据
        const systemStats = statsResponse.stats || {}
        stats.value.totalPatients = systemStats.totalPatients || 0
        stats.value.activeRecords = systemStats.activeRecords || 0
        stats.value.todayIndicators = systemStats.todayIndicators || 0
        stats.value.alertCount = Math.floor(Math.random() * 5) // 暂时随机生成
        
        // 获取最近的患者（前5个）
        recentPatients.value = (patientsResponse.patients || []).slice(0, 5)
        
      } catch (error) {
        console.error('加载仪表盘数据失败:', error)
      }
    }

    const viewPatient = (patientId) => {
      router.push(`/patients/${patientId}`)
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      stats,
      recentPatients,
      announcements,
      viewPatient
    }
  }
}
</script>

<style scoped>
.dashboard h2 {
  margin-bottom: 20px;
  color: #333;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 3em;
  color: #e6f7ff;
}

.content-row {
  margin-top: 20px;
}

.announcements {
  max-height: 300px;
  overflow-y: auto;
}

.announcement-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.announcement-date {
  color: #999;
  font-size: 12px;
}
</style>