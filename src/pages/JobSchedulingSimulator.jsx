/**
 * JobSchedulingSimulator Page
 * 
 * This is the main simulator component for the CPU scheduling visualization.
 * It manages the overall state and coordination between different components:
 * - Process input form
 * - Live execution display
 * - Gantt chart visualization
 * - Results display
 * 
 * The component handles:
 * - Process scheduling simulation
 * - Real-time updates of process states
 * - Simulation speed control
 * - Pause/resume functionality
 */

import { useState, useEffect, useRef } from 'react';
import ProcessInputForm from '../components/ProcessInputForm';
import LiveExecutionComponent from '../components/LiveExecutionComponent';
import GanttChartComponent from '../components/GanttChartComponent';
import ResultsComponent from '../components/ResultsComponent';
import AlgorithmComparison from '../components/comparison/AlgorithmComparison';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

import {
  generateFCFSSteps,
  generateSJFSteps,
  generateSRTFSteps,
  generateRRSteps,
  generatePrioritySteps,
  generatePreemptivePrioritySteps
} from '../algorithms/scheduling';

const JobSchedulingSimulator = () => {
  // State management
  const [processes, setProcesses] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [liveProcesses, setLiveProcesses] = useState([]);
  const [finalResults, setFinalResults] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [contextSwitchTime, setContextSwitchTime] = useState(0.0);
  const [isPaused, setIsPaused] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonResults, setComparisonResults] = useState({});
  const intervalRef = useRef(null);
  const currentStepRef = useRef(0);

  // Start the scheduling simulation with given parameters
  const startSimulation = (processes, algorithm, quantum, contextSwitch) => {
    let steps;
    switch (algorithm) {
      case 'fcfs':
        steps = generateFCFSSteps(processes, contextSwitch);
        break;
      case 'sjf':
        steps = generateSJFSteps(processes, contextSwitch);
        break;
      case 'srtf':
        steps = generateSRTFSteps(processes, contextSwitch);
        break;
      case 'rr':
        steps = generateRRSteps(processes, quantum, contextSwitch);
        break;
      case 'priority':
        steps = generatePrioritySteps(processes, contextSwitch);
        break;
      case 'priority-preemptive':
        steps = generatePreemptivePrioritySteps(processes, contextSwitch);
        break;
      default:
        steps = generateFCFSSteps(processes, contextSwitch);
    }

    setEvents(steps);
    setCurrentTime(0);
    currentStepRef.current = 0;
    setFinalResults([]);
    setIsPaused(false);
    setLiveProcesses(
      processes.map(p => ({
        ...p,
        remainingBurstTime: p.burstTime,
        completed: false,
        started: false,
        startTime: null,
        endTime: null,
      }))
    );
  };

  // Run comparison of all algorithms
  const runComparison = (processes, selectedAlgorithms, quantum, contextSwitch) => {
    const results = {};

    selectedAlgorithms.forEach(algo => {
      let steps;
      switch (algo) {
        case 'fcfs':
          steps = generateFCFSSteps(processes, contextSwitch);
          break;
        case 'sjf':
          steps = generateSJFSteps(processes, contextSwitch);
          break;
        case 'srtf':
          steps = generateSRTFSteps(processes, contextSwitch);
          break;
        case 'rr':
          steps = generateRRSteps(processes, quantum, contextSwitch);
          break;
        case 'priority':
          steps = generatePrioritySteps(processes, contextSwitch);
          break;
        case 'priority-preemptive':
          steps = generatePreemptivePrioritySteps(processes, contextSwitch);
          break;
      }

      // Calculate metrics for this algorithm
      const liveProcesses = processes.map(p => ({
        ...p,
        remainingBurstTime: p.burstTime,
        completed: false,
        started: false,
        startTime: null,
        endTime: null,
      }));

      let currentTime = 0;
      steps.forEach(step => {
        if (step.startsWith('p')) {
          const processId = parseInt(step.slice(1));
          const process = liveProcesses.find(p => p.pid === processId);
          if (process) {
            if (!process.started) {
              process.started = true;
              process.startTime = currentTime;
            }
            process.remainingBurstTime--;
            if (process.remainingBurstTime === 0) {
              process.completed = true;
              process.endTime = currentTime + 1;
            }
          }
        }
        currentTime++;
      });

      const finalResults = liveProcesses.map(p => {
        const turnaroundTime = (p.endTime ?? currentTime) - p.arrivalTime;
        const waitingTime = Math.max(0, turnaroundTime - p.burstTime);
        const responseTime = p.startTime === null ? 0 : p.startTime - p.arrivalTime;
        return {
          ...p,
          turnaroundTime,
          waitingTime,
          responseTime,
        };
      });

      const avgWaitingTime = finalResults.reduce((sum, p) => sum + p.waitingTime, 0) / finalResults.length;
      const avgTurnaroundTime = finalResults.reduce((sum, p) => sum + p.turnaroundTime, 0) / finalResults.length;
      const avgResponseTime = finalResults.reduce((sum, p) => sum + p.responseTime, 0) / finalResults.length;
      const totalTime = Math.max(...finalResults.map(p => p.endTime ?? 0));
      const cpuThroughput = totalTime > 0 ? (finalResults.length / totalTime).toFixed(2) : 0;
      const totalBurstTime = finalResults.reduce((sum, p) => sum + p.burstTime, 0);
      const cpuUtilization = totalTime > 0 ? ((totalBurstTime / totalTime) * 100).toFixed(2) : 0;

      results[algo] = {
        avgWaitingTime,
        avgTurnaroundTime,
        avgResponseTime,
        cpuThroughput,
        cpuUtilization,
        totalTime,
        steps,
      };
    });

    setComparisonResults(results);
  };

  // Main simulation loop
  useEffect(() => {
    if (events.length === 0) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        // Only process if we haven't reached the end
        if (currentStepRef.current >= events.length) {
          clearInterval(intervalRef.current);
          return;
        }

        const step = events[currentStepRef.current];
        
        // Update process states based on current step
        setLiveProcesses(prevProcesses =>
          prevProcesses.map(p => {
            const updated = { ...p };

            // Check if this is a process step
            if (step.startsWith('p')) {
              const processId = parseInt(step.slice(1));
              if (p.pid === processId) {
                // Set start time when process first starts
                if (!updated.started) {
                  updated.started = true;
                  updated.startTime = currentStepRef.current-1;
                }
                updated.remainingBurstTime -= 1;

                if (updated.remainingBurstTime === 0) {
                  updated.completed = true;
                  updated.endTime = currentStepRef.current;
                }
              }
            }

            return updated;
          })
        );

        // Update current time and step
        setCurrentTime(currentStepRef.current);
        currentStepRef.current += 1;

        // If we've reached the end, calculate final statistics
        if (currentStepRef.current >= events.length) {
          setLiveProcesses(prevProcesses => {
            const results = prevProcesses.map(p => {
              const turnaroundTime = (p.endTime ?? currentStepRef.current - 1) - p.arrivalTime;
              const waitingTime = Math.max(0, turnaroundTime - p.burstTime);
              const responseTime = p.startTime === null ? 0 : p.startTime - p.arrivalTime;
              return {
                ...p,
                turnaroundTime,
                waitingTime,
                responseTime,
                startTime: p.startTime ?? 'Not Started',
                endTime: p.endTime ?? 'Not Completed'
              };
            });
            setFinalResults(results);
            return prevProcesses;
          });
        }
      }, 1000 / speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [events, speed, isPaused]);

  // Handle form submission from ProcessInputForm
  const handleFormSubmit = (processes, algorithm, quantum, contextSwitch) => {
    setProcesses(processes);
    setTimeQuantum(quantum);
    setContextSwitchTime(contextSwitch);
    
    if (comparisonMode) {
      runComparison(processes, algorithm, quantum, contextSwitch);
    } else {
      setSelectedAlgorithm(algorithm);
    startSimulation(processes, algorithm, quantum, contextSwitch);
    }
  };

  // Reset simulation state
  const handleClear = () => {
    setEvents([]);
    setCurrentTime(0);
    setLiveProcesses([]);
    setFinalResults([]);
    setComparisonResults({});
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Toggle simulation pause state
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  // Handle comparison mode change
  const handleComparisonModeChange = (enabled) => {
    setComparisonMode(enabled);
    if (enabled) {
      // Clear current simulation when switching to comparison mode
      handleClear();
    }
  };

  // Helper function to calculate rankings for a metric
  const calculateRankings = (results, metric, lowerIsBetter = true) => {
    const sortedAlgos = Object.entries(results)
      .map(([algo, data]) => ({ algo, value: data[metric] }))
      .sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value);
    
    return sortedAlgos.reduce((acc, { algo }, index) => {
      acc[algo] = index + 1;
      return acc;
    }, {});
  };

  // Helper function to get metric display name
  const getMetricDisplayName = (metric) => {
    const displayNames = {
      avgWaitingTime: 'Average Waiting Time',
      avgTurnaroundTime: 'Average Turnaround Time',
      avgResponseTime: 'Average Response Time',
      cpuThroughput: 'CPU Throughput',
      cpuUtilization: 'CPU Utilization',
      totalTime: 'Total Time'
    };
    return displayNames[metric] || metric;
  };

  // Helper function to get best and worst values for a metric
  const getBestAndWorstValues = (results, metric, lowerIsBetter) => {
    const values = Object.values(results).map(r => parseFloat(r[metric]));
    const bestValue = lowerIsBetter ? Math.min(...values) : Math.max(...values);
    const worstValue = lowerIsBetter ? Math.max(...values) : Math.min(...values);
    return { bestValue, worstValue };
  };

  // Helper function to format metric value
  const formatMetricValue = (metric, value) => {
    const numValue = parseFloat(value);
    if (metric === 'cpuUtilization') return `${numValue.toFixed(2)}%`;
    if (metric === 'cpuThroughput') return numValue.toFixed(2);
    return numValue.toFixed(2);
  };

  // Helper function to get performance icons
  const getPerformanceIcon = (score, isBest, isWorst) => {
    if (isBest) return "🏆"; // Trophy for best
    if (isWorst) return "⚠️"; // Warning for worst
    return "⭐"; // Star for others
  };

  // Calculate overall rankings with same score handling
  const calculateOverallRankings = (results) => {
    const metrics = {
      avgWaitingTime: { weight: 0.25, lowerIsBetter: true },
      avgTurnaroundTime: { weight: 0.25, lowerIsBetter: true },
      avgResponseTime: { weight: 0.2, lowerIsBetter: true },
      cpuThroughput: { weight: 0.15, lowerIsBetter: false },
      cpuUtilization: { weight: 0.15, lowerIsBetter: false }
    };

    const algoScores = Object.keys(results).map(algo => {
      let score = 0;
      Object.entries(metrics).forEach(([metric, { weight, lowerIsBetter }]) => {
        const rankings = calculateRankings(results, metric, lowerIsBetter);
        score += (rankings[algo] * weight);
      });
      return { algo, score };
    });

    // Sort by score
    const sortedScores = algoScores.sort((a, b) => a.score - b.score);
    
    // Find best and worst scores
    const bestScore = sortedScores[0].score;
    const worstScore = sortedScores[sortedScores.length - 1].score;

    // Add rank and isBest/isWorst flags
    return sortedScores.map(({ algo, score }) => ({
      algo,
      score,
      isBest: Math.abs(score - bestScore) < 0.001,
      isWorst: Math.abs(score - worstScore) < 0.001
    }));
  };

  // Helper function to sort algorithms by metric value
  const sortAlgorithmsByMetric = (results, metric, lowerIsBetter = true) => {
    return Object.entries(results)
      .map(([algo, data]) => ({ algo, value: data[metric] }))
      .sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value)
      .map(({ algo }) => algo);
  };

  // Helper function to prepare chart data
  const prepareChartData = (results, metric) => {
    const algorithms = Object.keys(results);
    const values = algorithms.map(algo => results[algo][metric]);
    
    return {
      labels: algorithms.map(algo => algo.replace('-', ' ').toUpperCase()),
      datasets: [{
        label: getMetricDisplayName(metric),
        data: values,
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)'
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(255, 99, 132)',
          'rgb(255, 205, 86)'
        ],
        borderWidth: 1
      }]
    };
  };

  // Helper function to prepare radar chart data
  const prepareRadarData = (results) => {
    const algorithms = Object.keys(results);
    const metrics = ['avgWaitingTime', 'avgTurnaroundTime', 'avgResponseTime', 'cpuThroughput', 'cpuUtilization'];
    
    return {
      labels: metrics.map(metric => getMetricDisplayName(metric)),
      datasets: algorithms.map((algo, index) => ({
        label: algo.replace('-', ' ').toUpperCase(),
        data: metrics.map(metric => {
          const value = results[algo][metric];
          // Normalize values between 0 and 1
          const maxValue = Math.max(...algorithms.map(a => results[a][metric]));
          return value / maxValue;
        }),
        backgroundColor: `rgba(${index * 50}, ${255 - index * 40}, ${index * 30}, 0.2)`,
        borderColor: `rgba(${index * 50}, ${255 - index * 40}, ${index * 30}, 1)`,
        borderWidth: 2
      }))
    };
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Metrics Comparison'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Overall Performance Comparison'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1
      }
    }
  };

  return (
    <div className="container my-5">
      {/* Title */}
      <h1 className="text-center fw-bold mb-4 display-5 text-primary">
        Job Scheduling Visualization
      </h1>

      {/* Process input form */}
      <div className="mb-5">
        <ProcessInputForm 
          onSubmit={handleFormSubmit}
          onClear={handleClear}
          comparisonMode={comparisonMode}
          onComparisonModeChange={handleComparisonModeChange}
        />
      </div>

      {comparisonMode ? (
        <AlgorithmComparison comparisonResults={comparisonResults} />
      ) : (
        <>
          {/* Live execution display */}
          {liveProcesses.length > 0 && (
            <div className="mb-5">
              <LiveExecutionComponent
                liveProcesses={liveProcesses}
                onSpeedChange={setSpeed}
                currentTime={currentTime}
                isPaused={isPaused}
                onPauseToggle={handlePauseToggle}
                events={events}
              />
            </div>
          )}

          {/* Gantt chart visualization */}
          {events.length > 0 && (
            <div className="mb-5">
              <GanttChartComponent
                schedule={events.slice(0, currentTime + 1)}
              />
            </div>
          )}

          {/* Final results display */}
          {finalResults.length > 0 && (
            <div className="mb-5">
              <ResultsComponent results={finalResults} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobSchedulingSimulator;
 