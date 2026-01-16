import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// =============================================================================
// ALGORITHM VISUALIZER - Shows step-by-step how algorithms work
// =============================================================================
// This enhancement demonstrates deep understanding of algorithms
// Perfect for technical interviews!
// =============================================================================

// =============================================================================
// GRAPH CLASSES
// =============================================================================

class Edge {
  constructor(from, to, time, price) {
    this.from = from;
    this.to = to;
    this.time = time;
    this.price = price;
  }
}

class Vertex {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.edges = [];
  }

  addEdge(edge) {
    this.edges.push(edge);
  }
}

class Waypoint {
  constructor(vertex, parent = null, cost = 0) {
    this.vertex = vertex;
    this.parent = parent;
    this.cost = cost;
  }

  getPath() {
    const path = [];
    let current = this;
    while (current !== null) {
      path.unshift(current.vertex);
      current = current.parent;
    }
    return path;
  }
}

class Graph {
  constructor() {
    this.vertices = [];
  }

  addVertex(vertex) {
    this.vertices.push(vertex);
  }

  addUndirectedEdge(x, y, time, price) {
    const edge1 = new Edge(x, y, time, price);
    x.addEdge(edge1);
    const edge2 = new Edge(y, x, time, price);
    y.addEdge(edge2);
  }

  getVertexByName(name) {
    return this.vertices.find(v => v.name === name);
  }

  // ========================================================================
  // INSTRUMENTED BFS - Returns step-by-step snapshots for visualization
  // ========================================================================
  bfsWithSteps(start, destination) {
    const steps = [];  // Array of snapshots showing algorithm progress
    const queue = [];
    const visited = new Set();
    const startWaypoint = new Waypoint(start, null, 0);
    queue.push(startWaypoint);
    visited.add(start.name);
    
    // Initial step
    steps.push({
      current: null,
      queue: [startWaypoint],
      visited: new Set([start.name]),
      exploring: new Set(),
      description: `Starting BFS from ${start.name}`
    });
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      // Step: Dequeue node
      steps.push({
        current: current.vertex,
        queue: [...queue],
        visited: new Set(visited),
        exploring: new Set([current.vertex.name]),
        description: `Visiting ${current.vertex.name}`
      });
      
      if (current.vertex === destination) {
        steps.push({
          current: current.vertex,
          queue: [...queue],
          visited: new Set(visited),
          exploring: new Set(),
          found: current,
          description: `✅ Found destination: ${destination.name}!`
        });
        return { steps, finalWaypoint: current };
      }
      
      const newNeighbors = [];
      for (let edge of current.vertex.edges) {
        const neighbor = edge.to;
        if (visited.has(neighbor.name)) continue;
        
        const neighborWaypoint = new Waypoint(neighbor, current, current.cost + 1);
        queue.push(neighborWaypoint);
        visited.add(neighbor.name);
        newNeighbors.push(neighbor.name);
      }
      
      // Step: After exploring neighbors
      if (newNeighbors.length > 0) {
        steps.push({
          current: current.vertex,
          queue: [...queue],
          visited: new Set(visited),
          exploring: new Set(),
          description: `Added ${newNeighbors.length} neighbors to queue: ${newNeighbors.join(', ')}`
        });
      }
    }
    
    steps.push({
      current: null,
      queue: [],
      visited: new Set(visited),
      exploring: new Set(),
      description: `❌ No path found from ${start.name} to ${destination.name}`
    });
    
    return { steps, finalWaypoint: null };
  }

  // ========================================================================
  // INSTRUMENTED UCS - Returns step-by-step snapshots for visualization
  // ========================================================================
  ucsWithSteps(start, destination, weightType = 'price') {
    const steps = [];
    const priorityQueue = [];
    const visited = new Set();
    const startWaypoint = new Waypoint(start, null, 0);
    priorityQueue.push(startWaypoint);
    
    steps.push({
      current: null,
      queue: [startWaypoint],
      visited: new Set(),
      exploring: new Set(),
      description: `Starting UCS (${weightType}) from ${start.name}`
    });
    
    while (priorityQueue.length > 0) {
      priorityQueue.sort((a, b) => a.cost - b.cost);
      const current = priorityQueue.shift();
      
      if (visited.has(current.vertex.name)) continue;
      visited.add(current.vertex.name);
      
      steps.push({
        current: current.vertex,
        queue: [...priorityQueue],
        visited: new Set(visited),
        exploring: new Set([current.vertex.name]),
        currentCost: current.cost,
        description: `Visiting ${current.vertex.name} (cost: ${current.cost})`
      });
      
      if (current.vertex === destination) {
        steps.push({
          current: current.vertex,
          queue: [...priorityQueue],
          visited: new Set(visited),
          exploring: new Set(),
          found: current,
          description: `✅ Found optimal path to ${destination.name}! Total cost: ${current.cost}`
        });
        return { steps, finalWaypoint: current };
      }
      
      const newNeighbors = [];
      for (let edge of current.vertex.edges) {
        const neighbor = edge.to;
        if (visited.has(neighbor.name)) continue;
        
        const edgeWeight = weightType === 'time' ? edge.time : edge.price;
        const neighborWaypoint = new Waypoint(neighbor, current, current.cost + edgeWeight);
        priorityQueue.push(neighborWaypoint);
        newNeighbors.push(`${neighbor.name}(${neighborWaypoint.cost})`);
      }
      
      if (newNeighbors.length > 0) {
        steps.push({
          current: current.vertex,
          queue: [...priorityQueue],
          visited: new Set(visited),
          exploring: new Set(),
          description: `Added to queue: ${newNeighbors.join(', ')}`
        });
      }
    }
    
    steps.push({
      current: null,
      queue: [],
      visited: new Set(visited),
      exploring: new Set(),
      description: `❌ No path found`
    });
    
    return { steps, finalWaypoint: null };
  }
}

