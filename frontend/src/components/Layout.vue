<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-left">
        <h3>慢性病管理系统</h3>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><User /></el-icon>
            {{ currentUser.username }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="$route.path"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/patients">
            <el-icon><User /></el-icon>
            <span>患者管理</span>
          </el-menu-item>
          <el-menu-item index="/medical-records">
            <el-icon><Document /></el-icon>
            <span>病历管理</span>
          </el-menu-item>
          <el-menu-item index="/health-indicators">
            <el-icon><TrendCharts /></el-icon>
            <span>健康指标</span>
          </el-menu-item>
          <el-menu-item index="/medications">
            <el-icon><Memo /></el-icon>
            <span>用药管理</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><DataBoard /></el-icon>
            <span>统计报表</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown, House, Document, TrendCharts, Memo, DataBoard } from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    User,
    ArrowDown,
    House,
    Document,
    TrendCharts,
    Memo,
    DataBoard
  },
  setup() {
    const router = useRouter()
    const currentUser = ref({})

    onMounted(() => {
      const user = localStorage.getItem('user')
      if (user) {
        currentUser.value = JSON.parse(user)
      }
    })

    const handleCommand = async (command) => {
      switch (command) {
        case 'profile':
          // 跳转到个人信息页面
          break
        case 'logout':
          try {
            await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
            
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            ElMessage.success('已退出登录')
            router.push('/login')
          } catch {
            // 用户取消
          }
          break
      }
    }

    return {
      currentUser,
      handleCommand
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #409eff;
  color: white;
  padding: 0 20px;
}

.header-left h3 {
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
}

.sidebar {
  background-color: #545c64;
}

.main-content {
  background-color: #f5f5f5;
  padding: 20px;
}
</style>