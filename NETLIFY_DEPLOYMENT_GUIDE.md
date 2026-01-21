# Netlify部署详细指南

本指南将帮助您使用已注册的Netlify账号部署广东北江中学官网。

## 部署前准备

### 1. 确保代码已上传到GitHub

Netlify通过GitHub集成进行部署，所以您需要先将代码推送到GitHub仓库。

如果您还没有将代码推送到GitHub，请参考以下步骤：

```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit"

# 关联GitHub仓库
git remote add origin https://github.com/your-username/bdzx-official-website.git

# 推送到GitHub
git push -u origin main
```

## 部署步骤

### 1. 登录Netlify

访问 [Netlify官网](https://www.netlify.com/)，使用您已注册的账号登录。

### 2. 创建新站点

1. 登录后，点击页面顶部的 "Add new site" 按钮
2. 选择 "Import an existing project"

### 3. 连接GitHub仓库

1. 在 "Import from Git provider" 部分，选择 "GitHub"
2. 如果是第一次使用，需要授权Netlify访问您的GitHub账号
3. 搜索并选择您的网站仓库（例如：`bdzx-official-website`）

### 4. 配置部署设置

在 "Configure your site" 页面，进行以下设置：

| 设置项 | 值 | 说明 |
|--------|-----|------|
| **Repository** | 您的GitHub仓库 | 自动填充，无需修改 |
| **Branch to deploy** | main 或 master | 选择您的主分支 |
| **Build command** | 空 | 我们的网站不需要构建步骤 |
| **Publish directory** | 空 | 使用项目根目录 |

### 5. 部署网站

1. 点击 "Deploy site" 按钮开始部署
2. Netlify会自动克隆您的GitHub仓库并部署网站
3. 等待部署完成（通常需要1-2分钟）

### 6. 获取部署URL

部署完成后，您会看到一个随机生成的URL（例如：`https://sleepy-einstein-12345.netlify.app`），这就是您网站的公共访问地址。

## 部署后设置

### 1. 自定义网站名称（可选）

1. 点击 "Site settings"
2. 在 "Site information" 部分，点击 "Change site name"
3. 输入一个更易记的名称（例如：`bdzx-official-website`）
4. 点击 "Save"
5. 您的网站URL将变为 `https://bdzx-official-website.netlify.app`

### 2. 绑定自定义域名（可选）

如果您有自己的域名，可以将其绑定到Netlify站点：

1. 在 "Site settings" 中，选择 "Domain management"
2. 点击 "Add custom domain"
3. 输入您的域名（例如：`www.bdzx.edu.cn`）
4. 点击 "Save"
5. 根据提示在您的域名注册商处添加DNS记录

## 验证部署

1. 访问部署后的URL
2. 测试所有功能：
   - 导航功能：验证首页、荣誉公示、各项系统页面均可正常切换
   - 荣誉公示：测试标签页切换
   - 图书馆系统：
     - 学生入口功能
     - 管理员登录（默认：admin/admin123）
     - 图书管理操作
     - 借阅归还功能
3. 检查浏览器控制台是否有错误

## 自动部署

Netlify会自动监控您的GitHub仓库，当您推送新的代码时，Netlify会自动重新部署网站。这意味着您只需要专注于代码开发，无需手动部署。

## 常见问题及解决方案

### 1. 部署失败

- **检查GitHub仓库权限**：确保Netlify有权限访问您的仓库
- **检查分支名称**：确保您选择了正确的分支（main或master）
- **查看部署日志**：点击部署记录中的 "Logs" 查看详细错误信息

### 2. 网站无法访问

- **检查部署状态**：确保部署已成功完成
- **检查URL拼写**：确保您访问的URL正确
- **清除浏览器缓存**：有时浏览器会缓存旧版本的网站

### 3. 图片或资源无法加载

- **检查资源路径**：确保所有资源使用相对路径（例如：`images/logo.jpg` 而不是 `/images/logo.jpg`）
- **检查资源文件名**：确保文件名大小写正确（Netlify服务器区分大小写）

### 4. JavaScript错误

- **检查浏览器控制台**：查看具体错误信息
- **确保模块标签正确**：所有使用ES模块的文件都应该使用 `<script type="module">` 标签
- **检查导入路径**：确保所有导入语句使用正确的相对路径

## 管理员功能验证

部署完成后，请务必验证管理员功能是否正常：

1. 访问部署后的URL
2. 进入「各项系统」→「图书馆系统」
3. 点击「管理员入口」
4. 使用默认账号密码登录：
   - 用户名：admin
   - 密码：admin123
5. 测试图书管理、读者管理等功能
6. 确保所有操作都能正常保存到数据库

## 后续维护

1. 当您更新代码并推送到GitHub时，Netlify会自动重新部署
2. 定期检查网站运行状态
3. 根据需要更新Supabase数据库中的数据

## 联系方式

如果您在部署过程中遇到问题，可以联系技术支持：

- 技术支持：高一5班何逸
- 邮箱：info@bdzx.edu.cn

---

祝您部署成功！