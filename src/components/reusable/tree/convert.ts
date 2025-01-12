export type TreeNode<T> = {
  key: string
  data: T
  parent?: TreeNode<T>
  children: TreeNode<T>[]
}

export function convert<T>(
  list: T[],
  keyAccessor: (item: T) => string,
  parentKeyAccesscor: (item: T) => string,
): { [name: string]: TreeNode<T> } {
  const startTime = performance.now()

  const nodeMap: { [name: string]: TreeNode<T> } = {}

  // list.sort((a1, a2) => a1.level - a2.level)

  for (const item of list) {
    // cache into map
    const key = keyAccessor(item)
    let node = nodeMap[key]
    if (!node) {
      node = { key: key, data: item, children: [] }
      nodeMap[key] = node
    }

    const parentKey = parentKeyAccesscor(item)
    if (!parentKey) {
      continue
    }

    // add to parent as child
    let parentNode = nodeMap[parentKey]
    if (!parentNode) {
      const extraStart = performance.now()

      const parentItem = list.find((i) => keyAccessor(i) === parentKey)
      if (!parentItem) {
        alert(`parent item is not found for item ${key}, its parent key is ${parentKey}`)
        return {}
      }
      parentNode = { key: parentKey, data: parentItem, children: [] }
      nodeMap[parentKey] = parentNode
      console.warn(`finding parent took extra time ${performance.now() - extraStart} ms`)
    }
    parentNode.children.push(node)
    node.parent = parentNode
  }

  console.info(`converting tree took ${performance.now() - startTime} ms`)

  return nodeMap
}
