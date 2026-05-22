import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_LOCATION_API || 'http://localhost:4010';

export default function LocationIntelligencePanel({ onFused }) {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [areaCodes, setAreaCodes] = useState({});
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [ip, setIp] = useState('');
  const [ipResult, setIpResult] = useState(null);
  const [gps, setGps] = useState(null);
  const [fused, setFused] = useState(null);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/location/countries`).then((r) => r.json()).then(setCountries);
  }, []);

  useEffect(() => {
    if (!country) return;
    fetch(`${API}/api/location/regions/${country}`).then((r) => r.json()).then(setRegions);
    fetch(`${API}/api/location/area-codes/${country}`).then((r) => r.json()).then(setAreaCodes);
  }, [country]);

  const captureGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setGps({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: new Date(pos.timestamp).toISOString()
      });
    });
  };

  const lookupIp = async () => {
    if (!ip) return;
    const r = await fetch(`${API}/api/location/ip/${ip}`).then((r) => r.json());
    setIpResult(r);
  };

  const fuse = async () => {
    const body = {
      gps,
      ip: ipResult,
      userSelected: { country, region, areaCode }
    };
    const r = await fetch(`${API}/api/location/fuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then((r) => r.json());
    setFused(r.fused);
    setSources(r.sources);
    if (onFused) onFused(r.fused);
  };

  return (
    <div className="location-intelligence-panel">
      <h2>Location Intelligence</h2>

      <div className="row">
        <label>Country</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">Select…</option>
          {countries.map((c) => (
            <option key={c.iso2} value={c.iso2}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="row">
        <label>Region</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">Select…</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="row">
        <label>Area Code</label>
        <select value={areaCode} onChange={(e) => setAreaCode(e.target.value)}>
          <option value="">Select…</option>
          {Object.keys(areaCodes).map((code) => (
            <option key={code} value={code}>
              {code} — {areaCodes[code].city}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <label>IP Address</label>
        <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="IPv4 or IPv6" />
        <button onClick={lookupIp}>Lookup IP</button>
        {ipResult && (
          <small>
            {ipResult.city}, {ipResult.country} — {ipResult.isp}
          </small>
        )}
      </div>

      <div className="row">
        <button onClick={captureGPS}>Capture GPS</button>
        {gps && (
          <small>
            {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)} (±{gps.accuracy}m)
          </small>
        )}
      </div>

      <button className="primary" onClick={fuse}>Fuse Location</button>

      {fused && (
        <div className="fused-result">
          <h3>Unified Location</h3>
          <p>
            <strong>{fused.city || fused.region || fused.country}</strong><br />
            Source: {fused.source} · Confidence: {(fused.confidence * 100).toFixed(0)}%<br />
            {fused.latitude}, {fused.longitude}
          </p>

          <h4>Source Confidence</h4>
          <ul>
            {sources.map((s) => (
              <li key={s.source}>
                {s.source}: {(s.confidence * 100).toFixed(0)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
