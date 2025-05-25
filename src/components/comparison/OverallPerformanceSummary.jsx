import React from 'react';

const OverallPerformanceSummary = ({ comparisonResults }) => {
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

  return (
    <div className="row">
      {/* Ranked Cards */}
      <div className="col-md-8">
        <div className="list-group">
          {calculateOverallRankings(comparisonResults).map(({ algo, score, isBest, isWorst }, index) => (
            <div
              key={algo}
              className={`list-group-item d-flex align-items-center rounded mb-3 
                ${isBest ? 'bg-success bg-opacity-10 border-success' : ''}
                ${isWorst ? 'bg-danger bg-opacity-10 border-danger' : ''}
                ${!isBest && !isWorst ? 'bg-light border-secondary' : ''}
              `}
            >
              <div 
                className="badge bg-white text-dark me-3 rounded-circle border shadow-sm d-flex align-items-center justify-content-center" 
                style={{
                  width: '2.5rem', 
                  height: '2.5rem',
                  fontSize: '1.25rem'
                }}
              >
                {getPerformanceIcon(score, isBest, isWorst)}
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-1 text-capitalize">{algo.replace('-', ' ')}</h5>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Overall Score: {score.toFixed(2)}</small>
                  <span className={`badge ${
                    isBest ? 'bg-success' :
                    isWorst ? 'bg-danger' :
                    'bg-secondary'
                  }`}>
                    {isBest ? 'Best Performance' :
                     isWorst ? 'Needs Improvement' :
                     'Good Performance'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria Explanation */}
      <div className="col-md-4">
        <div className="card h-100 border-primary">
          <div className="card-header bg-primary text-white">
            <h4 className="h6 mb-0">Scoring Criteria</h4>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <h5 className="h6 text-primary mb-2">Time-based Metrics (70%)</h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <span className="fw-semibold">Average Waiting Time (25%)</span>
                  <br />
                  <small className="text-muted">Lower is better</small>
                </li>
                <li className="mb-2">
                  <span className="fw-semibold">Average Turnaround Time (25%)</span>
                  <br />
                  <small className="text-muted">Lower is better</small>
                </li>
                <li>
                  <span className="fw-semibold">Average Response Time (20%)</span>
                  <br />
                  <small className="text-muted">Lower is better</small>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="h6 text-primary mb-2">CPU Performance (30%)</h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <span className="fw-semibold">CPU Throughput (15%)</span>
                  <br />
                  <small className="text-muted">Higher is better</small>
                </li>
                <li>
                  <span className="fw-semibold">CPU Utilization (15%)</span>
                  <br />
                  <small className="text-muted">Higher is better</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallPerformanceSummary; 