function calculatePathMetrics(waypoint) {
  const path = waypoint.getPath();
  let totalTime = 0;
  let totalPrice = 0;
  let totalStops = path.length - 2;
  
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = from.edges.find(e => e.to === to);
    if (edge) {
      totalTime += edge.time;
      totalPrice += edge.price;
    }
  }
  
  return {
    path: path,
    pathString: path.map(v => v.name).join(' → '),
    time: totalTime,
    price: totalPrice,
    stops: totalStops
  };
}

// =============================================================================
// ANIMATED GRAPH VISUALIZATION COMPONENT
// =============================================================================
function GraphVisualization({ graph, currentStep, width = 700, height = 500 }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!graph) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f8f9fa')
      .style('border-radius', '12px');

    // Prepare nodes and links
    const nodes = graph.vertices.map(v => ({
      id: v.id,
      name: v.name,
      vertex: v
    }));

    const links = [];
    const addedEdges = new Set();
    
    for (let vertex of graph.vertices) {
      for (let edge of vertex.edges) {
        const key = [edge.from.id, edge.to.id].sort().join('-');
        if (!addedEdges.has(key)) {
          links.push({
            source: edge.from.id,
            target: edge.to.id,
            time: edge.time,
            price: edge.price
          });
          addedEdges.add(key);
        }
      }
    }

    // Position nodes with force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    simulation.tick(300);
    simulation.stop();

    // Draw edges
    const linkGroup = svg.append('g').attr('class', 'links');

    linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => nodes[d.source.id].x)
      .attr('y1', d => nodes[d.source.id].y)
      .attr('x2', d => nodes[d.target.id].x)
      .attr('y2', d => nodes[d.target.id].y)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Draw nodes with colors based on algorithm state
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Function to get node color based on current step
    function getNodeColor(node) {
      if (!currentStep) return '#4CAF50';  // Default green
      
      // Currently being explored (red)
      if (currentStep.exploring && currentStep.exploring.has(node.name)) {
        return '#FF6B6B';
      }
      
      // Already visited (blue)
      if (currentStep.visited && currentStep.visited.has(node.name)) {
        return '#2196F3';
      }
      
      // In the queue/frontier (yellow)
      if (currentStep.queue && currentStep.queue.some(wp => wp.vertex.name === node.name)) {
        return '#FFC107';
      }
      
      // Unvisited (gray)
      return '#9E9E9E';
    }

    // Draw circles
    nodeElements.append('circle')
      .attr('r', 20)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer');

    // Add labels
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(d => d.name);

    // Highlight final path if found
    if (currentStep?.found) {
      const path = currentStep.found.getPath();
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        
        linkGroup.append('line')
          .attr('x1', nodes[from.id].x)
          .attr('y1', nodes[from.id].y)
          .attr('x2', nodes[to.id].x)
          .attr('y2', nodes[to.id].y)
          .attr('stroke', '#4CAF50')
          .attr('stroke-width', 5)
          .attr('opacity', 0.9);
      }
    }

  }, [graph, currentStep, width, height]);

  return <svg ref={svgRef}></svg>;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function FlightPlanner() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startAirport, setStartAirport] = useState('');
  const [destAirport, setDestAirport] = useState('');
  const [graph, setGraph] = useState(null);
  
  // Visualization state
  const [visualizing, setVisualizing] = useState(false);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds per step
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || currentStepIndex >= algorithmSteps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, algorithmSteps.length, speed]);

  async function loadData() {
    try {
      const airportResponse = await fetch('/data/airports.csv');
      const airportText = await airportResponse.text();
      const airportList = parseAirportsCSV(airportText);
      setAirports(airportList);
      
      const routeResponse = await fetch('/data/routes.csv');
      const routeText = await routeResponse.text();
      const routeList = parseRoutesCSV(routeText);
      
      const builtGraph = buildGraph(airportList, routeList);
      setGraph(builtGraph);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      setLoading(false);
    }
  }

  function parseAirportsCSV(text) {
    return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  }

  function parseRoutesCSV(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const routeArray = [];
    
    for (let line of lines) {
      const parts = line.split(',');
      if (parts.length === 4) {
        routeArray.push({
          from: parseInt(parts[0]),
          to: parseInt(parts[1]),
          time: parseInt(parts[2]),
          price: parseInt(parts[3])
        });
      }
    }
    return routeArray;
  }

  function buildGraph(airportList, routeList) {
    const g = new Graph();
    const vertexArray = [];
    
    for (let i = 0; i < airportList.length; i++) {
      const vertex = new Vertex(airportList[i], i);
      vertexArray.push(vertex);
      g.addVertex(vertex);
    }
    
    for (let route of routeList) {
      const fromVertex = vertexArray[route.from];
      const toVertex = vertexArray[route.to];
      g.addUndirectedEdge(fromVertex, toVertex, route.time, route.price);
    }
    
    return g;
  }

  function handleStartChange(e) {
    setStartAirport(e.target.value);
    resetVisualization();
  }

  function handleDestChange(e) {
    setDestAirport(e.target.value);
    resetVisualization();
  }

  function resetVisualization() {
    setVisualizing(false);
    setAlgorithmSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setFinalResult(null);
  }

  function visualizeBFS() {
    const start = graph.getVertexByName(startAirport);
    const dest = graph.getVertexByName(destAirport);
    
    const { steps, finalWaypoint } = graph.bfsWithSteps(start, dest);
    
    setAlgorithmSteps(steps);
    setCurrentStepIndex(0);
    setVisualizing(true);
    setIsPlaying(true);
    
    if (finalWaypoint) {
      setFinalResult(calculatePathMetrics(finalWaypoint));
    }
  }

  function visualizeUCS(weightType) {
    const start = graph.getVertexByName(startAirport);
    const dest = graph.getVertexByName(destAirport);
    
    const { steps, finalWaypoint } = graph.ucsWithSteps(start, dest, weightType);
    
    setAlgorithmSteps(steps);
    setCurrentStepIndex(0);
    setVisualizing(true);
    setIsPlaying(true);
    
    if (finalWaypoint) {
      setFinalResult(calculatePathMetrics(finalWaypoint));
    }
  }

  const isValid = startAirport && destAirport && startAirport !== destAirport;
  const currentStep = algorithmSteps[currentStepIndex];

  if (loading) {
    return (
      <div style={styles.container}>
        <h1>Flight Planner</h1>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1>Flight Planner</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>✈️ Flight Route Planner with Algorithm Visualizer</h1>
      <p style={styles.subtitle}>Watch algorithms work step-by-step!</p>

      {/* Graph Visualization */}
      <div style={styles.visualizationContainer}>
        <h3 style={styles.visualizationTitle}>🗺️ Flight Network Map</h3>
        <GraphVisualization 
          graph={graph} 
          currentStep={currentStep}
          width={700}
          height={500}
        />
        
        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: '#FF6B6B'}}></div>
            <span>Currently Exploring</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: '#2196F3'}}></div>
            <span>Visited</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: '#FFC107'}}></div>
            <span>In Queue</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: '#9E9E9E'}}></div>
            <span>Unvisited</span>
          </div>
        </div>

        {/* Algorithm Status */}
        {visualizing && currentStep && (
          <div style={styles.statusBox}>
            <div style={styles.statusText}>
              <strong>Step {currentStepIndex + 1} of {algorithmSteps.length}:</strong> {currentStep.description}
            </div>
            {currentStep.currentCost !== undefined && (
              <div style={styles.costDisplay}>Current Cost: {currentStep.currentCost}</div>
            )}
            {currentStep.queue && currentStep.queue.length > 0 && (
              <div style={styles.queueDisplay}>
                Queue size: {currentStep.queue.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>From:</label>
          <select 
            style={styles.select}
            value={startAirport}
            onChange={handleStartChange}
            disabled={isPlaying}
          >
            <option value="">-- Select departure --</option>
            {airports.map((airport, index) => (
              <option key={index} value={airport}>{airport}</option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>To:</label>
          <select 
            style={styles.select}
            value={destAirport}
            onChange={handleDestChange}
            disabled={isPlaying}
          >
            <option value="">-- Select destination --</option>
            {airports.map((airport, index) => (
              <option key={index} value={airport}>{airport}</option>
            ))}
          </select>
        </div>

        {startAirport && destAirport && startAirport === destAirport && (
          <p style={styles.errorText}>⚠️ Start and destination must be different!</p>
        )}

        {/* Algorithm Buttons */}
        <div style={styles.buttonGroup}>
          <button
            style={{...styles.button, ...styles.buttonBlue, ...(isValid ? {} : styles.buttonDisabled)}}
            onClick={() => visualizeUCS('price')}
            disabled={!isValid || isPlaying}
          >
            💰 Visualize Cheapest (UCS)
          </button>

          <button
            style={{...styles.button, ...styles.buttonGreen, ...(isValid ? {} : styles.buttonDisabled)}}
            onClick={() => visualizeUCS('time')}
            disabled={!isValid || isPlaying}
          >
            ⚡ Visualize Fastest (UCS)
          </button>

          <button
            style={{...styles.button, ...styles.buttonPurple, ...(isValid ? {} : styles.buttonDisabled)}}
            onClick={visualizeBFS}
            disabled={!isValid || isPlaying}
          >
            🎯 Visualize Fewest Stops (BFS)
          </button>
        </div>

        {/* Playback Controls */}
        {visualizing && (
          <div style={styles.playbackControls}>
            <button
              style={styles.controlButton}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            
            <button
              style={styles.controlButton}
              onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
            >
              ⏮️ Previous
            </button>
            
            <button
              style={styles.controlButton}
              onClick={() => setCurrentStepIndex(Math.min(algorithmSteps.length - 1, currentStepIndex + 1))}
              disabled={currentStepIndex >= algorithmSteps.length - 1}
            >
              ⏭️ Next
            </button>
            
            <button
              style={styles.controlButton}
              onClick={() => {
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
            >
              ⏹️ Reset
            </button>

            <div style={styles.speedControl}>
              <label style={{ fontSize: '14px', marginRight: '10px' }}>Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={styles.speedSelect}
              >
                <option value={2000}>Slow (2s)</option>
                <option value={1000}>Normal (1s)</option>
                <option value={500}>Fast (0.5s)</option>
                <option value={200}>Very Fast (0.2s)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Final Results */}
      {finalResult && currentStepIndex === algorithmSteps.length - 1 && (
        <div style={styles.resultsCard}>
          <h2 style={styles.resultsTitle}>✅ Algorithm Complete!</h2>
          <div style={styles.pathDisplay}>
            <h3 style={{ marginTop: 0, fontSize: '16px', color: '#666' }}>Final Route:</h3>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
              {finalResult.pathString}
            </p>
          </div>
          <div style={styles.metricsGrid}>
            <div style={styles.metricBox}>
              <div style={styles.metricLabel}>Total Time</div>
              <div style={styles.metricValue}>{finalResult.time}h</div>
            </div>
            <div style={styles.metricBox}>
              <div style={styles.metricLabel}>Total Price</div>
              <div style={styles.metricValue}>${finalResult.price}</div>
            </div>
            <div style={styles.metricBox}>
              <div style={styles.metricLabel}>Total Stops</div>
              <div style={styles.metricValue}>{finalResult.stops}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// STYLES
// =============================================================================
const styles = {
  container: {
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    maxWidth: '750px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  title: {
    color: '#1a1a1a',
    fontSize: '32px',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '30px',
  },
  visualizationContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  visualizationTitle: {
    margin: '0 0 15px 0',
    fontSize: '20px',
    color: '#333',
    textAlign: 'center',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '15px',
    fontSize: '13px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2px solid white',
  },
  statusBox: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    border: '2px solid #2196F3',
  },
  statusText: {
    fontSize: '14px',
    marginBottom: '8px',
  },
  costDisplay: {
    fontSize: '14px',
    color: '#2196F3',
    fontWeight: 'bold',
  },
  queueDisplay: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '14px',
    marginTop: '-10px',
    marginBottom: '15px',
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginTop: '25px',
  },
  button: {
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'white',
  },
  buttonBlue: {
    backgroundColor: '#2196F3',
  },
  buttonGreen: {
    backgroundColor: '#4CAF50',
  },
  buttonPurple: {
    backgroundColor: '#9C27B0',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  playbackControls: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #2196F3',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#2196F3',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  speedControl: {
    display: 'flex',
    alignItems: 'center',
  },
  speedSelect: {
    padding: '8px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resultsCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    marginBottom: '20px',
    border: '3px solid #4CAF50',
  },
  resultsTitle: {
    margin: '0 0 20px 0',
    fontSize: '24px',
    color: '#333',
    textAlign: 'center',
  },
  pathDisplay: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  metricBox: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default FlightPlanner;