import './App.css';
import Select from "react-select";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

const apiUrl = new URL("https://api.exchangerate.host");
const codes = ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTC", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLF", "CLP", "CNH", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STD", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XCD", "XDR", "XOF", "XPD", "XPF", "XPT", "YER", "ZAR", "ZMW", "ZWL"];
let timeRange = [Date.now() - (1000 * 60 * 60 * 24 * 15) /* half month*/, Date.now()], countries = [];

codes.forEach((value, index) => countries.push({"value": index, "label": value}));

const selectStyle = {
    container: provided => ({ ...provided, width: 130 }),
    control: (provided, state) => ({ ...provided, borderRadius: "0 4px 4px 0" })
}

function App() {
    const [base, setBase] = useState(1);
    const [baseName, setBaseName] = useState(countries[codes.indexOf("EUR")]);
    const [target, setTarget] = useState(0);
    const [targetName, setTargetName] = useState(countries[codes.indexOf("GBP")]);
    const [rate, setRate] = useState(0);
    const [chartData, setChartData] = useState([])

    async function convert(event) {
        event?.preventDefault();
        try {
            // update the latest date
            const responseLatest = await fetch(new URL("latest", apiUrl));
            if (responseLatest.ok) {
                const json = await responseLatest.json();
                const current = Date.parse(json["date"]);
                timeRange = [current - (1000 * 60 * 60 * 24 * 100 /* 100 day*/), current];
                const rate = json["rates"][targetName.label];
                setRate(rate);
                setTarget(base * rate);
            } else alert("Can not get latest data");
            // draw the graph consider do incremental fetch.
            const url = new URL("timeseries?", apiUrl), params = url.searchParams;
            let [start, end] = [new Date(timeRange[0]), new Date(timeRange[1])];
            params.set("start_date", `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`);
            params.set("end_date", `${end.getFullYear()}-${end.getMonth()}-${end.getDate()}`)
            params.set("base", baseName.label);
            params.set("symbols", targetName.label);
            const responseSeries = await fetch(url);
            if (responseSeries.ok) {
                const json = await responseSeries.json(), rawData = [];
                for (const [key, value] of Object.entries(json["rates"]))
                    rawData.push({
                        date: new Date(key).toLocaleDateString(navigator.language, { month: "short", day: "numeric" }),
                        rate: Object.values(value)[0]
                    });
                console.log(rawData);
                setChartData(rawData);
            } else alert("Can not get latest data");
        } catch(err) { alert(err); }
    }

    useEffect(() => {
        void async function() { await convert() }();
    // eslint-disable-next-line
    }, []);

    return (
      <div className="App">
        <form onSubmit={convert}>
          <label>Current exchange Rate: <output>{rate.toFixed(2)}</output></label>
          <div className="container">
            <input type="number" step="0.01" value={base} onChange={setBase}/>
            <Select styles={selectStyle} defaultValue={baseName} onChange={setBaseName} options={countries}/>
          </div>
          <div className="container">
            <output>{target.toFixed(2)}</output>
            <Select styles={selectStyle} defaultValue={targetName} onChange={setTargetName} options={countries}/>
          </div>
          <div className="container">
            <button type="submit">Calculate</button>
          </div>
        </form>
        <AreaChart width={300} height={200} data={chartData}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date"/>
          <YAxis type="number" domain={["auto", "auto"]}/>
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area type="monotone" dataKey="rate" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </div>
    );
}

export default App;
