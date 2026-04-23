// API 服务 - 与后端数据库交互

const API_BASE_URL = '/api';

// 通用请求函数
const request = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
};

// 申请相关 API
export const applicationAPI = {
  // 提交申请
  submit: async (applicationData: any) => {
    return request('/applications/submit', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // 获取学生自己的申请
  getMyApplication: async (idCard: string) => {
    return request(`/applications/my-application/${idCard}`);
  },

  // 获取所有申请（管理员，列表轻量数据，不含附件 base64）
  getAll: async () => {
    return request('/applications/all');
  },

  // 获取单条申请完整数据（含附件 base64，详情按需加载）
  getById: async (id: number | string) => {
    return request(`/applications/${id}`);
  },

  // 更新申请状态（管理员审核）
  updateStatus: async (id: number, status: string, notes?: string) => {
    return request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  // 归档申请（管理员）—— 软删除，可恢复
  delete: async (id: number) => {
    return request(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // 获取已归档申请（管理员）
  getArchived: async () => {
    return request('/applications/all/archived');
  },

  // 从归档恢复（管理员）
  restore: async (id: number) => {
    return request(`/applications/${id}/restore`, { method: 'POST' });
  },

  // 永久删除（管理员，二次确认后调用，不可恢复）
  forceDelete: async (id: number) => {
    return request(`/applications/${id}/force`, { method: 'DELETE' });
  },

  // 修改奖学金类型（管理员）—— 主要场景：subject → innovation
  changeScholarshipType: async (id: number, scholarship_type: 'subject' | 'innovation') => {
    return request(`/applications/${id}/scholarship-type`, {
      method: 'PATCH',
      body: JSON.stringify({ scholarship_type }),
    });
  },

  // 提交修改请求（学生）
  requestModify: async (idCard: string, reason: string, attachments: any[]) => {
    return request('/applications/request-modify', {
      method: 'POST',
      body: JSON.stringify({ idCard, reason, attachments }),
    });
  },

  // 获取修改请求状态（学生）
  getModifyStatus: async (idCard: string) => {
    return request(`/applications/modify-status/${idCard}`);
  },

  // 审核修改请求（管理员）
  approveModify: async (id: number, approved: boolean) => {
    return request(`/applications/approve-modify/${id}`, {
      method: 'POST',
      body: JSON.stringify({ approved }),
    });
  },

  // 获取所有待审核的修改请求（管理员）
  getPendingModifications: async () => {
    return request('/applications/pending-modifications');
  },
};

// 健康检查
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
