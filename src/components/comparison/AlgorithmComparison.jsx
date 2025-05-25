import React from 'react';
import PerformanceMetricsVisualization from './PerformanceMetricsVisualization';
import PerformanceMetricsComparison from './PerformanceMetricsComparison';
import OverallPerformanceSummary from './OverallPerformanceSummary';
import ExecutionTimelineComparison from './ExecutionTimelineComparison';

const AlgorithmComparison = ({ comparisonResults }) => {
  if (Object.keys(comparisonResults).length === 0) {
    return (
      <div className="text-center text-secondary fst-italic">
        Add processes and click "Compare Algorithms" to see the comparison results
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center fw-semibold mb-4 text-secondary">
        Algorithm Comparison
      </h2>

      {/* Performance Metrics Charts */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">
          <h3 className="h5 mb-0">Performance Metrics Visualization</h3>
        </div>
        <div className="card-body">
          <PerformanceMetricsVisualization comparisonResults={comparisonResults} />
        </div>
      </div>

      {/* Performance Metrics Comparison */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">
          <h3 className="h5 mb-0">Performance Metrics Comparison</h3>
        </div>
        <div className="card-body">
          <PerformanceMetricsComparison comparisonResults={comparisonResults} />
        </div>
      </div>

      {/* Overall Performance Summary */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">
          <h3 className="h5 mb-0">Overall Performance Summary</h3>
        </div>
        <div className="card-body">
          <OverallPerformanceSummary comparisonResults={comparisonResults} />
        </div>
      </div>

      {/* Gantt Charts */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">
          <h3 className="h5 mb-0">Execution Timeline Comparison</h3>
        </div>
        <div className="card-body">
          <ExecutionTimelineComparison comparisonResults={comparisonResults} />
        </div>
      </div>
    </div>
  );
};

export default AlgorithmComparison; 