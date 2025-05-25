import React from 'react';
import GanttChartComponent from '../GanttChartComponent';

const ExecutionTimelineComparison = ({ comparisonResults }) => {
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

  return (
    <div className="row gy-4">
      {calculateOverallRankings(comparisonResults).map(({ algo }) => (
        <div key={algo} className="col-12 col-md-6 col-lg-4">
          <div className="border rounded p-3 h-100">
            <h4 className="h6 text-capitalize mb-3">{algo.replace('-', ' ')}</h4>
            <GanttChartComponent schedule={comparisonResults[algo].steps} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExecutionTimelineComparison; 