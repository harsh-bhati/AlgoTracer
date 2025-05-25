import React from 'react';

const PerformanceMetricsComparison = ({ comparisonResults }) => {
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

  // Helper function to sort algorithms by metric value
  const sortAlgorithmsByMetric = (results, metric, lowerIsBetter = true) => {
    return Object.entries(results)
      .map(([algo, data]) => ({ algo, value: data[metric] }))
      .sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value)
      .map(({ algo }) => algo);
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

  return (
    <div className="row gy-4">
      {Object.entries({
        avgWaitingTime: { lowerIsBetter: true },
        avgTurnaroundTime: { lowerIsBetter: true },
        avgResponseTime: { lowerIsBetter: true },
        cpuThroughput: { lowerIsBetter: false },
        cpuUtilization: { lowerIsBetter: false },
        totalTime: { lowerIsBetter: true }
      }).map(([metric, { lowerIsBetter }]) => {
        const rankings = calculateRankings(comparisonResults, metric, lowerIsBetter);
        const sortedAlgos = sortAlgorithmsByMetric(comparisonResults, metric, lowerIsBetter);
        const { bestValue, worstValue } = getBestAndWorstValues(comparisonResults, metric, lowerIsBetter);

        return (
          <div key={metric} className="col-12">
            <div className="border rounded p-3">
              <h4 className="h6 fw-bold mb-3 text-capitalize">
                {getMetricDisplayName(metric)}
              </h4>

              <div className="row row-cols-1 row-cols-md-3 g-3">
                {sortedAlgos.map((algo, index) => {
                  const value = parseFloat(comparisonResults[algo][metric]);
                  const isBest = Math.abs(value - bestValue) < 0.001;
                  const isWorst = Math.abs(value - worstValue) < 0.001;

                  return (
                    <div
                      key={algo}
                      className={`card border 
                        ${isBest ? 'border-success bg-success bg-opacity-10' : ''}
                        ${isWorst ? 'border-danger bg-danger bg-opacity-10' : ''}
                        ${!isBest && !isWorst ? 'border-secondary bg-light' : ''}
                      `}
                    >
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <span className="badge bg-light text-dark me-2 fs-6">
                            {index + 1}
                          </span>
                          <span className="fw-semibold text-capitalize">
                            {algo.replace('-', ' ')}
                          </span>
                        </div>
                        <span className={`fw-bold ${
                          isBest ? 'text-success' :
                          isWorst ? 'text-danger' : 'text-muted'
                        }`}>
                          {formatMetricValue(metric, value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceMetricsComparison; 