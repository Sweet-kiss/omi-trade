// 定义后端菜单接口
export interface RawMenuItem {
  _id: string | number
  parentId: string | number
  title: string
  path?: string
  type?: string
  hidden?: boolean
  children?: RawMenuItem[]
}

// Ant Design Menu 要求的结构
export interface AntdMenuItem {
  key: string
  label: string
  path?: string
  children?: AntdMenuItem[]
}

// 过滤：只去掉 BUTTON 和 hidden
export function filterMenuItems(list: RawMenuItem[]): RawMenuItem[] {
  return list.filter((item) => {
    if (item.type === 'BUTTON') return false
    if (item.hidden) return false
    return true
  })
}

// 平铺数组转树形结构（支持 _id）
export function arrayToTree(
  flatList: RawMenuItem[],
  topParentId: string | number = 0,
): RawMenuItem[] {
  const map: Record<string | number, RawMenuItem> = {}

  // 先构建映射
  for (const item of flatList) {
    map[item._id] = { ...item, children: [] }
  }

  const tree: RawMenuItem[] = []

  for (const item of flatList) {
    const node = map[item._id]
    if (item.parentId == topParentId) {
      tree.push(node)
    } else {
      const parent = map[item.parentId]
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    }
  }

  return tree
}

// 转成 Antd Menu 可识别的结构
export function mapToAntdMenu(treeData: any[]) {
  return treeData.map((item) => {
    // 只先写 key 和 label
    const menuItem = {
      key: item.path || item.key,
      label: item.title,
    }

    // 只有真的有子菜单，并且长度大于0，才加 children
    if (item.children && item.children.length > 0) {
      // @ts-ignore 先忽略类型，让它先跑起来
      menuItem.children = mapToAntdMenu(item.children)
    }

    return menuItem
  })
}
