import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import { useCallback, useEffect } from "react";
import "reactflow/dist/style.css";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./App.css";

function Flow() {
  const reactFlowInstance = useReactFlow();
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const getToTdata = async () => {
    const instance = axios.create({
      baseURL: "http://localhost:8080/chatgpt",
    });
    const resp = await instance.get();

    setNodes(resp.data.three.initialNodes);
    setEdges(resp.data.three.initialEdges);
    return resp.data.result;
  };

  const query = useQuery(["chatgpt"], getToTdata);

  return (
    <>
      <div>
        <h1>GPT TOT</h1>
        {query.isFetching ? (
          <h2>fetching...</h2>
        ) : (
          <h2>{`result : ${query.data.response} score: ${query.data.score}`}</h2>
        )}
        <button onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? "......" : "Fetch new data"}
        </button>
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            style={{ backgroundColor: "white" }}
          >
            <Background color="black" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </>
  );
}

export default App;
