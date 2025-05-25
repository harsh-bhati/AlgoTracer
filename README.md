# AlgoTracer - CPU Scheduling Algorithm Visualizer

AlgoTracer is a web-based visualization tool for CPU scheduling algorithms. It provides an interactive interface to simulate and compare different scheduling algorithms with detailed performance metrics and visualizations.

## Project Structure

```
src/
├── algorithms/         # Algorithm implementations
├── assets/            # Static assets (images, icons)
├── components/        # React components
│   ├── comparison/    # Comparison mode components
│   └── ...
├── context/          # React context providers
├── pages/            # Page components
└── styles/           # CSS styles
```

## Core Components

### Pages

- **JobSchedulingSimulator.jsx**: Main simulator page that manages the overall state and coordination between different components. Handles process scheduling simulation, real-time updates, and simulation controls.

### Components

#### Main Components
- **ProcessInputForm.jsx**: Form component for inputting process details (arrival time, burst time, priority)
- **LiveExecutionComponent.jsx**: Displays real-time execution of processes
- **GanttChartComponent.jsx**: Visualizes the scheduling timeline using Gantt charts
- **ResultsComponent.jsx**: Shows final statistics and metrics for the simulation

#### Comparison Components
Located in `components/comparison/`:

1. **AlgorithmComparison.jsx**
   - Main container for comparison mode
   - Orchestrates all comparison-related components
   - Handles empty state and layout structure

2. **PerformanceMetricsVisualization.jsx**
   - Displays various charts and graphs for performance metrics
   - Features:
     - Bar charts for individual metrics
     - Radar chart for overall comparison
     - Time-based metrics visualization
     - CPU performance metrics visualization

3. **PerformanceMetricsComparison.jsx**
   - Shows detailed comparison of metrics between algorithms
   - Features:
     - Metric-wise ranking of algorithms
     - Visual indicators for best/worst performers
     - Formatted metric values with appropriate units

4. **OverallPerformanceSummary.jsx**
   - Provides a comprehensive performance summary
   - Features:
     - Overall algorithm rankings
     - Performance icons and badges
     - Detailed scoring criteria explanation
     - Weighted scoring system

5. **ExecutionTimelineComparison.jsx**
   - Displays Gantt charts for all algorithms
   - Features:
     - Side-by-side comparison of execution timelines
     - Sorted by overall performance
     - Responsive grid layout

## Key Features

1. **Multiple Algorithm Support**
   - First Come First Serve (FCFS)
   - Shortest Job First (SJF)
   - Shortest Remaining Time First (SRTF)
   - Round Robin (RR)
   - Priority Scheduling
   - Preemptive Priority Scheduling

2. **Real-time Visualization**
   - Live process execution display
   - Interactive Gantt charts
   - Dynamic updates

3. **Performance Metrics**
   - Average Waiting Time
   - Average Turnaround Time
   - Average Response Time
   - CPU Utilization
   - CPU Throughput
   - Total Execution Time

4. **Comparison Mode**
   - Side-by-side algorithm comparison
   - Multiple visualization types
   - Comprehensive performance analysis
   - Weighted scoring system

## Technical Details

### Dependencies
- React.js for UI components
- Chart.js for data visualization
- Bootstrap for styling
- React-Chartjs-2 for React integration with Chart.js

### Performance Metrics Calculation
- Time-based metrics (70% weight)
  - Average Waiting Time (25%)
  - Average Turnaround Time (25%)
  - Average Response Time (20%)
- CPU Performance metrics (30% weight)
  - CPU Throughput (15%)
  - CPU Utilization (15%)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
