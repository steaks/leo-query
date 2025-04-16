import React, { Suspense } from "react";
import View from "./view";
import Create from "./create";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <img
        className="leo-logo"
        src="https://leoquery.com/leo-without-background.png"
        alt="Leo Logo"
      />
      <h1 className="header">TODO List</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <View />
      </Suspense>
      <Create />
    </div>
  );
}

export default App;
