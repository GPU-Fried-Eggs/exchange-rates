import './App.css';
import {useState} from "react";

function LegacyApp() {
    const API = "https://api.exchangerate.host/latest";

    const [eur, setEur] = useState(0);
    const [gbp, setGbp] = useState(0);
    const [rate, setRate] = useState(0);

    async function convert(e) {
        e.preventDefault();
        try {
            const response = await fetch(API);
            if (response.ok) {
                const json = await response.json();
                setRate(json.rates.GBP);
                setGbp(eur * json.rates.GBP);
            } else {
                alert("No data receive");
            }
        } catch (err) { alert(err); }
    }

    return (
        <div className="App">
            <form onSubmit={convert}>
                <div>
                    <label>Eur</label>
                    <input type="number" step="0.01" value={eur} onChange={e => setEur(e.target.value)}/>
                    <output>{rate}</output>
                </div>
                <div>
                    <label>Gbp</label>
                    <output>{gbp.toFixed(2)} €</output>
                </div>
                <div>
                    <button>Calculate</button>
                </div>
            </form>
        </div>
    );
}
