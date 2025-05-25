import React from 'react';
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

const PerformanceMetricsVisualization = ({ comparisonResults }) => {
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
    <div className="row">
      {/* Bar Charts for Individual Metrics */}
      <div className="col-12 mb-4">
        <div className="row">
          {/* Time-based Metrics */}
          {['avgWaitingTime', 'avgTurnaroundTime', 'avgResponseTime'].map(metric => (
            <div key={metric} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <Bar 
                    data={prepareChartData(comparisonResults, metric)} 
                    options={{
                      ...barOptions,
                      plugins: {
                        ...barOptions.plugins,
                        title: {
                          display: true,
                          text: getMetricDisplayName(metric)
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CPU Performance Metrics */}
      <div className="col-12 mb-4">
        <div className="row">
          {['cpuUtilization', 'cpuThroughput', 'totalTime'].map(metric => (
            <div key={metric} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <Bar 
                    data={prepareChartData(comparisonResults, metric)} 
                    options={{
                      ...barOptions,
                      plugins: {
                        ...barOptions.plugins,
                        title: {
                          display: true,
                          text: getMetricDisplayName(metric)
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return metric === 'cpuUtilization' ? value + '%' : value;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Chart for Overall Comparison */}
      <div className="col-12">
        <div className="card">
          <div className="card-body d-flex justify-content-center align-items-center">
            <div style={{ 
              height: '600px', 
              width: '800px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Radar 
                data={prepareRadarData(comparisonResults)} 
                options={{
                  ...radarOptions,
                  maintainAspectRatio: true,
                  aspectRatio: 1.3,
                  responsive: true
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsVisualization; 