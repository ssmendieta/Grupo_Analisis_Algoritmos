import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Eye, Plus, Download, X, Trash2, Edit3, Upload, ArrowUpWideNarrow, ArrowDownWideNarrow, Play, HelpCircle } from 'lucide-react';
import { getSortSteps } from '../utils/sorts';

export default function SortsPage() {
  const [inputValue, setInputValue] = useState("12,54,8,69");
  const [array, setArray] = useState([12, 54, 8, 69]);
  const [initialArray, setInitialArray] = useState([12, 54, 8, 69]);
  const [sortedArray, setSortedArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showStats, setShowStats] = useState(true);
  const [isAscending, setIsAscending] = useState(true);
  const [execTime, setExecTime] = useState("0.000");
  const [currentAlgo, setCurrentAlgo] = useState("Stats");
  const [selectedAlgo, setSelectedAlgo] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentStep]);

  useEffect(() => {
    if (steps.length > 0 && currentStep >= 0 && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        const nextStep = steps[currentStep + 1];
        setArray(nextStep.arr);
        if (nextStep.execTime) setExecTime(nextStep.execTime);
        setCurrentStep(prev => prev + 1);
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  const parseArrayText = (text) => {
    return text
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\n/g, ',')
      .replace(/\s/g, '')
      .split(',')
      .map(Number)
      .filter(n => !isNaN(n));
  };

  const resetAnimationState = () => {
    setSteps([]);
    setCurrentStep(-1);
    setSortedArray([]);
    setExecTime("0.000");
    setSelectedAlgo("");
  };

  const runAlgorithm = (type) => {
    const baseArray = [...initialArray];

    if (baseArray.length === 0) return;

    setSelectedAlgo(type);
    setCurrentAlgo(`${type} Sort Stats`);
    setArray(baseArray);
    setSteps([]);
    setCurrentStep(-1);
    setSortedArray([]);
    setExecTime("0.000");

    setTimeout(() => {
      const { steps: resSteps, totalTime, finalArray } = getSortSteps(type, baseArray, isAscending);

      setSteps(resSteps);
      setSortedArray(finalArray);
      setExecTime(totalTime);
      setArray(resSteps[0].arr);
      setCurrentStep(0);
    }, 0);
  };

  const handleGenerate = () => {
    const newArray = parseArrayText(inputValue);

    setArray(newArray);
    setInitialArray(newArray);
    resetAnimationState();
    setCurrentAlgo("Stats");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;

      try {
        const importedData = JSON.parse(content);

        if (importedData && Array.isArray(importedData.array)) {
          setInputValue(importedData.initialArray?.join(',') || importedData.array.join(','));
          setArray(importedData.array || []);
          setInitialArray(importedData.initialArray || importedData.array || []);
          setSortedArray(importedData.sortedArray || []);
          setSteps(importedData.steps || []);
          setCurrentStep(importedData.currentStep ?? -1);
          setExecTime(importedData.execTime || "0.000");
          setCurrentAlgo(importedData.currentAlgo || "Stats");
          setSelectedAlgo(importedData.selectedAlgo || "");
          setIsAscending(importedData.isAscending ?? true);
          setShowStats(true);

          e.target.value = "";
          return;
        }
      } catch (error) {
        const newArray = parseArrayText(content);

        setInputValue(newArray.join(','));
        setArray(newArray);
        setInitialArray(newArray);
        resetAnimationState();
        setCurrentAlgo("Stats");
      }

      e.target.value = "";
    };

    reader.readAsText(file);
  };

  const handleExport = () => {
    const fileName = prompt("Nombre del archivo:", "arreglo_sort");

    if (!fileName) return;

    const exportData = {
      inputValue,
      array,
      initialArray,
      sortedArray,
      steps,
      currentStep,
      execTime,
      currentAlgo,
      selectedAlgo,
      isAscending
    };

    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const cleanName = fileName.replace(/\.json$/i, '');

    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanName}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestartAnimation = () => {
    if (steps.length === 0) return;

    setArray(steps[0].arr);
    setExecTime("0.000");
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-[#060c1c] p-6 text-white font-sans flex flex-col">
      <div className="flex justify-between items-center mb-6 px-10">
        <div className="flex items-center gap-2 opacity-60"><HelpCircle size={20}/> Ayuda</div>
        <h1 className="text-4xl font-bold tracking-[0.3em]">SORTS</h1>
        <div className="w-20"></div>
      </div>

      <div className="flex flex-1 gap-6 max-w-[1700px] mx-auto w-full h-[75vh]">
        <div className="flex-[2] rounded-[40px] border-2 border-dashed border-white/10 bg-slate-900/20 p-10 flex items-end justify-center gap-6 relative shadow-2xl overflow-hidden">
          {array.map((val, idx) => (
            <div
              key={idx}
              style={{
                height: `${(val / (Math.max(...array, 1))) * 360 + 90}px`,
                width: '105px'
              }}
              className={`rounded-full flex items-end justify-center pb-6 text-2xl font-black transition-all duration-300 ${
                steps[currentStep]?.highlight?.includes(idx)
                  ? 'bg-orange-500 scale-110 shadow-orange-500/50'
                  : 'bg-cyan-500 shadow-cyan-500/20'
              }`}
            >
              {val}
            </div>
          ))}

          <div className="absolute right-8 bottom-8 flex flex-col gap-3">
            {['Selection', 'Insertion', 'Merge', 'Shell'].map(algo => (
              <button
                key={algo}
                onClick={() => runAlgorithm(algo)}
                className={`text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
                  selectedAlgo === algo
                    ? 'bg-[#f97316] shadow-orange-500/40 scale-105'
                    : 'bg-[#3ccf4e] hover:bg-emerald-500'
                }`}
              >
                <Play size={16} fill="white"/> {algo} Sort
              </button>
            ))}
          </div>
        </div>

        {showStats && (
          <div className="w-[450px] bg-white rounded-[40px] p-8 text-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold text-slate-700">{currentAlgo} ⏱️</h2>
              <button onClick={() => setShowStats(false)} className="bg-red-500 text-white p-1 rounded-full">
                <X size={24}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiempo de Ejecución:</p>
                <div className="bg-[#6366f1] text-white p-4 rounded-2xl text-center text-2xl font-bold">{execTime}s</div>
              </div>

              <div className="flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registro de Pasos:</p>
                <div ref={scrollRef} className="bg-slate-50 border rounded-2xl p-4 h-48 overflow-y-auto font-mono text-[11px] text-slate-500">
                  {steps.map((s, i) => (
                    <div key={i} className={i === currentStep ? 'bg-indigo-50 text-indigo-700 font-bold p-1' : 'p-1'}>
                      {s.msg}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arreglo Inicial:</p>
                <div className="bg-blue-50 text-blue-600 border border-blue-100 p-3 rounded-xl font-mono text-xs">
                  [{initialArray.join(', ')}]
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arreglo Ordenado:</p>
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl font-mono text-xs">
                  [{sortedArray.join(', ')}]
                </div>
              </div>
            </div>

            <button onClick={handleRestartAnimation} className="w-full bg-[#6366f1] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <RotateCcw size={18}/> Reiniciar Animación
            </button>

            <button onClick={handleExport} className="w-full bg-[#22c55e] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Download size={18}/> Exportar Arreglo
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-full p-2 flex items-center gap-3 shadow-2xl max-w-7xl mx-auto w-full">
        <input
          className="bg-transparent text-slate-800 px-8 flex-1 outline-none font-bold"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="12,54,8,69..."
        />

        <div className="flex gap-2">
          <button onClick={handleGenerate} className="bg-[#10b981] text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold text-xs">
            <Plus size={16}/> Generar
          </button>

          <button onClick={() => {
            setInputValue("");
            setArray([]);
            setInitialArray([]);
            setSortedArray([]);
            setSteps([]);
            setCurrentStep(-1);
            setExecTime("0.000");
            setCurrentAlgo("Stats");
            setSelectedAlgo("");
          }} className="bg-[#10b981] text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold text-xs">
            <Trash2 size={16}/> Limpiar
          </button>

          <button className="bg-[#10b981] text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold text-xs">
            <Edit3 size={16}/> Manual
          </button>

          <label className="bg-[#3b82f6] text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold text-xs cursor-pointer">
            <Upload size={16}/> Importar
            <input type="file" accept=".txt,.csv,.json" hidden onChange={handleImport}/>
          </label>

          <button onClick={() => setIsAscending(!isAscending)} className="bg-[#10b981] text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold text-xs">
            {isAscending ? <ArrowUpWideNarrow size={16}/> : <ArrowDownWideNarrow size={16}/>}
            {isAscending ? "Ascendente" : "Descendente"}
          </button>

          <button onClick={() => setShowStats(true)} className="bg-[#f97316] text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold text-xs">
            <Eye size={16}/> Stats
          </button>

          <button className="bg-[#3ccf4e] text-white w-12 rounded-full flex items-center justify-center shadow-lg">
            <X size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
}