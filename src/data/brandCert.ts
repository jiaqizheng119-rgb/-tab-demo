/** 品牌认证说明页 — Figma node 26:1120，画幅 750→375 */
export const BRAND_CERT_ASSETS = {
  heroTitle: '/brand-cert/hero-title.png',
  cardTitle: '/brand-cert/card-title.png',
  statusBar: '/brand-cert/status-bar.svg',
} as const

export const BRAND_CERT_COPY = {
  navTitle: '加入微店品牌认证',
  heroTitleAlt: '原创保护认证说明',
  subtitle: '这里加一段简要说明',
  cardTitle: '申请原创保护之后将享受以下权益',
  benefits: [
    {
      id: 'search',
      title: '店铺搜索优先展示',
      description: '申请后店铺名称将在搜索结果页优先展示',
    },
    {
      id: 'badge',
      title: '店铺特殊标识',
      description: '申请后店铺出现特殊原创认证标识',
    },
  ],
  cta: '立即申请',
} as const
