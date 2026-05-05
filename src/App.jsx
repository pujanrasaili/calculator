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
const TABS = ["Calc", "Currency", "Units", "Loan", "BMI"];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "NPR"];

export default function App() {
  const [tab, setTab] = useState("Calc");

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

  // Unit state
  const [unitType, setUnitType] = useState("Length");
  const [unitAmount, setUnitAmount] = useState("1");
  const [unitFrom, setUnitFrom] = useState("Kilometers");
  const [unitTo, setUnitTo] = useState("Miles");

  // Loan state
  const [loanAmount, setLoanAmount] = useState("100000");
  const [loanRate, setLoanRate] = useState("8.5");
  const [loanTenure, setLoanTenure] = useState("12");
  const [loanType, setLoanType] = useState("months");

  // BMI state
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiUnit, setBmiUnit] = useState("metric");

  const calcBMI = () => {
    const w = parseFloat(bmiWeight);
    const h = parseFloat(bmiHeight);
    if (!w || !h) return null;
    let bmi;
    if (bmiUnit === "metric") {
      bmi = w / ((h / 100) ** 2);
    } else {
      bmi = (703 * w) / (h ** 2);
    }
    bmi = parseFloat(bmi.toFixed(1));
    let category, color, emoji;
    if (bmi < 18.5) { category = "Underweight"; color = "#00b4d8"; emoji = "😟"; }
    else if (bmi < 25) { category = "Normal Weight"; color = "#2dc653"; emoji = "😊"; }
    else if (bmi < 30) { category = "Overweight"; color = "#f4a261"; emoji = "😐"; }
    else { category = "Obese"; color = "#e74c3c"; emoji = "😟"; }
    return { bmi, category, color, emoji };
  };

  const bmiResult = calcBMI();

  const calcEMI = () => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(loanRate) / 100 / 12;
    const n = loanType === "years" ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);
    if (!P || !r || !n) return null;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    return { emi: emi.toFixed(2), total: total.toFixed(2), interest: interest.toFixed(2), months: n };
  };

  const emiResult = calcEMI();

  const unitOptions = {
    Length: ["Kilometers", "Miles", "Meters", "Feet", "Inches", "Centimeters"],
    Weight: ["Kilograms", "Pounds", "Grams", "Ounces", "Tonnes"],
    Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  };

  const convertUnit = () => {
    const val = parseFloat(unitAmount);
    if (isNaN(val)) return "—";
    if (unitFrom === unitTo) return val.toFixed(4);
    const key = `${unitFrom}-${unitTo}`;
    const c = {
      "Kilometers-Miles": v => v * 0.621371, "Miles-Kilometers": v => v * 1.60934,
      "Kilometers-Meters": v => v * 1000, "Meters-Kilometers": v => v / 1000,
      "Meters-Feet": v => v * 3.28084, "Feet-Meters": v => v / 3.28084,
      "Feet-Inches": v => v * 12, "Inches-Feet": v => v / 12,
      "Kilometers-Feet": v => v * 3280.84, "Feet-Kilometers": v => v / 3280.84,
      "Meters-Inches": v => v * 39.3701, "Inches-Meters": v => v / 39.3701,
      "Miles-Meters": v => v * 1609.34, "Meters-Miles": v => v / 1609.34,
      "Miles-Feet": v => v * 5280, "Feet-Miles": v => v / 5280,
      "Kilometers-Centimeters": v => v * 100000, "Centimeters-Kilometers": v => v / 100000,
      "Meters-Centimeters": v => v * 100, "Centimeters-Meters": v => v / 100,
      "Centimeters-Inches": v => v / 2.54, "Inches-Centimeters": v => v * 2.54,
      "Centimeters-Feet": v => v / 30.48, "Feet-Centimeters": v => v * 30.48,
      "Miles-Centimeters": v => v * 160934, "Centimeters-Miles": v => v / 160934,
      "Miles-Inches": v => v * 63360, "Inches-Miles": v => v / 63360,
      "Kilograms-Pounds": v => v * 2.20462, "Pounds-Kilograms": v => v / 2.20462,
      "Kilograms-Grams": v => v * 1000, "Grams-Kilograms": v => v / 1000,
      "Kilograms-Ounces": v => v * 35.274, "Ounces-Kilograms": v => v / 35.274,
      "Kilograms-Tonnes": v => v / 1000, "Tonnes-Kilograms": v => v * 1000,
      "Pounds-Grams": v => v * 453.592, "Grams-Pounds": v => v / 453.592,
      "Pounds-Ounces": v => v * 16, "Ounces-Pounds": v => v / 16,
      "Grams-Ounces": v => v / 28.3495, "Ounces-Grams": v => v * 28.3495,
      "Tonnes-Pounds": v => v * 2204.62, "Pounds-Tonnes": v => v / 2204.62,
      "Celsius-Fahrenheit": v => v * 9/5 + 32, "Fahrenheit-Celsius": v => (v - 32) * 5/9,
      "Celsius-Kelvin": v => v + 273.15, "Kelvin-Celsius": v => v - 273.15,
      "Fahrenheit-Kelvin": v => (v - 32) * 5/9 + 273.15, "Kelvin-Fahrenheit": v => (v - 273.15) * 9/5 + 32,
    };
    const fn = c[key];
    return fn ? parseFloat(fn(val).toFixed(4)) : "—";
  };

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      setRates(data.rates);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) { setRates(null); }
    setLoading(false);
  };

  const convert = () => {
    if (!rates || !amount) return "—";
    const amt = parseFloat(amount);
    if (isNaN(amt)) return "—";
    return ((amt / rates[from]) * rates[to]).toFixed(4);
  };

  const swap = () => { setFrom(to); setTo(from); };

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
    const handler = (e) => { if (tab === "Calc" && keyMap[e.key]) handleBtn(keyMap[e.key]); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [display, prev, op, fresh, tab]);

  const isOp = (v) => ["÷", "×", "−", "+", "xʸ"].includes(v);
  const nextTheme = () => setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);

  return (
    <div className={`app theme-${theme}`}>
      <div className="calc">

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === "Calc" && <>
          <div className="display">
            <div className="top-bar">
              <div className="left-controls">
                <button className="ctrl-btn" onClick={nextTheme}>🎨</button>
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
            {loading ? <div className="currency-loading">⏳ Fetching live rates...</div>
              : !rates ? (
                <div className="currency-error">❌ Could not fetch rates.<br />
                  <button className="retry-btn" onClick={fetchRates}>Retry</button>
                </div>
              ) : (<>
                <div className="currency-input-group">
                  <label>Amount</label>
                  <input className="currency-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
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
                <div className="rate-info">1 {from} = {rates ? (rates[to] / rates[from]).toFixed(4) : "—"} {to}</div>
                <button className="retry-btn" onClick={fetchRates}>🔄 Refresh Rates</button>
              </>)}
          </div>
        )}

        {tab === "Units" && (
          <div className="currency-panel">
            <div className="currency-header">
              <h2>📏 Unit Converter</h2>
            </div>
            <div className="unit-type-row">
              {["Length", "Weight", "Temperature"].map((t) => (
                <button key={t} className={`unit-type-btn ${unitType === t ? "active" : ""}`}
                  onClick={() => { setUnitType(t); setUnitFrom(unitOptions[t][0]); setUnitTo(unitOptions[t][1]); setUnitAmount("1"); }}>
                  {t === "Length" ? "📐" : t === "Weight" ? "⚖️" : "🌡️"} {t}
                </button>
              ))}
            </div>
            <div className="currency-input-group" style={{ marginTop: "1rem" }}>
              <label>Amount</label>
              <input className="currency-input" type="number" value={unitAmount} onChange={(e) => setUnitAmount(e.target.value)} placeholder="Enter value" />
            </div>
            <div className="currency-selects">
              <div className="select-group">
                <label>From</label>
                <select className="currency-select" value={unitFrom} onChange={(e) => setUnitFrom(e.target.value)}>
                  {unitOptions[unitType].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <button className="swap-btn" onClick={() => { setUnitFrom(unitTo); setUnitTo(unitFrom); }}>⇄</button>
              <div className="select-group">
                <label>To</label>
                <select className="currency-select" value={unitTo} onChange={(e) => setUnitTo(e.target.value)}>
                  {unitOptions[unitType].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="currency-result">
              <div className="result-from">{unitAmount || 0} {unitFrom}</div>
              <div className="result-equals">=</div>
              <div className="result-to">{convertUnit()} {unitTo}</div>
            </div>
          </div>
        )}

        {tab === "Loan" && (
          <div className="currency-panel">
            <div className="currency-header">
              <h2>💰 Loan / EMI Calculator</h2>
            </div>
            <div className="currency-input-group">
              <label>Loan Amount</label>
              <input className="currency-input" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="e.g. 100000" />
            </div>
            <div className="currency-input-group">
              <label>Annual Interest Rate (%)</label>
              <input className="currency-input" type="number" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} placeholder="e.g. 8.5" />
            </div>
            <div className="currency-input-group">
              <label>Loan Tenure</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input className="currency-input" type="number" value={loanTenure} onChange={(e) => setLoanTenure(e.target.value)} placeholder="e.g. 12" style={{ flex: 1 }} />
                <select className="currency-select" value={loanType} onChange={(e) => setLoanType(e.target.value)} style={{ width: "110px" }}>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
            {emiResult ? (
              <div className="emi-results">
                <div className="emi-card main">
                  <div className="emi-label">Monthly EMI</div>
                  <div className="emi-value">{Number(emiResult.emi).toLocaleString()}</div>
                </div>
                <div className="emi-row">
                  <div className="emi-card">
                    <div className="emi-label">Total Amount</div>
                    <div className="emi-value sm">{Number(emiResult.total).toLocaleString()}</div>
                  </div>
                  <div className="emi-card">
                    <div className="emi-label">Total Interest</div>
                    <div className="emi-value sm interest">{Number(emiResult.interest).toLocaleString()}</div>
                  </div>
                </div>
                <div className="emi-bar-wrap">
                  <div className="emi-bar-label">
                    <span>Principal</span>
                    <span>Interest</span>
                  </div>
                  <div className="emi-bar">
                    <div className="emi-bar-principal" style={{ width: `${(parseFloat(loanAmount) / parseFloat(emiResult.total)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ) : <div className="currency-loading">Fill in all fields to calculate</div>}
          </div>
        )}

        {tab === "BMI" && (
          <div className="currency-panel">
            <div className="currency-header">
              <h2>🏋️ BMI Calculator</h2>
            </div>

            <div className="unit-type-row">
              <button className={`unit-type-btn ${bmiUnit === "metric" ? "active" : ""}`} onClick={() => { setBmiUnit("metric"); setBmiWeight(""); setBmiHeight(""); }}>
                📐 Metric (kg/cm)
              </button>
              <button className={`unit-type-btn ${bmiUnit === "imperial" ? "active" : ""}`} onClick={() => { setBmiUnit("imperial"); setBmiWeight(""); setBmiHeight(""); }}>
                🇺🇸 Imperial (lb/in)
              </button>
            </div>

            <div className="currency-input-group" style={{ marginTop: "1rem" }}>
              <label>Weight ({bmiUnit === "metric" ? "kg" : "lbs"})</label>
              <input className="currency-input" type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} placeholder={bmiUnit === "metric" ? "e.g. 70" : "e.g. 154"} />
            </div>

            <div className="currency-input-group">
              <label>Height ({bmiUnit === "metric" ? "cm" : "inches"})</label>
              <input className="currency-input" type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} placeholder={bmiUnit === "metric" ? "e.g. 175" : "e.g. 69"} />
            </div>

            {bmiResult ? (
              <div className="bmi-results">
                <div className="bmi-score-card" style={{ borderColor: bmiResult.color }}>
                  <div className="bmi-emoji">{bmiResult.emoji}</div>
                  <div className="bmi-score" style={{ color: bmiResult.color }}>{bmiResult.bmi}</div>
                  <div className="bmi-category" style={{ color: bmiResult.color }}>{bmiResult.category}</div>
                </div>
                <div className="bmi-scale">
                  <div className="bmi-scale-item" style={{ color: "#00b4d8" }}>
                    <span>Underweight</span><span>&lt; 18.5</span>
                  </div>
                  <div className="bmi-scale-item" style={{ color: "#2dc653" }}>
                    <span>Normal</span><span>18.5 – 24.9</span>
                  </div>
                  <div className="bmi-scale-item" style={{ color: "#f4a261" }}>
                    <span>Overweight</span><span>25 – 29.9</span>
                  </div>
                  <div className="bmi-scale-item" style={{ color: "#e74c3c" }}>
                    <span>Obese</span><span>≥ 30</span>
                  </div>
                </div>
                <div className="bmi-bar-wrap">
                  <div className="bmi-bar">
                    <div className="bmi-bar-fill" style={{
                      width: `${Math.min((bmiResult.bmi / 40) * 100, 100)}%`,
                      background: bmiResult.color
                    }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="currency-loading">Enter weight & height to calculate</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}