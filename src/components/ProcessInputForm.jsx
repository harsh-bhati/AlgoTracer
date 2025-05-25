/**
 * ProcessInputForm
 * 
 * This component provides a form for users to:
 * - Select a scheduling algorithm
 * - Configure algorithm parameters (time quantum, context switch time)
 * - Add/remove processes
 * - Set process properties (arrival time, burst time, priority)
 * 
 * The form includes validation and error handling for process inputs.
 */

import { useState } from 'react';

// Available scheduling algorithms with their properties
const algorithms = [
  { id: 'fcfs', name: 'First Come First Serve (FCFS)', preemptive: false },
  { id: 'sjf', name: 'Shortest Job First (SJF)', preemptive: false },
  { id: 'srtf', name: 'Shortest Remaining Time First (SRTF)', preemptive: true },
  { id: 'rr', name: 'Round Robin (RR)', preemptive: true },
  { id: 'priority', name: 'Priority Scheduling', preemptive: false },
  { id: 'priority-preemptive', name: 'Priority Scheduling (Preemptive)', preemptive: true }
];

const ProcessInputForm = ({ onSubmit, onClear, comparisonMode, onComparisonModeChange }) => {
  // State management for form inputs
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('fcfs');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(['fcfs', 'sjf']); // Default selection for comparison
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [contextSwitchTime, setContextSwitchTime] = useState(0.0);
  const [processes, setProcesses] = useState([
    { pid: 1, arrivalTime: 0, burstTime: 1, priority: 1 }
  ]);
  const [errors, setErrors] = useState([{}]);
  const [randomProcessCount, setRandomProcessCount] = useState(5);

  // Add a new process to the list
  const handleAddProcess = () => {
    setProcesses([
      ...processes,
      {
        pid: processes.length + 1,
        arrivalTime: 0,
        burstTime: 1,
        priority: 1
      }
    ]);
    setErrors([...errors, {}]);
  };

  // Generate random processes
  const handleGenerateRandomProcesses = () => {
    const count = parseInt(randomProcessCount);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid number of processes greater than 0.");
      return;
    }

    const newProcesses = [];
    const existingProcessCount = processes.length;
    for (let i = 0; i < count; i++) {
      const pid = existingProcessCount + i + 1;
      // Generate random arrival time between 0 and 20
      const arrivalTime = Math.floor(Math.random() * 21);
      // Generate random burst time between 1 and 20
      const burstTime = Math.floor(Math.random() * 20) + 1;
      // Generate random priority between 1 and 10 (if priority scheduling is enabled)
      const priority = selectedAlgorithm.includes('priority') || selectedAlgorithms.some(algo => algo.includes('priority')) ? Math.floor(Math.random() * 10) + 1 : 1;

      newProcesses.push({
        pid,
        arrivalTime,
        burstTime,
        priority,
      });
    }

    setProcesses([...processes, ...newProcesses]);
    setErrors([...errors, ...newProcesses.map(() => ({}))]); // Add empty error objects for new processes
  };

  // Remove a process from the list
  const handleRemoveProcess = (index) => {
    const updatedProcesses = processes.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setProcesses(updatedProcesses);
    setErrors(updatedErrors);
  };

  // Update process properties
  const handleProcessChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index] = {
      ...newProcesses[index],
      [field]: value
    };
    setProcesses(newProcesses);
  };

  // Validate process inputs
  const validateProcesses = () => {
    const newErrors = processes.map(p => {
      const err = {};
      if (p.arrivalTime === '' || parseInt(p.arrivalTime) < 0) err.arrivalTime = 'Arrival time must be ≥ 0';
      if (p.burstTime === '' || parseInt(p.burstTime) < 1) err.burstTime = 'Burst time must be ≥ 1';
      if (selectedAlgorithm.includes('priority') && (p.priority === '' || parseInt(p.priority) < 1)) {
        err.priority = 'Priority must be ≥ 1';
      }
      return err;
    });
    setErrors(newErrors);
    return newErrors.every(err => Object.keys(err).length === 0);
  };

  // Reset form inputs only
  const handleClearInputForm = () => {
    setProcesses([{ pid: 1, arrivalTime: 0, burstTime: 1, priority: 1 }]);
    setErrors([{}]);
    setSelectedAlgorithm('fcfs');
    setTimeQuantum(2);
    setContextSwitchTime(0.0);
    setRandomProcessCount(5); // Also reset the random process count input
    // Do NOT call onClear() here
  };

  // Handle algorithm selection in comparison mode
  const handleAlgorithmSelection = (algoId) => {
    setSelectedAlgorithms(prev => {
      if (prev.includes(algoId)) {
        // Don't remove if it's the last selected algorithm
        if (prev.length <= 2) return prev;
        return prev.filter(id => id !== algoId);
      } else {
        return [...prev, algoId];
      }
    });
  };

  // Remove selected algorithm from comparison
  const handleRemoveAlgorithm = (algoId) => {
    setSelectedAlgorithms(prev => {
      if (prev.length <= 2) return prev;
      return prev.filter(id => id !== algoId);
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateProcesses()) return;

    // Convert values to numbers before submission
    const sanitizedProcesses = processes.map(p => ({
      pid: p.pid,
      arrivalTime: parseInt(p.arrivalTime),
      burstTime: parseInt(p.burstTime),
      priority: parseInt(p.priority)
    }));

    if (comparisonMode) {
      // In comparison mode, pass the selected algorithms
      onSubmit(sanitizedProcesses, selectedAlgorithms, timeQuantum, contextSwitchTime);
    } else {
      // In single mode, pass the single selected algorithm
      onSubmit(sanitizedProcesses, selectedAlgorithm, timeQuantum, contextSwitchTime);
    }
  };

  // Determine which fields to show based on selected algorithm
  const showPriorityField = comparisonMode 
    ? selectedAlgorithms.some(algo => algo.includes('priority'))
    : selectedAlgorithm.includes('priority');
  const showTimeQuantumField = comparisonMode 
    ? selectedAlgorithms.includes('rr')
    : selectedAlgorithm === 'rr';

  return (
    <form onSubmit={handleSubmit} className=" p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Process Input</h2>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => onComparisonModeChange(!comparisonMode)}
            className={`relative inline-flex h-10 px-4 items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              comparisonMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {comparisonMode ? 'Comparison Mode' : 'Single Mode'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Algorithm selection and parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {comparisonMode ? 'Select Algorithms (min. 2)' : 'Algorithm'}
          </label>
          {comparisonMode ? (
            <div className="space-y-4">
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => handleAlgorithmSelection(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="" disabled>Select an algorithm</option>
                  {algorithms
                    .filter(algo => !selectedAlgorithms.includes(algo.id))
                    .map((algo) => (
                      <option key={algo.id} value={algo.id}>
                        {algo.name}
                      </option>
                    ))}
                </select>
              </div>
              {selectedAlgorithms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAlgorithms.map(algoId => {
                    const algo = algorithms.find(a => a.id === algoId);
                    return (
                      <div
                        key={algoId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <span>{algo.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAlgorithm(algoId)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          disabled={selectedAlgorithms.length <= 2}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {algorithms.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Time quantum input for Round Robin */}
        {(showTimeQuantumField || (comparisonMode && selectedAlgorithms.includes('rr'))) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Quantum</label>
            <input
              type="number"
              min="1"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Context switch time input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Context Switch Time</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={contextSwitchTime}
            onChange={(e) => setContextSwitchTime(Math.max(0, parseFloat(e.target.value) || 0))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Process list management */}
      <div className="space-y-4 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Processes</h3>
          <div className="flex items-center space-x-5">
            {/* Random Process Generator */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={randomProcessCount}
                onChange={(e) => setRandomProcessCount(e.target.value)}
                className="w-20 p-2 border rounded focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="# to generate"
              />
              <button
                type="button"
                onClick={handleGenerateRandomProcesses}
                className="btn-primary px-4 py-2 rounded"
              >
                Generate Random
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddProcess}
              className="btn-primary bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Process
            </button>
            <button
              type="button"
              onClick={handleClearInputForm}
              className="btn-secondary px-4 py-2 rounded"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Process table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="p-3 border">Process ID</th>
                <th className="p-3 border">Arrival Time</th>
                <th className="p-3 border">Burst Time</th>
                {showPriorityField && <th className="p-3 border">Priority</th>}
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                  <td className="p-3 border text-center">{process.pid}</td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) => handleProcessChange(index, 'arrivalTime', e.target.value)}
                      onBlur={validateProcesses}
                      className="w-24 p-2 border rounded focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      style={{ backgroundColor: '#e0f2fe' }}
                    />
                    {errors[index]?.arrivalTime && (
                      <p className="text-red-500 text-xs mt-1">{errors[index].arrivalTime}</p>
                    )}
                  </td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) => handleProcessChange(index, 'burstTime', e.target.value)}
                      onBlur={validateProcesses}
                      className="w-24 p-2 border rounded focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      style={{ backgroundColor: '#e0f2fe' }}
                    />
                    {errors[index]?.burstTime && (
                      <p className="text-red-500 text-xs mt-1">{errors[index].burstTime}</p>
                    )}
                  </td>
                  {showPriorityField && (
                    <td className="p-3 border">
                      <input
                        type="number"
                        min="1"
                        value={process.priority}
                        onChange={(e) => handleProcessChange(index, 'priority', e.target.value)}
                        onBlur={validateProcesses}
                        className="w-24 p-2 border rounded focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        style={{ backgroundColor: '#e0f2fe' }}
                      />
                      {errors[index]?.priority && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].priority}</p>
                      )}
                    </td>
                  )}
                  <td className="p-3 border text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveProcess(index)}
                      className="btn-danger px-3 py-1 text-sm"
                      disabled={processes.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="btn-primary bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          {comparisonMode ? 'Compare Algorithms' : 'Start Simulation'}
        </button>
      </div>
    </form>
  );
};

export default ProcessInputForm;
