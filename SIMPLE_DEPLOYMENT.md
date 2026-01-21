# 简易部署指南

由于系统中没有安装Git命令行工具，您可以按照以下步骤手动完成部署：

## 步骤1：安装Git命令行工具

1. 访问 [Git官网](https://git-scm.com/) 下载Git
2. 安装Git（默认选项即可）
3. 安装完成后，打开命令提示符或PowerShell，输入 `git --version` 验证安装成功

## 步骤2：初始化Git仓库

1. 打开命令提示符或PowerShell
2. 切换到项目目录：
   ```bash
   cd d:\编程\正式学校系统
   ```
3. 初始化Git仓库：
   ```bash
   git init
   ```
4. 配置Git用户名和邮箱：
   ```bash
   git config user.name "您的GitHub用户名"
   git config user.email "您的GitHub邮箱"
   ```

## 步骤3：推送代码到GitHub

1. 添加所有文件：
   ```bash
   git add .
   ```
2. 提交代码：
   ```bash
   git commit -m "Initial commit"
   ```
3. 关联GitHub仓库（使用您提供的访问代币）：
   ```bash
   git remote add origin https://your-github-token@github.com/your-username/bdzx-official-website.git
   ```
   请将 `your-username` 替换为您的GitHub用户名
4. 推送代码：
   ```bash
   git push -u origin main
   ```

## 步骤4：在Netlify上部署

1. 访问 [Netlify官网](https://www.netlify.com/) 并登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 "GitHub"
4. 搜索并选择 `bdzx-official-website` 仓库
5. 配置部署设置：
   - Branch to deploy: main
   - Build command: 空
   - Publish directory: 空
6. 点击 "Deploy site"

## 步骤5：获取部署URL

部署完成后，您将获得一个公共URL，访问该URL即可查看您的网站。

## 后续步骤

1. 登录管理员后台（默认账号：admin/admin123）
2. 测试所有功能
3. 根据需要更新网站内容

## 注意事项

1. 请妥善保管您的GitHub访问代币，不要泄露给他人
2. 部署完成后，建议修改管理员默认密码
3. 定期备份Supabase数据库

如果您在部署过程中遇到任何问题，可以随时联系技术支持。