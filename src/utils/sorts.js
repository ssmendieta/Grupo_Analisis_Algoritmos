const t = (step) => `[${(step * 0.060).toFixed(3)}]`;

export const getSortSteps = (type, array, isAscending) => {
  let arr = [...array];
  let steps = [];
  const startTime = performance.now();

  const compare = (a, b) => isAscending ? a < b : a > b;
  const orderText = isAscending ? "Ascendente" : "Descendente";

  steps.push({ arr: [...arr], msg: `${t(0)} 🚀 Iniciando ${type} Sort (${orderText})`, highlight: [] });

  // SELECTION
  if (type === 'Selection') {
    for (let i = 0; i < arr.length; i++) {
      let min = i;
      for (let j = i + 1; j < arr.length; j++) {
        steps.push({ arr: [...arr], msg: `${t(steps.length)} 🔍 Comparando: ${arr[j]} vs ${arr[min]}`, highlight: [j, min] });
        if (compare(arr[j], arr[min])) min = j;
      }
      if (min !== i) {
        [arr[i], arr[min]] = [arr[min], arr[i]];
        steps.push({ arr: [...arr], msg: `${t(steps.length)} 🔄 Intercambio: ${arr[i]} ↔ ${arr[min]}`, highlight: [i, min] });
      }
    }
  } 
  // INSERTION
  else if (type === 'Insertion') {
    for (let i = 1; i < arr.length; i++) {
      let key = arr[i]; let j = i - 1;
      steps.push({ arr: [...arr], msg: `${t(steps.length)} 📥 Tomando ${key}`, highlight: [i] });
      while (j >= 0 && compare(key, arr[j])) {
        arr[j+1] = arr[j];
        steps.push({ arr: [...arr], msg: `${t(steps.length)} ⬅️ Desplazando ${arr[j]}`, highlight: [j, j+1] });
        j--;
      }
      arr[j+1] = key;
    }
  }
  // SHELL
  else if (type === 'Shell') {
    let n = arr.length;
    for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
      for (let i = gap; i < n; i++) {
        let temp = arr[i]; let j;
        for (j = i; j >= gap && compare(temp, arr[j - gap]); j -= gap) {
          arr[j] = arr[j - gap];
          steps.push({ arr: [...arr], msg: `${t(steps.length)} ⚡ Gap ${gap}: Comparando`, highlight: [j, j-gap] });
        }
        arr[j] = temp;
      }
    }
  }
  // MERGE
  else if (type === 'Merge') {
    const merge = (l, m, r) => {
      let L = arr.slice(l, m + 1), R = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < L.length && j < R.length) {
        if (compare(L[i], R[j])) { arr[k] = L[i]; i++; }
        else { arr[k] = R[j]; j++; }
        steps.push({ arr: [...arr], msg: `${t(steps.length)} 🧩 Mezclando sub-arreglos`, highlight: [k] });
        k++;
      }
      while (i < L.length) { arr[k] = L[i]; i++; k++; }
      while (j < R.length) { arr[k] = R[j]; j++; k++; }
    };
    const sort = (l, r) => {
      if (l < r) {
        let m = Math.floor((l + r) / 2);
        sort(l, m); sort(m + 1, r); merge(l, m, r);
      }
    };
    sort(0, arr.length - 1);
  }

  const endTime = performance.now();
  // TIEMPO REALISTA: Diferencia real + peso de cada paso (para que no de 0)
  const totalTime = ((endTime - startTime) / 10 + (steps.length * 0.0085)).toFixed(3);

  steps.push({ 
    arr: [...arr], 
    msg: `${t(steps.length)} ✅ Finalizado en ${totalTime}s`, 
    highlight: [], 
    execTime: totalTime 
  });

  return { steps, totalTime, finalArray: arr };
};