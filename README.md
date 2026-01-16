# ✈️ Flight Route Planner with Algorithm Visualizer

An interactive React application that visualizes pathfinding algorithms (BFS and Uniform Cost Search) on a flight network. Perfect for understanding how algorithms work step-by-step through real-time animation! 

## 🎯 Features

### Algorithm Visualization
- **Breadth-First Search (BFS)** - Find routes with the fewest stops
- **Uniform Cost Search (UCS)** - Find cheapest or fastest routes
- Real-time step-by-step visualization of algorithm execution
- Interactive playback controls with adjustable speed

### Interactive UI
- **Flight Network Map** - Animated D3.js visualization of the airport graph
- **Live Status Updates** - See which airports are being explored at each step
- **Final Results** - Detailed metrics including:
  - Complete flight route path
  - Total travel time
  - Total cost
  - Number of stops

### Playback Controls
- ▶️ Play/Pause animation
- ⏮️ Previous step navigation
- ⏭️ Next step navigation
- ⏹️ Reset visualization
- Speed adjustment (Slow to Very Fast)

## 🏗️ Architecture

### Core Components

#### GraphVisualization Component
- Renders the flight network using D3.js
- Shows real-time node and edge highlighting
- Color-coded visualization: 
  - 🔴 **Red** - Currently exploring vertex
  - 🔵 **Blue** - Visited vertices
  - 🟡 **Yellow** - Vertices in queue
  - ⚫ **Gray** - Unvisited vertices

#### Graph Data Structure
- **Vertex Class** - Represents airports with connections
- **Edge Class** - Represents flights with time and price data
- **Waypoint Class** - Tracks path history during traversal
- **Graph Class** - Manages the network and implements algorithms

### Algorithm Implementation

#### BFS with Steps (Breadth-First Search)
```javascript
bfsWithSteps(start, destination)
