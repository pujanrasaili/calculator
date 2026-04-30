import { useState } from "react";
import "./App.css";

const buttons = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

export default function App() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const calculate = (a, b, operator) => {
    switch (operator) {
      case "÷": return b === 0 ? "Error" : a / b;
      case "×": return a * b;
      case "−": return a - b;
      case "+": return a + b;
      default: return b;
    }
  };

  const handleBtn = (val) => {
    if (val === "C") {
      setDisplay("0"); setPrev(null); setOp(null); setFresh(true); return;
    }
    if (val === "±") {
      setDisplay((d) => String(parseFloat(d) * -1)); return;
    }
    if (val === "%") {
      setDisplay((d) => String(parseFloat(d) / 100)); return;
    }
    if (["÷", "×", "−", "+"].includes(val)) {
      setPrev(parseFloat(display)); setOp(val); setFresh(true); return;
    }
    if (val === "=") {
      if (op && prev !== null) {
        const result = calculate(prev, parseFloat(display), op);
        setDisplay(String(parseFloat(result.toFixed(10))));
        setPrev(null); setOp(null); setFresh(true);
      }
      return;
    }
    if (val === ".") {
      if (fresh) { setDisplay("0."); setFresh(false); return; }
      if (!display.includes(".")) setDisplay((d) => d + ".");
      return;
    }
    if (fresh) { setDisplay(val); setFresh(false); }
    else setDisplay((d) => (d === "0" ? val : d + val));
  };

  const isOp = (v) => ["÷", "×", "−", "+"].includes(v);

  return (
    <div className="app">
      <div className="calc">
        <div className="display">
          <div className="op-indicator">{op || ""}</div>
          <div className="number">{display}</div>
        </div>
        <div className="buttons">
          {buttons.map((row, i) => (
            <div key={i} className="row">
              {row.map((btn) => (
                <button
                  key={btn}
                  className={`btn ${btn === "0" ? "zero" : ""} ${isOp(btn) ? "operator" : ""} ${btn === "=" ? "equals" : ""} ${btn === "C" || btn === "±" || btn === "%" ? "top" : ""}`}
                  onClick={() => handleBtn(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}