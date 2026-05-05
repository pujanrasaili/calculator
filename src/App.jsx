import { useState, useEffect } from "react";
import "./App.css";

const basicButtons = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

const sciButtons = [
  ["sin", "cos", "tan", "√"],
  ["log", "ln", "x²", "xʸ"],
  ["π", "e", "(", ")"],
];

const THEMES = ["dark", "light", "neon"];
const TABS = ["Calculator", "Currency"];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "NPR"];

export default function App() {
  const [tab, setTab] = useState("Calculator");

  // Calculator state
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSci, setShowSci] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [expression, setExpression] = useState("");

  // Currency state
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("NPR");
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      setRates(data.rates);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      setRates(null);
    }
    setLoading(false);
  };

  const convert = () => {
    if (!rates || !amount) return "—";
    const amt = parseFloat(amount);
    if (isNaN(amt)) return "—";
    const inUSD = amt / rates[from];
    return (inUSD * rates[to]).toFixed(4);
  };

  const swap = () => { setFrom(to); setTo(from); };

  // Calculator logic
  const calculate = (a, b, operator) => {
    switch (operator) {
      case "÷": return b === 0 ? "Error" : a / b;
      case "×": return a * b;
      case "−": return a - b;
      case "+": return a + b;
      case "xʸ": return Math.pow(a, b);
      default: return b;
    }
  };

  const handleBtn = (val) => {
    if (val === "C") { setDisplay("0"); setPrev(null); setOp(null); setFresh(true); setExpression(""); return; }
    if (val === "⌫") { if (fresh) return; setDisplay((d) => d.length > 1 ? d.slice(0, -1) : "0"); return; }
    if (val === "±") { setDisplay((d) => String(parseFloat(d) * -1)); return; }
    if (val === "%") { setDisplay((d) => String(parseFloat(d) / 100)); return; }
    if (val === "π") { setDisplay(String(Math.PI.toFixed(8))); setFresh(true); return; }
    if (val === "e") { setDisplay(String(Math.E.toFixed(8))); setFresh(true); return; }
    if (val === "x²") { const r = parseFloat(display) ** 2; setHistory((h) => [`${display}² = ${r}`, ...h].slice(0, 20)); setDisplay(String(r)); setFresh(true); return; }
    if (val === "√") { const r = parseFloat(Math.sqrt(parseFloat(display)).toFixed(10)); setHistory((h) => [`√${display} = ${r}`, ...h].slice(0, 20)); setDisplay(String(r)); setFresh(true); return; }
    if (val === "sin") { const r = parseFloat(Math.sin(parseFloat(display) * Math.PI / 180).toFixed(10)); setHistory((h) => [`sin(${display}°) = ${r}`, ...h].slice(0, 20)); setDisplay(String(r)); setFresh(true); return; }
    if (val === "cos") { const r = parseFloat(Math.cos(parseFloat(display) * Math.PI / 180).toFixed(10)); setHistory((h) => [`cos(${display}°) = ${r}`, ...h].slice(0, 20)); setDisplay(String(r)); setFresh(true); return; }
    if (val === "tan") { const r = parseFloat(Math.tan(parseFloat(display) * Math.PI / 180).toFixed(10)); setHistory((h) => [`tan(${display}°) = ${r}`, ...h].slice(0, 20)); setDisplay(String(r)); setFresh(true); return; }
    if (val === "log") { const r = parseFloat(Math.log10(parseFloat(display)).toFixed(10)); setHistory((h) => [`log(${display}) = ${r}`, ...h].slice(0, 20)); setDisplay(String(r)); setFresh(true); return; }
    if (val === "ln") { const r = parseFloat(Math.log(parseFloat(display)).toFixed(10)); setHistory((h) => [`ln(${display}) = ${r}`, ...h].slice(0, 20)); setDisplay(String(r)); setFresh(true); return; }
    if (["÷", "×", "−", "+", "xʸ"].includes(val)) { setExpression(`${display} ${val}`); setPrev(parseFloat(display)); setOp(val); setFresh(true); return; }
    if (val === "=") {
      if (op && prev !== null) {
        const result = calculate(prev, parseFloat(display), op);
        const entry = `${prev} ${op} ${display} = ${parseFloat(result.toFixed(10))}`;
        setHistory((h) => [entry, ...h].slice(0, 20));
        setExpression("");
        setDisplay(String(parseFloat(result.toFixed(10))));
        setPrev(null); setOp(null); setFresh(true);
      }
      return;
    }
    if (val === ".") { if (fresh) { setDisplay("0."); setFresh(false); return; } if (!display.includes(".")) setDisplay((d) => d + "."); return; }
    if (fresh) { setDisplay(val); setFresh(false); }
    else setDisplay((d) => (d === "0" ? val : d + val));
  };

  useEffect(() => {
    const keyMap = { "0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",".":".","+":"+","-":"−","*":"×","/":"÷","Enter":"=","Escape":"C","Backspace":"⌫","%":"%" };
    const handler = (e) => { if (tab === "Calculator" && keyMap[e.key]) handleBtn(keyMap[e.key]); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [display, prev, op, fresh, tab]);

  const isOp = (v) => ["÷", "×", "−", "+", "xʸ"].includes(v);
  const nextTheme = () => setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);

  return (
    <div className={`app theme-${theme}`}>
      <div className="calc">

        {/* TABS */}
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === "Calculator" && <>
          <div className="display">
            <div className="top-bar">
              <div className="left-controls">
                <button className="ctrl-btn" onClick={nextTheme} title="Switch theme">🎨</button>
                <button className={`ctrl-btn ${showSci ? "active" : ""}`} onClick={() => setShowSci(s => !s)}>sci</button>
              </div>
              <div className="right-controls">
                <button className={`ctrl-btn ${showHistory ? "active" : ""}`} onClick={() => setShowHistory(s => !s)}>⏱</button>
              </div>
            </div>
            <div className="expression">{expression || " "}</div>
            <div className="number">{display}</div>
          </div>

          {showHistory && (
            <div className="history-panel">
              <div className="history-header">
                <span>Recent Calculations</span>
                {history.length > 0 && <button className="clear-history" onClick={() => setHistory([])}>Clear</button>}
              </div>
              {history.length === 0 ? <div className="history-empty">No calculations yet</div>
                : <ul className="history-list">{history.map((h, i) => <li key={i} className="history-item">{h}</li>)}</ul>}
            </div>
          )}

          {showSci && (
            <div className="sci-panel">
              {sciButtons.map((row, i) => (
                <div key={i} className="row">
                  {row.map((btn) => <button key={btn} className="btn sci" onClick={() => handleBtn(btn)}>{btn}</button>)}
                </div>
              ))}
            </div>
          )}

          <div className="buttons">
            {basicButtons.map((row, i) => (
              <div key={i} className="row">
                {row.map((btn) => (
                  <button key={btn}
                    className={`btn ${btn === "0" ? "zero" : ""} ${isOp(btn) ? "operator" : ""} ${btn === "=" ? "equals" : ""} ${["C","⌫","%"].includes(btn) ? "top" : ""} ${btn === "⌫" ? "backspace" : ""}`}
                    onClick={() => handleBtn(btn)}>{btn}</button>
                ))}
              </div>
            ))}
          </div>
          <div className="keyboard-hint">⌨️ Keyboard & Backspace supported</div>
        </>}

        {tab === "Currency" && (
          <div className="currency-panel">
            <div className="currency-header">
              <h2>💱 Currency Converter</h2>
              {lastUpdated && <span className="rate-updated">Updated: {lastUpdated}</span>}
            </div>

            {loading ? (
              <div className="currency-loading">⏳ Fetching live rates...</div>
            ) : !rates ? (
              <div className="currency-error">
                ❌ Could not fetch rates.<br />
                <button className="retry-btn" onClick={fetchRates}>Retry</button>
              </div>
            ) : (
              <>
                <div className="currency-input-group">
                  <label>Amount</label>
                  <input
                    className="currency-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="currency-selects">
                  <div className="select-group">
                    <label>From</label>
                    <select className="currency-select" value={from} onChange={(e) => setFrom(e.target.value)}>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <button className="swap-btn" onClick={swap}>⇄</button>

                  <div className="select-group">
                    <label>To</label>
                    <select className="currency-select" value={to} onChange={(e) => setTo(e.target.value)}>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="currency-result">
                  <div className="result-from">{amount || 0} {from}</div>
                  <div className="result-equals">=</div>
                  <div className="result-to">{convert()} {to}</div>
                </div>

                <div className="rate-info">
                  1 {from} = {rates ? (rates[to] / rates[from]).toFixed(4) : "—"} {to}
                </div>

                <button className="retry-btn" onClick={fetchRates}>🔄 Refresh Rates</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}