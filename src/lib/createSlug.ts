// 改编自 https://equk.co.uk/2023/02/02/generating-slug-from-title-in-astro/

import { GENERATE_SLUG_FROM_TITLE } from '../config'

export default function (title: string, staticSlug: string) {
  const slug = title
    // 去除首尾空白
    .trim()
    // 转为小写
    .toLowerCase()
    // 替换空格
    .replace(/\s+/g, '-')
    // 移除特殊字符
    .replace(/[^\w-]/g, '')
    // 移除首尾分隔符
    .replace(/^-+|-+$/g, '');
  // 如果标题全是中文等非 ASCII 字符导致 slug 为空，回退到文件名的 slug
  return (!GENERATE_SLUG_FROM_TITLE || !slug) ? staticSlug : slug;
}
