"use client";

import { useState } from "react";

interface PopupSettingsProps {
  show: boolean;
  onClose: () => void;
  onSave: (values: { algorithm: string; key: string }) => void;
}

export function PopupSettings({ show, onClose, onSave }: PopupSettingsProps) {
  const [saving, setSaving] = useState({
    algorithm: "",
    key: "",
  });

  const algorithms = [
    { id: 1, label: "Ceasar" },
    { id: 2, label: "Hill" },
    { id: 3, label: "Playfair" },
  ];
  const [matrixSize, setMatrixSize] = useState(2)
  const [matrix, setMatrix] = useState<number[][]>(
    Array(2)
      .fill(null)
      .map(() => Array(2).fill(0)),
  )

  const handleMatrixChange = (row: number, col: number, value: string) => {
    const num = value === "" ? 0 : Number.parseInt(value) || 0
    const newMatrix = matrix.map((r) => [...r])
    newMatrix[row][col] = num
    setMatrix(newMatrix)
  }

  const handleIncreaseMatrix = () => {
    if (matrixSize < 6) {
      const newSize = matrixSize + 1
      setMatrixSize(newSize)
      const newMatrix = Array(newSize)
        .fill(null)
        .map(() => Array(newSize).fill(0))
      // Copy existing values
      for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
          newMatrix[i][j] = matrix[i][j]
        }
      }
      setMatrix(newMatrix)
    }
  }
  const handleDecreaseMatrix = () =>{
    if (matrixSize > 2) {
      const newSize = matrixSize - 1;
      setMatrixSize(newSize);
      const newMatrix = Array(newSize)
      .fill(null)
      .map(() => Array(newSize).fill(0));

    for (let i = 0; i < newSize; i++) {
      for (let j = 0; j < newSize; j++) {
        newMatrix[i][j] = matrix[i][j];
      }
    }
     setMatrix(newMatrix);
    }
  }
  const getMatrixKey = () => {
    return matrix.map((row) => row.join(",")).join(";")
  }

  const handleSave = () => {
    if (saving.algorithm === "Hill") {
      const matrixKey = getMatrixKey()
      if (matrixKey.trim()) {
        onSave({algorithm: saving.algorithm, key : matrixKey})
      }
    } else if (saving.key.trim()) {
      onSave({algorithm : saving.algorithm, key : saving.key})
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 text-white w-[90%] max-w-md rounded-2xl shadow-2xl border border-slate-700/70 p-6 space-y-6 animate-fadeIn  max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-xl font-semibold text-center text-cyan-400">
         Crypto Settings
        </h2>

        {/* Select Algorithm */}
        <div>
          <label
            htmlFor="algorithms"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Choose Algorithm
          </label>
          <select
            id="algorithms"
            name="algorithms"
            value={saving.algorithm}
            onChange={(e) =>
              setSaving({ ...saving, algorithm: e.target.value })
            }
            className="block w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm appearance-none"
          >
            <option value="">Select one...</option>
            {algorithms.map((item) => (
              <option key={item.id} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Input Key */}
        {saving.algorithm === "Hill" ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-300">
                Encryption Matrix ({matrixSize}x{matrixSize})
              </label>
              <button 
              onClick={handleDecreaseMatrix}
              disabled={matrixSize <=2}
              className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors">
                Less
              </button>
              <button
                onClick={handleIncreaseMatrix}
                disabled={matrixSize >= 6}
                className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                More
              </button>
            </div>

            {/* Matrix Grid */}
            <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <div className="space-y-2">
                {matrix.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-2">
                    {row.map((val, colIdx) => (
                      <input
                        key={`${rowIdx}-${colIdx}`}
                        type="number"
                        value={val}
                        onChange={(e) => handleMatrixChange(rowIdx, colIdx, e.target.value)}
                        className="w-12 h-12 px-2 py-1 bg-slate-800 border border-slate-500 rounded text-white text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Enter numbers for each cell. Click "More" to expand up to 6x6.
            </p>
          </div>
        ) :
        (<div>
          <label
            htmlFor="key"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Encryption Key
          </label>
          <input
            id="key"
            type="text"
            placeholder="Enter encryption key"
            value={saving.key}
            onChange={(e) => setSaving({ ...saving, key: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <p className="text-xs text-slate-400 mt-2">
            {saving.algorithm === "" && "Choose an algorithm"}
            {saving.algorithm === "Ceasar" && "Enter a numeric shift value"}
            {saving.algorithm === "Hill" && "Enter a valid matrix key"}
            {saving.algorithm === "Playfair" && "Enter a single word key"}
          </p>
        </div>
        )}
        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            disabled={
                        !saving.algorithm ||
                        (saving.algorithm !== "Hill" && !saving.key)
                      }
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}