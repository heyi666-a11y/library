# 广东北江中学官网部署指南

本指南将帮助您将网站部署到公共服务器，使所有人都能访问。

## 部署准备工作

### 1. 代码准备

确保您的项目代码完整，包括所有必要的文件：
- `index.html` - 主页面
- `css/` - 样式文件目录
- `js/` - JavaScript文件目录
- `images/` - 图片资源目录
- `lib/` - 第三方库目录（如果有）

### 2. 创建GitHub仓库

1. 访问 [GitHub](https://github.com/) 并登录
2. 点击右上角的 `+` 图标，选择 "New repository"
3. 填写仓库名称（例如：`bdzx-official-website`）
4. 选择 "Public"（公开）或 "Private"（私有）
5. 点击 "Create repository"
6. 将本地代码推送到GitHub仓库：

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

## 部署选项

### 选项1：使用Vercel部署（推荐）

Vercel是一个免费的静态网站托管服务，适合部署前端项目。

#### 部署步骤：

1. 访问 [Vercel](https://vercel.com/) 并使用GitHub账号登录
2. 点击 "Add New Project"
3. 选择您刚刚创建的GitHub仓库
4. 配置部署设置：
   - Framework Preset: 选择 "Other"
   - Root Directory: 保持为空（使用项目根目录）
   - Build Command: 保持为空（无需构建）
   - Output Directory: 保持为空（使用项目根目录）
5. 点击 "Deploy"
6. 等待部署完成，您将获得一个公共URL（例如：`https://bdzx-official-website.vercel.app`）

### 选项2：使用Netlify部署

Netlify也是一个流行的静态网站托管服务。

#### 部署步骤：

1. 访问 [Netlify](https://www.netlify.com/) 并使用GitHub账号登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 "GitHub" 并授权
4. 选择您的GitHub仓库
5. 配置部署设置：
   - Build command: 保持为空
   - Publish directory: 保持为空（使用项目根目录）
6. 点击 "Deploy site"
7. 等待部署完成，您将获得一个公共URL

### 选项3：使用GitHub Pages部署

GitHub Pages允许您直接从GitHub仓库部署静态网站。

#### 部署步骤：

1. 在GitHub仓库中，点击 "Settings" → "Pages"
2. 在 "Build and deployment" 部分：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main" 或 "master"
   - Folder: 选择 "/ (root)"
3. 点击 "Save"
4. 等待部署完成，您将获得一个公共URL（例如：`https://your-username.github.io/bdzx-official-website`）

## 部署后的验证

1. 访问部署后获得的公共URL
2. 测试所有功能：
   - 导航功能：验证首页、荣誉公示、各项系统页面均可正常切换
   - 荣誉公示：测试标签页切换
   - 图书馆系统：测试学生入口和管理员入口
3. 检查控制台是否有错误

## 自定义域名（可选）

如果您有自己的域名，可以将其绑定到部署的网站：

1. 访问您的域名注册商，添加CNAME记录指向部署服务提供的URL
2. 在部署服务（Vercel/Netlify）的设置中添加自定义域名

## 常见问题

### 1. 图片或资源无法加载

- 检查资源路径是否正确（使用相对路径）
- 确保资源文件名大小写正确（某些服务器区分大小写）

### 2. JavaScript模块错误

- 确保所有使用ES模块语法的文件都使用 `<script type="module">` 标签加载
- 检查导入路径是否正确

### 3. Supabase连接问题

- 确保 `supabase-config.js` 中的配置正确
- 检查Supabase项目的访问权限设置

## 后续维护

1. 当您更新本地代码后，只需推送到GitHub仓库
2. 部署服务会自动重新部署网站
3. 定期检查网站运行状态

## 联系方式

如果您在部署过程中遇到问题，可以联系技术支持：

- 技术支持：高一5班何逸
- 邮箱：info@bdzx.edu.cn

---

祝您部署成功！