@echo off
echo ========================================
echo 慢性病管理系统 - 快速启动
echo ========================================

echo 检查并初始化演示数据...
cd backend
if not exist "db\chronic_disease.db" (
    echo 首次运行，正在安装依赖和初始化数据...
    call npm install
    call npm run init-db
    call npm run init-demo
) else (
    echo 数据库已存在，跳过初始化
)

echo.
echo 启动后端服务...
start "慢性病管理系统-后端" cmd /k "npm start"

echo 等待后端启动...
timeout /t 3 /nobreak > nul

echo 启动前端服务...
cd ../frontend
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
)
start "慢性病管理系统-前端" cmd /k "npm run dev"

echo.
echo ========================================
echo 慢性病管理系统启动完成！
echo ========================================
echo 🌐 前端界面: http://localhost:5173
echo 🔧 后端API: http://localhost:3002
echo.
echo 📋 登录信息:
echo    用户名: admin
echo    密码: admin123
echo.
echo 📊 演示数据包含:
echo    • 6名患者的完整信息
echo    • 8条慢性病病历记录
echo    • 200+条健康指标数据
echo    • 10条用药记录
echo    • 完整的统计报表
echo ========================================
echo 按任意键关闭此窗口...
pause > nul