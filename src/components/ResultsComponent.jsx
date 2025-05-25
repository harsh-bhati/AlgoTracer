const ResultsComponent = ({ results }) => {
  if (!results || results.length === 0) return null;

  const avgWaitingTime = results.reduce((sum, proc) => sum + proc.waitingTime, 0) / results.length;
  const avgTurnaroundTime = results.reduce((sum, proc) => sum + proc.turnaroundTime, 0) / results.length;
  const avgResponseTime = results.reduce((sum, proc) => sum + proc.responseTime, 0) / results.length;

  // Calculate CPU throughput (processes completed per time unit)
  const totalTime = Math.max(...results.map(proc => proc.endTime === 'Not Completed' ? 0 : proc.endTime));
  const cpuThroughput = totalTime > 0 ? (results.length / totalTime).toFixed(2) : 0;

  // Calculate CPU utilization
  const totalBurstTime = results.reduce((sum, proc) => sum + proc.burstTime, 0);
  const cpuUtilization = totalTime > 0 ? ((totalBurstTime / totalTime) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Results</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Process ID</th>
              <th className="p-3 border">Arrival Time</th>
              <th className="p-3 border">Burst Time</th>
              <th className="p-3 border">Start Time</th>
              <th className="p-3 border">Completion Time</th>
              <th className="p-3 border">Response Time</th>
              <th className="p-3 border">Turnaround Time</th>
              <th className="p-3 border">Waiting Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td className="p-3 border text-center">{result.pid}</td>
                <td className="p-3 border text-center">{result.arrivalTime}</td>
                <td className="p-3 border text-center">{result.burstTime}</td>
                <td className="p-3 border text-center">{result.startTime}</td>
                <td className="p-3 border text-center">{result.endTime}</td>
                <td className="p-3 border text-center">{result.responseTime}</td>
                <td className="p-3 border text-center">{result.turnaroundTime}</td>
                <td className="p-3 border text-center">{result.waitingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Metrics Section */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
        <div className="w-full flex ">
          <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 600 }}>
            <div className="metric-card" style={{ borderLeft: '5px solid #3b82f6' }}>
              <div className="metric-label" style={{ textTransform: 'uppercase', fontSize: '0.95em' }}>Average Turnaround Time</div>
              <div className="metric-value blue">{avgTurnaroundTime.toFixed(2)}</div>
            </div>
            <div className="metric-card" style={{ borderLeft: '5px solid #22c55e' }}>
              <div className="metric-label" style={{ textTransform: 'uppercase', fontSize: '0.95em' }}>Average Waiting Time</div>
              <div className="metric-value green">{avgWaitingTime.toFixed(2)}</div>
            </div>
            <div className="metric-card" style={{ borderLeft: '5px solid #f59e42' }}>
              <div className="metric-label" style={{ textTransform: 'uppercase', fontSize: '0.95em' }}>Average Response Time</div>
              <div className="metric-value orange">{avgResponseTime.toFixed(2)}</div>
            </div>
            <div className="metric-card" style={{ borderLeft: '5px solid #a855f7' }}>
              <div className="metric-label" style={{ textTransform: 'uppercase', fontSize: '0.95em' }}>CPU Utilization</div>
              <div className="metric-value purple">{cpuUtilization}%</div>
            </div>
            <div className="metric-card" style={{ borderLeft: '5px solid #f59e42' }}>
              <div className="metric-label" style={{ textTransform: 'uppercase', fontSize: '0.95em' }}>Throughput</div>
              <div className="metric-value orange">{cpuThroughput}</div>
            </div>
            <div className="metric-card" style={{ borderLeft: '5px solid #3b82f6' }}>
              <div className="metric-label" style={{ textTransform: 'uppercase', fontSize: '0.95em' }}>Total Time</div>
              <div className="metric-value blue">{totalTime}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsComponent; 