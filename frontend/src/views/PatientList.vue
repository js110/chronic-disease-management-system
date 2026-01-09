<template>
  <Layout>
    <div class="patient-list">
      <div class="page-header">
        <h2>患者管理</h2>
        <el-button type="primary" @click="showAddDialog = true">
          添加患者
        </el-button>
      </div>

      <el-card>
        <el-table :data="patients" style="width: 100%" v-loading="loading">
          <el-table-column label="头像" width="80">
            <template #default="scope">
              <el-avatar 
                :size="50" 
                :src="scope.row.avatar_url ? `http://localhost:3002${scope.row.avatar_url}` : ''"
                :icon="User"
                style="border: 1px solid #ddd; border-radius: 8px;"
              />
            </template>
          </el-table-column>
          <el-table-column prop="patient_id" label="患者编号" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="gender" label="性别" />
          <el-table-column prop="phone" label="联系电话" />
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="viewPatient(scope.row)">
                查看
              </el-button>
              <el-button size="small" type="primary" @click="editPatient(scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="deletePatient(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 添加/编辑患者对话框 -->
      <el-dialog :title="dialogTitle" v-model="showAddDialog" width="600px" @close="resetForm">
        <el-form :model="patientForm" label-width="100px">
          <el-form-item label="头像">
            <div style="display: flex; align-items: center; gap: 15px;">
              <el-avatar 
                :size="80" 
                :src="patientForm.avatar_url ? `http://localhost:3002${patientForm.avatar_url}` : ''"
                :icon="User"
                style="border: 2px solid #ddd; border-radius: 12px;"
              />
              <div>
                <el-upload
                  :action="`http://localhost:3002/api/upload/avatar`"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :on-error="handleAvatarError"
                  :before-upload="beforeAvatarUpload"
                  name="avatar"
                  accept="image/*"
                >
                  <el-button size="small" type="primary">上传头像</el-button>
                </el-upload>
                <div style="font-size: 12px; color: #999; margin-top: 5px;">
                  支持 JPG、PNG 格式，文件大小不超过 5MB
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="患者编号">
            <el-input v-model="patientForm.patient_id" />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="patientForm.name" />
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="patientForm.gender" style="width: 100%">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="patientForm.phone" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="savePatient">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import Layout from '../components/Layout.vue'
import api from '../utils/api'

export default {
  name: 'PatientList',
  components: {
    Layout,
    User
  },
  setup() {
    const router = useRouter()
    
    const loading = ref(false)
    const showAddDialog = ref(false)
    const isEditing = ref(false)
    const currentPatientId = ref(null)
    const patients = ref([])
    
    const patientForm = reactive({
      patient_id: '',
      name: '',
      gender: '',
      phone: '',
      avatar_url: ''
    })

    const loadPatients = async () => {
      try {
        loading.value = true
        const response = await api.get('/patients')
        patients.value = response.patients || []
      } catch (error) {
        console.error('加载患者列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const viewPatient = (patient) => {
      router.push(`/patients/${patient.id}`)
    }

    const editPatient = (patient) => {
      // 填充表单数据
      patientForm.patient_id = patient.patient_id
      patientForm.name = patient.name
      patientForm.gender = patient.gender
      patientForm.phone = patient.phone
      patientForm.avatar_url = patient.avatar_url || ''
      
      // 设置编辑模式
      isEditing.value = true
      currentPatientId.value = patient.id
      showAddDialog.value = true
    }

    const savePatient = async () => {
      try {
        if (isEditing.value) {
          // 编辑模式
          await api.put(`/patients/${currentPatientId.value}`, patientForm)
          ElMessage.success('患者信息更新成功')
        } else {
          // 新增模式
          await api.post('/patients', patientForm)
          ElMessage.success('患者添加成功')
        }
        
        showAddDialog.value = false
        resetForm()
        loadPatients()
      } catch (error) {
        console.error('保存患者失败:', error)
      }
    }

    const resetForm = () => {
      patientForm.patient_id = ''
      patientForm.name = ''
      patientForm.gender = ''
      patientForm.phone = ''
      patientForm.avatar_url = ''
      isEditing.value = false
      currentPatientId.value = null
    }

    // 获取token
    const getToken = () => {
      return localStorage.getItem('token')
    }

    // 上传请求头
    const uploadHeaders = computed(() => {
      const token = getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    })

    // 头像上传成功
    const handleAvatarSuccess = (response) => {
      patientForm.avatar_url = response.avatarUrl
      ElMessage.success('头像上传成功')
    }

    // 头像上传失败
    const handleAvatarError = (error) => {
      console.error('头像上传失败:', error)
      let errorMessage = '头像上传失败'
      
      if (error && error.response) {
        // 如果有响应错误信息，显示具体错误
        errorMessage = error.response.data?.error || error.response.statusText || errorMessage
      } else if (error && error.message) {
        errorMessage = error.message
      }
      
      ElMessage.error(errorMessage)
    }

    // 上传前检查
    const beforeAvatarUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    }

    const deletePatient = async (patient) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除患者 ${patient.name} 吗？删除后将无法恢复！`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await api.delete(`/patients/${patient.id}`)
        ElMessage.success('患者删除成功')
        loadPatients()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除患者失败:', error)
        }
      }
    }

    const dialogTitle = computed(() => {
      return isEditing.value ? '编辑患者' : '添加患者'
    })

    onMounted(() => {
      loadPatients()
    })

    return {
      loading,
      showAddDialog,
      dialogTitle,
      patients,
      patientForm,
      viewPatient,
      editPatient,
      deletePatient,
      savePatient,
      resetForm,
      getToken,
      uploadHeaders,
      handleAvatarSuccess,
      handleAvatarError,
      beforeAvatarUpload
    }
  }
}
</script>

<style scoped>
.patient-list {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}
</style>