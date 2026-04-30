const t = (step) => `[${(step * 0.060).toFixed(3)}]`;

export const getSortSteps = (type, array, isAscending) => {
  let arr = [...array];
  let steps = [];
  let comparisons = 0;
  let movements = 0;

  const startTime = performance.now();

  const mustSwap = (a, b) => isAscending ? a < b : a > b;
  const canStay = (a, b) => isAscending ? a <= b : a >= b;
  const orderText = isAscending ? "Ascendente" : "Descendente";

  steps.push({
    arr: [...arr],
    msg: `${t(0)} 🚀 Iniciando ${type} Sort (${orderText})`,
    highlight: []
  });

  if (type === 'Selection') {
    for (let i = 0; i < arr.length - 1; i++) {
      let selected = i;

      for (let j = i + 1; j < arr.length; j++) {
        comparisons++;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} 🔍 Comparando: ${arr[j]} vs ${arr[selected]}`,
          highlight: [j, selected]
        });

        if (mustSwap(arr[j], arr[selected])) {
          selected = j;
        }
      }

      if (selected !== i) {
        const beforeA = arr[i];
        const beforeB = arr[selected];

        [arr[i], arr[selected]] = [arr[selected], arr[i]];
        movements++;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} 🔄 Intercambio: ${beforeA} ↔️ ${beforeB}`,
          highlight: [i, selected]
        });
      }
    }
  }

  else if (type === 'Insertion') {
    for (let i = 1; i < arr.length; i++) {
      let key = arr[i];
      let j = i - 1;

      steps.push({
        arr: [...arr],
        msg: `${t(steps.length)} 📥 Tomando ${key}`,
        highlight: [i]
      });

      while (j >= 0) {
        comparisons++;

        if (!mustSwap(key, arr[j])) break;

        arr[j + 1] = arr[j];
        movements++;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} ⬅️ Desplazando ${arr[j]}`,
          highlight: [j, j + 1]
        });

        j--;
      }

      arr[j + 1] = key;
      movements++;

      steps.push({
        arr: [...arr],
        msg: `${t(steps.length)} ✅ Insertando ${key} en posición ${j + 1}`,
        highlight: [j + 1]
      });
    }
  }

  else if (type === 'Merge') {
    const merge = (left, mid, right) => {
      const L = arr.slice(left, mid + 1);
      const R = arr.slice(mid + 1, right + 1);

      let i = 0;
      let j = 0;
      let k = left;

      while (i < L.length && j < R.length) {
        comparisons++;

        if (canStay(L[i], R[j])) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }

        movements++;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} 🧩 Mezclando sub-arreglos`,
          highlight: [k]
        });

        k++;
      }

      while (i < L.length) {
        arr[k] = L[i];
        movements++;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} 🧩 Copiando restante izquierdo`,
          highlight: [k]
        });

        i++;
        k++;
      }

      while (j < R.length) {
        arr[k] = R[j];
        movements++;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} 🧩 Copiando restante derecho`,
          highlight: [k]
        });

        j++;
        k++;
      }
    };

    const mergeSort = (left, right) => {
      if (left >= right) return;

      const mid = Math.floor((left + right) / 2);

      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    };

    mergeSort(0, arr.length - 1);
  }

  else if (type === 'Shell') {
    const n = arr.length;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < n; i++) {
        let temp = arr[i];
        let j = i;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} ⚡ Gap ${gap}: tomando ${temp}`,
          highlight: [i]
        });

        while (j >= gap) {
          comparisons++;

          if (!mustSwap(temp, arr[j - gap])) break;

          arr[j] = arr[j - gap];
          movements++;

          steps.push({
            arr: [...arr],
            msg: `${t(steps.length)} ⚡ Gap ${gap}: desplazando ${arr[j - gap]}`,
            highlight: [j, j - gap]
          });

          j -= gap;
        }

        arr[j] = temp;
        movements++;

        steps.push({
          arr: [...arr],
          msg: `${t(steps.length)} ✅ Insertando ${temp} con gap ${gap}`,
          highlight: [j]
        });
      }
    }
  }

  const endTime = performance.now();

  const algorithmWeight = {
    Selection: 1.25,
    Insertion: 1.05,
    Merge: 0.85,
    Shell: 0.95
  };

  const realTime = endTime - startTime;
  const estimatedTime =
    realTime +
    comparisons * 0.015 * (algorithmWeight[type] || 1) +
    movements * 0.010 * (algorithmWeight[type] || 1);

  const totalTime = estimatedTime.toFixed(3);

  steps.push({
    arr: [...arr],
    msg: `${t(steps.length)} ✅ Finalizado en ${totalTime}s | Comparaciones: ${comparisons} | Movimientos: ${movements}`,
    highlight: [],
    execTime: totalTime
  });

  return {
    steps,
    totalTime,
    finalArray: arr
  };
};