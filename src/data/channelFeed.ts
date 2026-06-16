/** 频道全页 Feed 数据（Figma 199:66825） */

import type { ChannelTheme } from './channelTabs'

export type FeedCard = {
  id: string
  image: string
  title: string
  author: string
  views: string
  followed?: boolean
  size: 's' | 'm' | 'l'
}

type ChannelFeedEntry = {
  backgroundDark: string
  backgroundRed: string
  cards: FeedCard[]
}

const AVATAR = '/channel/full/avatar.png'
const IMG_PLUSH = '/channel/full/feed-1.jpg'
const IMG_ANIME = '/channel/full/feed-3.jpg'
const IMG_PORTRAIT = '/channel/full/feed-5.jpg'

const CHANNEL_FEED: Record<string, ChannelFeedEntry> = {
  all: {
    backgroundDark: 'linear-gradient(114.6deg, #e9eaff 16.5%, #ffeaf9 44.3%)',
    backgroundRed: 'linear-gradient(114.6deg, #ffe8ee 16.5%, #fff5f8 44.3%)',
    cards: [
      { id: 'a1', image: IMG_PLUSH, title: '穿上新衣服的呜呜宁新，这一年也要开心哦', author: '天天爱追剧', views: '9999', size: 'm' },
      { id: 'a2', image: IMG_PORTRAIT, title: '穿上新衣服的呜呜宁新，这一年也要开心哦', author: '天天爱追剧', views: '1.2万', followed: true, size: 'l' },
      { id: 'a3', image: IMG_ANIME, title: '穿上新衣服的呜呜宁新', author: '天天爱追剧', views: '20', size: 's' },
      { id: 'a4', image: IMG_PLUSH, title: '今日份治愈瞬间，毛茸茸的温柔', author: '治愈系日记', views: '320', size: 'm' },
    ],
  },
  thai: {
    backgroundDark: 'linear-gradient(135deg, #fff0e8 0%, #ffe4f0 55%, #f8f0ff 100%)',
    backgroundRed: 'linear-gradient(135deg, #fff0eb 0%, #ffe8f0 55%, #fff5f8 100%)',
    cards: [
      { id: 't1', image: IMG_PORTRAIT, title: '曼谷见面会花絮，现场氛围太绝了', author: '泰娱前线', views: '2.3万', followed: true, size: 'l' },
      { id: 't2', image: IMG_ANIME, title: '新剧开播！首集观后感来啦', author: '追剧少女Mia', views: '8600', size: 'm' },
      { id: 't3', image: IMG_PLUSH, title: '同款周边开箱，颜值在线', author: '泰娱种草机', views: '421', size: 's' },
    ],
  },
  fandom: {
    backgroundDark: 'linear-gradient(145deg, #ffe8f4 0%, #f5e8ff 48%, #fff5fb 100%)',
    backgroundRed: 'linear-gradient(145deg, #ffe0ec 0%, #ffe8f2 48%, #fff0f5 100%)',
    cards: [
      { id: 'f1', image: IMG_ANIME, title: '应援色穿搭灵感，线下见面会必备', author: '饭圈美工社', views: '5.6万', followed: true, size: 'l' },
      { id: 'f2', image: IMG_PLUSH, title: '手幅设计教程，新手也能上手', author: '星星应援站', views: '3100', size: 'm' },
      { id: 'f3', image: IMG_PORTRAIT, title: '今日打榜进度汇总', author: '数据组小助手', views: '1.8万', size: 'm' },
    ],
  },
  rua: {
    backgroundDark: 'linear-gradient(160deg, #fff0f5 0%, #ffeaf9 40%, #f3eeff 100%)',
    backgroundRed: 'linear-gradient(160deg, #fff0f3 0%, #ffe8f2 40%, #fff5f8 100%)',
    cards: [
      { id: 'r1', image: IMG_PLUSH, title: '新入的棉花娃娃，腮红也太可爱了', author: 'Rua娃吧官方', views: '3.2万', followed: true, size: 'l' },
      { id: 'r2', image: IMG_PLUSH, title: '给娃换新衣，春季限定款分享', author: '娃衣手作娘', views: '9800', size: 'm' },
      { id: 'r3', image: IMG_ANIME, title: '改妆前后对比，细节拉满', author: '妆师小橘', views: '670', size: 's' },
    ],
  },
  acgn: {
    backgroundDark: 'linear-gradient(120deg, #e8f0ff 0%, #f0e8ff 50%, #ffe8f8 100%)',
    backgroundRed: 'linear-gradient(120deg, #ffe8f0 0%, #ffe8f5 50%, #fff0f8 100%)',
    cards: [
      { id: 'c1', image: IMG_ANIME, title: '本季新番安利，这部真的上头', author: '二次元观察室', views: '4.1万', size: 'l' },
      { id: 'c2', image: IMG_ANIME, title: '漫展返图合集，场照太绝了', author: 'COS摄影菌', views: '2.2万', followed: true, size: 'm' },
      { id: 'c3', image: IMG_PORTRAIT, title: '同人本开箱，画风爱了', author: '本子收藏家', views: '1500', size: 's' },
    ],
  },
  bjd: {
    backgroundDark: 'linear-gradient(180deg, #f2f3f8 0%, #ebeaf5 55%, #f8f5ff 100%)',
    backgroundRed: 'linear-gradient(180deg, #f8f2f5 0%, #f5eef0 55%, #fff5f8 100%)',
    cards: [
      { id: 'b1', image: IMG_PORTRAIT, title: '私养娃外景写真，光影氛围感', author: 'BJD摄影志', views: '8900', size: 'l' },
      { id: 'b2', image: IMG_PLUSH, title: '妆面记录，温柔系眼妆教程', author: '妆师阿离', views: '2300', size: 'm' },
      { id: 'b3', image: IMG_ANIME, title: '新衣入荷，古典风小裙子', author: '娃衣工坊', views: '512', size: 's' },
    ],
  },
  lysk: {
    backgroundDark: 'linear-gradient(135deg, #e6eeff 0%, #f0e6ff 45%, #ffe6f4 100%)',
    backgroundRed: 'linear-gradient(135deg, #ffe6ee 0%, #ffe8f5 45%, #fff0f8 100%)',
    cards: [
      { id: 'l1', image: IMG_ANIME, title: '新卡池分析，这次值得冲吗？', author: '深空攻略组', views: '6.8万', followed: true, size: 'l' },
      { id: 'l2', image: IMG_PORTRAIT, title: '同人图分享，氛围感拉满', author: '深空画手', views: '1.5万', size: 'm' },
      { id: 'l3', image: IMG_PLUSH, title: '周边到货晒单，质感超预期', author: '谷子收纳箱', views: '3200', size: 'm' },
    ],
  },
  hanman: {
    backgroundDark: 'linear-gradient(125deg, #e8f4ff 0%, #dde8ff 45%, #f0e8ff 100%)',
    backgroundRed: 'linear-gradient(125deg, #ffe8f0 0%, #ffeef5 45%, #fff5f8 100%)',
    cards: [
      { id: 'h1', image: IMG_ANIME, title: '本周韩漫安利，这部画风绝了', author: '韩漫情报站', views: '4.5万', followed: true, size: 'l' },
      { id: 'h2', image: IMG_PORTRAIT, title: '新番联动周边开箱', author: '漫圈种草姬', views: '1.1万', size: 'm' },
      { id: 'h3', image: IMG_PLUSH, title: '同人本推荐清单', author: '本子猎人', views: '890', size: 's' },
    ],
  },
  zhaolusi: {
    backgroundDark: 'linear-gradient(140deg, #fff0f0 0%, #ffe8f4 50%, #fff5fb 100%)',
    backgroundRed: 'linear-gradient(140deg, #ffe8ee 0%, #ffe0ec 50%, #fff0f5 100%)',
    cards: [
      { id: 'z1', image: IMG_PORTRAIT, title: '最新路透造型，氛围感满分', author: '露思前线', views: '8.2万', followed: true, size: 'l' },
      { id: 'z2', image: IMG_PLUSH, title: '同款穿搭灵感合集', author: '追星衣橱', views: '2.6万', size: 'm' },
      { id: 'z3', image: IMG_ANIME, title: '今日应援色搭配指南', author: '饭圈美工社', views: '3400', size: 'm' },
    ],
  },
  bear: {
    backgroundDark: 'linear-gradient(160deg, #fff8f0 0%, #fff0e8 45%, #fff5f0 100%)',
    backgroundRed: 'linear-gradient(160deg, #fff5eb 0%, #ffe8e0 45%, #fff8f5 100%)',
    cards: [
      { id: 'b4', image: IMG_PLUSH, title: '自嘲熊周边到货，毛绒手感太治愈', author: '熊系收藏家', views: '3.8万', size: 'l' },
      { id: 'b5', image: IMG_ANIME, title: '桌面摆件布置灵感', author: '治愈系角落', views: '5600', size: 'm' },
      { id: 'b6', image: IMG_PORTRAIT, title: '联名款开箱实拍', author: '萌物研究所', views: '1200', size: 's' },
    ],
  },
  idol: {
    backgroundDark: 'linear-gradient(130deg, #f0e8ff 0%, #e8f0ff 40%, #ffe8f8 100%)',
    backgroundRed: 'linear-gradient(130deg, #ffe8f5 0%, #ffeef8 40%, #fff5fa 100%)',
    cards: [
      { id: 'i1', image: IMG_ANIME, title: '爱豆星球本周热帖汇总', author: '星球播报', views: '5.1万', followed: true, size: 'l' },
      { id: 'i2', image: IMG_PORTRAIT, title: '打榜攻略，新手也能上手', author: '数据组小助手', views: '9800', size: 'm' },
      { id: 'i3', image: IMG_PLUSH, title: '应援物 DIY 教程', author: '手作应援站', views: '2100', size: 'm' },
    ],
  },
}

const THEME_BACKGROUNDS: Record<ChannelTheme, 'backgroundDark' | 'backgroundRed'> = {
  dark: 'backgroundDark',
  red: 'backgroundRed',
  pill: 'backgroundDark',
  soft: 'backgroundRed',
  'icon-pill': 'backgroundDark',
}

export function getChannelFeed(theme: ChannelTheme, channelId: string) {
  const entry = CHANNEL_FEED[channelId] ?? CHANNEL_FEED.all
  const bgKey = THEME_BACKGROUNDS[theme]
  return {
    background: entry[bgKey],
    cards: entry.cards,
  }
}

export const FEED_AVATAR = AVATAR
