/**
 * LiveExecutionComponent
 * 
 * This component displays the live execution state of the CPU scheduling simulation.
 * It shows:
 * - Current simulation time
 * - Live process table with remaining burst times
 * - Process status (Waiting/Running/Completed)
 * - Controls for simulation speed and pause/resume
 */

import SchedulerControls from './SchedulerControls';

const LiveExecutionComponent = ({ liveProcesses, onSpeedChange, currentTime, isPaused, onPauseToggle, events }) => {
  // Get the current CPU state from the events array
  const getCurrentCPUState = () => {
    if (currentTime < 0 || !events) return { state: 'idle', processId: null };
    
    // Check if all processes are completed
    const allProcessesCompleted = liveProcesses.every(proc => proc.completed);
    if (allProcessesCompleted) return { state: 'idle', processId: null };

    const currentEvent = events[currentTime];
    if (currentEvent === 'idle') {
      return { state: 'idle', processId: null };
    } else if (currentEvent === 'cs') {
      return { state: 'cs', processId: null };
    } else if (currentEvent && currentEvent.startsWith('p')) {
      return { state: 'running', processId: parseInt(currentEvent.slice(1)) };
    }
    return { state: 'idle', processId: null };
  };

  const cpuState = getCurrentCPUState();

  // CPU State Badge component
  const CPUStateBadge = ({ state, processId }) => {
    const stateConfig = {
      running: {
        icon: "⚡",
        bgColor: "#dbeafe",
        textColor: "#1e40af",
        borderColor: "#bfdbfe",
        label: `Running Process P${processId}`
      },
      cs: {
        icon: "🔄",
        bgColor: "#fef3c7",
        textColor: "#92400e",
        borderColor: "#fde68a",
        label: "Context Switch"
      },
      idle: {
        icon: "💤",
        bgColor: "#f1f5f9",
        textColor: "#334155",
        borderColor: "#e2e8f0",
        label: "CPU Idle"
      }
    };

    const config = stateConfig[state];
    return (
      <div 
        style={{
          display: 'inline-flex',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: `1px solid ${config.borderColor}`,
          backgroundColor: config.bgColor,
          color: config.textColor,
          fontSize: '1.1rem'
        }}
      >
        <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>{config.icon}</span>
        <span style={{ fontWeight: 600 }}>{config.label}</span>
      </div>
    );
  };

  // Status badge component with icon
  const StatusBadge = ({ status, processId }) => {
    const statusConfig = {
      completed: {
        icon: "✓",
        bgColor: "#dcfce7",
        textColor: "#166534",
        borderColor: "#bbf7d0"
      },
      running: {
        icon: "▶",
        bgColor: "#dbeafe",
        textColor: "#1e40af",
        borderColor: "#bfdbfe"
      },
      waiting: {
        icon: "⏳",
        bgColor: "#fef3c7",
        textColor: "#92400e",
        borderColor: "#fde68a"
      },
      notArrived: {
        icon: "⏱",
        bgColor: "#f1f5f9",
        textColor: "#334155",
        borderColor: "#e2e8f0"
      }
    };

    const config = statusConfig[status];
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          border: `1px solid ${config.borderColor}`,
          backgroundColor: config.bgColor,
          color: config.textColor
        }}
      >
        <span style={{ marginRight: '0.5rem' }}>{config.icon}</span>
        <span style={{ fontWeight: 500 }}>
          {status === 'running' ? `Running P${processId}` : 
           status === 'completed' ? 'Completed' :
           status === 'waiting' ? 'Waiting' :
           'Not Arrived'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Execution</h2>
        <div className="flex items-center space-x-4">
          {/* Pause/Resume button */}
          <button
            onClick={onPauseToggle}
            className={`px-4 py-2 rounded-md font-medium ${
              isPaused
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isPaused ? 'Resume' : 'Stop'}
          </button>
          {/* Speed control */}
          <SchedulerControls onSpeedChange={onSpeedChange} />
        </div>
      </div>

      {/* Time and CPU State Display */}
      <div className="flex gap-4">
        {/* Time counter display */}
        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '700', 
            color: '#1e40af', 
            marginBottom: '0.5rem', 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase' 
          }}>
            Current Time
          </div>
          <div style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            color: '#1e40af' 
          }}>
            {currentTime+1}
          </div>
        </div>

        {/* CPU State Display */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-4 text-center">
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '700', 
            color: '#1e293b', 
            marginBottom: '0.5rem', 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase' 
          }}>
            CPU State
          </div>
          <div className="flex justify-center items-center">
            <CPUStateBadge state={cpuState.state} processId={cpuState.processId} />
          </div>
        </div>
      </div>

      {/* Process table showing current state of each process */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border font-semibold text-gray-700">PID</th>
                <th className="p-3 border font-semibold text-gray-700">Arrival</th>
                <th className="p-3 border font-semibold text-gray-700">Remaining Burst</th>
                <th className="p-3 border font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {liveProcesses.map((proc, idx) => {
                const isWaiting = !proc.completed && proc.pid !== cpuState.processId && currentTime >= proc.arrivalTime;
                const isNotArrived = currentTime < proc.arrivalTime;

                const rowStyle = {
                  backgroundColor: proc.completed 
                    ? '#dcfce7'  // Light green
                    : proc.pid === cpuState.processId 
                    ? '#dbeafe'  // Light blue
                    : isWaiting 
                    ? '#fef3c7'  // Light yellow
                    : '#f1f5f9', // Light gray
                  transition: 'background-color 0.2s'
                };

                return (
                  <tr
                    key={idx}
                    style={rowStyle}
                  >
                    <td className="p-3 border">{proc.pid}</td>
                    <td className="p-3 border">{proc.arrivalTime}</td>
                    <td className="p-3 border">{proc.remainingBurstTime}</td>
                    <td className="p-3 border">
                      {proc.completed ? (
                        <StatusBadge status="completed" />
                      ) : proc.pid === cpuState.processId ? (
                        <StatusBadge status="running" processId={proc.pid} />
                      ) : isNotArrived ? (
                        <StatusBadge status="notArrived" />
                      ) : (
                        <StatusBadge status="waiting" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveExecutionComponent; 