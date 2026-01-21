# Supabase控制台操作指南

本指南将详细介绍如何在Supabase控制台中执行SQL脚本，创建广东北江中学图书馆系统所需的数据库表结构。

## 步骤1：登录Supabase控制台

1. 打开浏览器，访问Supabase官网：https://app.supabase.com
2. 使用您的Supabase账号登录
3. 在项目列表中找到并点击您的项目：`yzhnrtinfztdumfzuxvk`

## 步骤2：进入SQL编辑器

1. 登录成功后，您将看到项目控制台界面
2. 在左侧导航栏中，找到并点击「SQL编辑器」选项
3. 进入SQL编辑器页面，您将看到一个空白的SQL输入框

## 步骤3：执行SQL脚本

1. 在项目文件中找到 `supabase-schema.sql` 文件
2. 打开该文件，复制其中的所有内容
3. 将复制的内容粘贴到Supabase SQL编辑器的输入框中
4. 检查脚本内容，确保没有遗漏或错误
5. 点击页面底部的「运行」按钮执行脚本

## 步骤4：验证表结构

1. 脚本执行完成后，点击左侧导航栏中的「数据库」选项
2. 展开「表」子菜单，您应该能看到以下表已创建：
   - `books` - 图书表
   - `readers` - 读者表
   - `borrow_records` - 借阅记录表
   - `announcements` - 公告表
3. 点击每个表名，查看表结构和示例数据，确保一切正常

## 步骤5：测试连接

1. 在项目根目录中找到 `test-supabase-connection.html` 文件
2. 双击打开该文件，或使用浏览器打开它
3. 点击「开始测试连接」按钮
4. 查看测试结果，确认所有表都能正常访问

## 常见问题及解决方案

### 问题1：SQL脚本执行失败

**解决方案：**
- 检查SQL脚本是否完整复制
- 确保您有足够的权限执行DDL语句
- 检查是否有表已存在（脚本中已使用 `IF NOT EXISTS` 语句避免重复创建）
- 查看错误信息，针对性解决问题

### 问题2：表创建成功但测试失败

**解决方案：**
- 检查项目URL和API密钥是否正确
- 确保您的网络连接正常
- 等待一段时间，让Supabase缓存更新（通常需要几秒钟）
- 检查表的权限设置，确保匿名用户有访问权限

### 问题3：初始化数据失败

**解决方案：**
- 确认所有表都已正确创建
- 检查Supabase配置是否正确
- 查看浏览器控制台的错误信息，针对性解决问题
- 确保Supabase项目处于活跃状态

## 权限设置

为了确保系统能正常访问数据库，您需要为每个表创建访问策略，允许匿名用户访问。请按照以下步骤操作：

1. 点击左侧导航栏中的「数据库」选项
2. 点击「表」子菜单
3. 选择一个表（例如 `books`）
4. 点击「权限」选项卡
5. 点击「新策略」按钮
6. 在弹出的对话框中，填写以下信息：
   - **名称**：`allow_anonymous_all`
   - **针对角色**：`public`（即匿名用户）
   - **USING 表达式**：`true`（允许所有行）
   - **WITH CHECK 表达式**：`true`（允许所有修改）
   - **允许操作**：勾选 `SELECT`、`INSERT`、`UPDATE`、`DELETE`
7. 点击「保存」按钮
8. 对以下每个表重复上述步骤：
   - `books` 表：允许 `SELECT`、`INSERT`、`UPDATE`、`DELETE`
   - `readers` 表：允许 `SELECT`、`INSERT`、`UPDATE`
   - `borrow_records` 表：允许 `SELECT`、`INSERT`、`UPDATE`
   - `announcements` 表：允许 `SELECT`、`INSERT`

### 快速设置权限（可选）

您也可以在SQL编辑器中执行以下SQL语句，一次性创建所有表的访问策略：

```sql
-- 为books表创建策略
CREATE POLICY "allow_anonymous_all_books" ON "public"."books" 
    FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);

-- 为readers表创建策略
CREATE POLICY "allow_anonymous_all_readers" ON "public"."readers" 
    FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);

-- 为borrow_records表创建策略
CREATE POLICY "allow_anonymous_all_borrow_records" ON "public"."borrow_records" 
    FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);

-- 为announcements表创建策略
CREATE POLICY "allow_anonymous_all_announcements" ON "public"."announcements" 
    FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);
```

执行上述SQL语句后，所有表将允许匿名用户访问和修改。

## 后续步骤

1. 确认所有表都已成功创建
2. 运行 `test-supabase-connection.html` 测试连接
3. 启动网站，测试图书馆系统功能
4. 如果一切正常，您的图书馆系统现在应该能够连接到真实的Supabase数据库

## 联系支持

如果您在设置过程中遇到任何问题，可以通过以下方式获取支持：

- Supabase官方文档：https://supabase.com/docs
- Supabase社区：https://github.com/supabase/supabase/discussions
- 项目技术支持：高一5班何逸

祝您使用愉快！