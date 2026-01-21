// Supabase配置文件 - 生产环境中应使用环境变量存储这些值
export const supabaseUrl = 'https://your-supabase-url.supabase.co';
export const supabaseKey = 'your-supabase-publishable-key';

// 初始化Supabase客户端 - 使用模拟客户端，因为Supabase SDK无法在模块中直接使用CDN引入
// 在生产环境中，应该使用npm安装supabase-js并通过import语法导入
// 这里创建一个模拟客户端来避免运行时错误
export const supabase = {
  from: () => ({
    select: () => ({
      order: () => ({ data: [], error: null }),
      eq: () => ({ single: () => ({ data: null, error: new Error('Supabase not initialized') }) }),
      or: () => ({ data: [], error: null })
    }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not initialized') }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not initialized') }) }) }) }),
    delete: () => ({ eq: () => ({ error: new Error('Supabase not initialized') }) }),
    count: () => ({ data: 0, error: null })
  }),
  auth: {
    signInWithPassword: () => ({ data: null, error: new Error('Supabase not initialized') }),
    signUp: () => ({ data: null, error: new Error('Supabase not initialized') }),
    signOut: () => ({ error: new Error('Supabase not initialized') }),
    getUser: () => ({ data: { user: null } })
  }
};