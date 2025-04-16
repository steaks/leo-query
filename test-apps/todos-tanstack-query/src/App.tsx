import React from "react";
import View from "./view";
import Create from "./create";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
      <img
        className="leo-logo"
        src="https://leoquery.com/leo-without-background.png"
        alt="Leo Logo"
      />
      <h1 className="header">TODO List</h1>
      <View />
      <Create />
      </div>
    </QueryClientProvider>
  );
}

export default App;
