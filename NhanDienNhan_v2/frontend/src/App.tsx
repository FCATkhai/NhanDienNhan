import { useState } from "react";
import run from "./agent/agent";
import "./App.css";

function App() {
  run();
  return (
    <>
      <div>
        <h1>Nhận diện nhãn thuốc</h1>
      </div>
    </>
  );
}

export default App;
