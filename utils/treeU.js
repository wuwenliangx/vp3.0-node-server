/**
 * 通过节点ID递归查找目标路径
 * @param {String} leafId 搜索的目标节点ID
 * @param {Array} nodes 节点数组
 * @param {String} path 存放路径
 */
function findPathByLeafId(leafId, nodes, path) {
  if (path === undefined) {
    path = [];
  }
  for (var i = 0; i < nodes.length; i++) {
    var tmpPath = path.concat();
    tmpPath.push(nodes[i]);
    if (leafId == nodes[i].id) {
      return {
        node: nodes[i],
        path: [].concat(tmpPath),
      };
    }
    if (nodes[i].children) {
      var findResult = findPathByLeafId(leafId, nodes[i].children, tmpPath);
      if (findResult) {
        return findResult;
      }
    }
  }
}
/**
 * 通过节点ID删除节点以及子节点
 * @param {String} leafId 目标节点ID
 * @param {String} nodes 节点数组
 * @param {Array} path 路径
 */
function deleteByLeafId(leafId, nodes, path) {
  if (path === undefined) {
    path = [];
  }
  for (var i = 0; i < nodes.length; i++) {
    var tmpPath = path.concat();
    tmpPath.push(nodes[i]);
    if (leafId == nodes[i].id) {
      var t = {
        node: nodes[i],
        path: [].concat(tmpPath),
      };
      nodes.splice(i, 1);
      return t;
    }
    if (nodes[i].children) {
      var findResult = deleteByLeafId(leafId, nodes[i].children, tmpPath);
      if (findResult) {
        return findResult;
      }
    }
  }
}
/**
 * 获取所有节点ID
 * @param {Array} tree 节点数组
 * @param {Array} nodes 节点ID数组
 */
function getAllNodeIds(tree, nodes) {
  for (let t of tree) {
    treeNodeIds.push(t.id);
    if (Array.isArray(t.children) && t.children.length > 0) {
      getAllTreeNodeIds(t.children, nodes);
    }
  }
}
/**
 * 根据节点ID数组获取所有匹配的节点
 * @param {Array} ids 目标节点ID数组
 * @param {Array} tree 节点数组
 * @param {Array} nodes 节点数组
 */
function getNodesByIds(ids, tree, nodes) {
  for (let t of tree) {
    if (ids.indexOf(t.id) > -1) {
      nodes.push(t);
    }
    if (Array.isArray(t.children) && t.children.length > 0) {
      getNodesByIds(ids, t.children, nodes);
    }
  }
}

module.exports = {
  findPathByLeafId,
  deleteByLeafId,
  getAllNodeIds,
  getNodesByIds
}