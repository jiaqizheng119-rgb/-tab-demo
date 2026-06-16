export const BRAND_CERT_APPLY_COPY = {
  navTitle: '提交原创保护申请',
  intro: '请填写店铺与原创信息，提交后将在 3 个工作日内完成审核',
  steps: ['填写信息', '平台审核', '认证生效'],
  sections: {
    shop: '店铺信息',
    contact: '联系人',
    original: '原创说明',
    materials: '证明材料',
  },
  fields: {
    shopName: { label: '店铺名称', placeholder: '请输入微店店铺名称' },
    category: { label: '主营类目', placeholder: '请选择主营类目' },
    contactName: { label: '联系人', placeholder: '请输入联系人姓名' },
    contactPhone: { label: '联系电话', placeholder: '请输入手机号' },
    description: {
      label: '原创说明',
      placeholder:
        '请简要说明店铺原创商品类型、创作方式及与其他店铺的差异（300 字以内）',
    },
  },
  categories: [
    '服饰鞋包',
    '美妆个护',
    '家居生活',
    '食品饮料',
    '数码家电',
    '文创手作',
    '其他',
  ],
  upload: {
    action: '批量上传证明材料',
    hint: '支持 JPG / PNG / PDF，最多 6 张，单张不超过 10MB',
    statusLabel: '已上传材料',
    maxCount: 6,
    maxSizeMb: 10,
  },
  agreement: '我已阅读并同意《微店原创保护认证服务协议》，保证所填信息真实有效',
  tips: [
    '审核期间请保持店铺正常经营，联系方式畅通',
    '通过后将在搜索与店铺页展示原创认证标识',
    '如有疑问可联系客服：400-xxx-xxxx',
  ],
  submit: '提交申请',
  submitSuccess: '提交成功',
  submitSuccessDesc: '预计3个工作日内完成审核',
  successIllust: '/brand-cert/apply-success-cart.png',
  fieldHints: {
    shopName: '请填写店铺名称',
    category: '请选择主营类目',
    contactName: '请填写联系人',
    contactPhone: '请填写联系电话',
    contactPhoneInvalid: '请输入正确的手机号',
    description: '请填写原创说明',
  },
} as const

export type ApplyFieldKey = Exclude<
  keyof typeof BRAND_CERT_APPLY_COPY.fieldHints,
  'contactPhoneInvalid'
>
