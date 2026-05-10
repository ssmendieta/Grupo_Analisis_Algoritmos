export class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export function insertNode(root, value) {
  if (root === null) return new TreeNode(value);
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}

export function inorder(node, result = []) {
  if (!node) return result;
  inorder(node.left, result);
  result.push(node.value);
  inorder(node.right, result);
  return result;
}

export function preorder(node, result = []) {
  if (!node) return result;
  result.push(node.value);
  preorder(node.left, result);
  preorder(node.right, result);
  return result;
}

export function postorder(node, result = []) {
  if (!node) return result;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.value);
  return result;
}
export function generateRandomTree(nodeCount, minVal, maxVal) {
  if (minVal > maxVal)
    throw new Error("El mínimo no puede ser mayor que el máximo.");
  const range = maxVal - minVal + 1;
  if (range < nodeCount)
    throw new Error(
      "El rango de valores es menor que la cantidad de nodos (no hay suficientes valores únicos).",
    );

  const pool = [];
  for (let v = minVal; v <= maxVal; v++) pool.push(v);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const values = pool.slice(0, nodeCount);

  let root = null;
  for (const v of values) root = insertNode(root, v);
  return root;
}

export function reconstructFromInPost(inArr, postArr) {
  if (inArr.length === 0) return null;

  const rootVal = postArr[postArr.length - 1];
  const node = new TreeNode(rootVal);

  const inIdx = inArr.indexOf(rootVal);
  if (inIdx === -1)
    throw new Error(`Valor ${rootVal} del postorder no encontrado en inorder.`);

  const leftIn = inArr.slice(0, inIdx);
  const rightIn = inArr.slice(inIdx + 1);
  const leftPost = postArr.slice(0, leftIn.length);
  const rightPost = postArr.slice(leftIn.length, postArr.length - 1);

  node.left = reconstructFromInPost(leftIn, leftPost);
  node.right = reconstructFromInPost(rightIn, rightPost);

  return node;
}

export function validateInPost(inArr, postArr) {
  if (inArr.length !== postArr.length) {
    return {
      valid: false,
      error: `Longitudes distintas: inorder tiene ${inArr.length} nodo(s) y postorder tiene ${postArr.length}.`,
    };
  }
  const sortedIn = [...inArr].sort((a, b) => a - b);
  const sortedPost = [...postArr].sort((a, b) => a - b);
  for (let i = 0; i < sortedIn.length; i++) {
    if (sortedIn[i] !== sortedPost[i]) {
      return {
        valid: false,
        error: `Los conjuntos de nodos no coinciden. Revisa que ambas secuencias tengan los mismos valores.`,
      };
    }
  }
  const setIn = new Set(inArr);
  if (setIn.size !== inArr.length) {
    return { valid: false, error: "El inorder tiene valores duplicados." };
  }
  return { valid: true, error: null };
}

export function serializeTree(root) {
  if (!root) return null;
  return {
    value: root.value,
    left: serializeTree(root.left),
    right: serializeTree(root.right),
  };
}

export function deserializeTree(obj) {
  if (!obj) return null;
  const node = new TreeNode(obj.value);
  node.left = deserializeTree(obj.left);
  node.right = deserializeTree(obj.right);
  return node;
}

export function computeLayout(root) {
  const positions = {};
  let counter = 0;

  function assignX(node) {
    if (!node) return;
    assignX(node.left);
    positions[node.value] = positions[node.value] ?? {};
    positions[node.value].x = counter++;
    assignX(node.right);
  }

  function assignY(node, depth = 0) {
    if (!node) return;
    if (!positions[node.value]) positions[node.value] = {};
    positions[node.value].y = depth;
    assignY(node.left, depth + 1);
    assignY(node.right, depth + 1);
  }

  assignX(root);
  assignY(root);
  return positions;
}
