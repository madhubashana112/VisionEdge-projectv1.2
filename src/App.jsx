import { useState, useEffect } from 'react';
import { 
  Droplet, FlaskConical, Thermometer, Waves, Activity, BarChart2, Map, 
  MapPin, TrendingDown, TrendingUp, Leaf, Search, Info, Sun, Moon, User, Bell, Download, CloudRain, SunMedium, Cloud, Brain, Clock, Calculator, Plus, LogOut, CheckCircle, Camera, ShieldAlert, DollarSign, Bug, Image as ImageIcon
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { translations } from './translations';

const genAI = new GoogleGenerativeAI("AIzaSyAr-lQMWIpR42zPgQ_XFQaDtTvs4ogHwWI");

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar
} from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, useMapEvents } from 'react-leaflet';
import './index.css';

// Generating dummy 7 day history
const makeHistory = (baseM, baseT) => Array.from({length: 7}).map((_, i) => ({
  name: `Day ${i+1}`,
  moisture: baseM + Math.floor(Math.random() * 10 - 5),
  temp: baseT + Math.floor(Math.random() * 6 - 3),
  n: 150 + Math.floor(Math.random() * 20),
  p: 40 + Math.floor(Math.random() * 10),
  k: 60 + Math.floor(Math.random() * 10)
}));

const initialPoints = [
  { id: '1', name: "Polonnaruwa Paddy Fields", datetime: "Tuesday, March 31, 2026 at 8:15 AM", location: "7.9403, 81.0188", time: "08:15 AM", moisture: 82, temp: 28, ph: 6.5, salinity: 0.8, n: 160, p: 45, k: 50, history: makeHistory(82, 28) },
  { id: '2', name: "Nuwara Eliya Vegetable Estates", datetime: "Tuesday, March 31, 2026 at 8:25 AM", location: "6.9497, 80.7828", time: "08:25 AM", moisture: 75, temp: 16, ph: 5.5, salinity: 0.4, n: 140, p: 55, k: 70, history: makeHistory(75, 16) },
  { id: '3', name: "Anuradhapura Dry Zone Farming", datetime: "Tuesday, March 31, 2026 at 8:40 AM", location: "8.3114, 80.4037", time: "08:40 AM", moisture: 42, temp: 33, ph: 7.0, salinity: 1.2, n: 110, p: 30, k: 45, history: makeHistory(42, 33) },
  { id: '4', name: "Jaffna Peninsula Farms", datetime: "Tuesday, March 31, 2026 at 8:50 AM", location: "9.6615, 80.0255", time: "08:50 AM", moisture: 35, temp: 35, ph: 7.8, salinity: 3.2, n: 80, p: 20, k: 40, history: makeHistory(35, 35) },
  { id: '5', name: "Ampara Paddy Fields", datetime: "Tuesday, March 31, 2026 at 9:05 AM", location: "7.2912, 81.6724", time: "09:05 AM", moisture: 80, temp: 29, ph: 6.8, salinity: 0.9, n: 165, p: 40, k: 55, history: makeHistory(80, 29) },
  { id: '6', name: "Badulla Tea Plantations", datetime: "Tuesday, March 31, 2026 at 9:15 AM", location: "6.9926, 81.0550", time: "09:15 AM", moisture: 68, temp: 20, ph: 5.8, salinity: 0.5, n: 130, p: 50, k: 65, history: makeHistory(68, 20) },
  { id: '7', name: "Puttalam Coconut Estates", datetime: "Tuesday, March 31, 2026 at 9:30 AM", location: "8.0360, 79.8283", time: "09:30 AM", moisture: 40, temp: 32, ph: 7.2, salinity: 2.5, n: 100, p: 25, k: 80, history: makeHistory(40, 32) },
  { id: '8', name: "Matale Spice Gardens", datetime: "Tuesday, March 31, 2026 at 9:45 AM", location: "7.4665, 80.6234", time: "09:45 AM", moisture: 65, temp: 26, ph: 6.4, salinity: 0.7, n: 145, p: 40, k: 60, history: makeHistory(65, 26) }
];

const initialCropList = [
  { id: 'c1', name: 'rice', icon: '🌾', req: { m: 70, n: 160, ph: 6.5 } },
  { id: 'c2', name: 'wheat', icon: '🌾', req: { m: 50, n: 140, ph: 6.8 } },
  { id: 'c3', name: 'corn', icon: '🌽', req: { m: 60, n: 150, ph: 6.2 } },
  { id: 'c4', name: 'tomato', icon: '🍅', req: { m: 65, n: 130, ph: 6.0 } },
  { id: 'c5', name: 'potato', icon: '🥔', req: { m: 75, n: 140, ph: 5.5 } },
  { id: 'c6', name: 'soybean', icon: '🍃', req: { m: 55, n: 100, ph: 6.5 } },
  { id: 'c7', name: 'cotton', icon: '☁️', req: { m: 45, n: 120, ph: 7.0 } },
  { id: 'c8', name: 'carrot', icon: '🥕', req: { m: 60, n: 110, ph: 6.0 } },
  { id: 'c9', name: 'onion', icon: '🧅', req: { m: 50, n: 120, ph: 6.5 } },
  { id: 'c10', name: 'lettuce', icon: '🥬', req: { m: 80, n: 140, ph: 6.0 } },
];

const summaryData = {
  moisture: { value: 60.7, unit: '%', min: 35.0, max: 85.0, icon: <Droplet size={18} color="var(--accent-blue)" /> },
  ph: { value: 6.7, unit: '', min: 6.0, max: 7.5, icon: <FlaskConical size={18} color="#8b5cf6" /> },
  temp: { value: 27.5, unit: '°C', min: 21.0, max: 34.0, icon: <Thermometer size={18} color="var(--accent-red)" /> },
  salinity: { value: 1.9, unit: 'dS/m', min: 0.5, max: 3.8, icon: <Waves size={18} color="var(--accent-orange)" /> },
  npk: { n: 150, p: 30, k: 58, unit: 'mg/kg' }
};

const customIcon = new L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="map-pin-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const parseLocation = (loc) => loc.split(',').map(s => parseFloat(s.trim()));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [registeredUsers, setRegisteredUsers] = useState([{ username: 'madhubhashana', password: '1234' }]);
  const [lang, setLang] = useState('en');
  const [testPoints, setTestPoints] = useState(initialPoints);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPointId, setSelectedPointId] = useState(initialPoints[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [landSize, setLandSize] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  // Form input states
  const [loginUser, setLoginUser] = useState('madhubhashana');
  const [loginPass, setLoginPass] = useState('1234');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  
  const [crops, setCrops] = useState(initialCropList);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newCropIcon, setNewCropIcon] = useState('');
  const [reqM, setReqM] = useState(60);
  const [reqN, setReqN] = useState(120);
  const [reqPH, setReqPH] = useState(6.0);

  // Enterprise Features State
  const [marketPrice, setMarketPrice] = useState(200);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const point = testPoints.find(p => p.id === selectedPointId);
    if (!point || !point.location) return;
    const [lat, lng] = parseLocation(point.location);
    
    async function fetchWeather() {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        setWeatherData(data.current_weather);

        const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
        const locData = await locRes.json();
        const city = locData.address?.city || locData.address?.town || locData.address?.county || locData.address?.state || '';
        setLocationName(city);
      } catch (err) {
        console.error(err);
        setLocationName('');
      }
    }
    fetchWeather();
  }, [selectedPointId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setTestPoints(prevPoints => prevPoints.map(pt => ({
        ...pt,
        moisture: Math.max(0, Math.min(100, +(pt.moisture + (Math.random() * 0.4 - 0.2)).toFixed(1))),
        temp: Math.max(0, Math.min(50, +(pt.temp + (Math.random() * 0.2 - 0.1)).toFixed(1))),
        ph: Math.max(0, Math.min(14, +(pt.ph + (Math.random() * 0.04 - 0.02)).toFixed(2))),
        salinity: Math.max(0, +(pt.salinity + (Math.random() * 0.04 - 0.02)).toFixed(2))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const submitNewCrop = () => {
    if (!newCropName.trim()) return;
    const addedCrop = {
      id: "c" + Date.now(),
      name: newCropName,
      icon: newCropIcon || '🌱',
      req: { m: Number(reqM), n: Number(reqN), ph: Number(reqPH) }
    };
    setCrops([...crops, addedCrop]);
    setShowAddCropModal(false);
    setNewCropName('');
    setNewCropIcon('');
    setSearchQuery('');
  };

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const handleLogin = () => {
    setAuthError('');
    setAuthSuccess('');
    const foundUser = registeredUsers.find(u => u.username === loginUser && u.password === loginPass);
    if (foundUser) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Invalid username or password! / වැරදි පරිශීලක නාමයක් හෝ මුරපදයක්!');
    }
  };

  const handleRegister = () => {
    setAuthError('');
    setAuthSuccess('');
    if (!regUser || !regPass) {
      setAuthError('Please fill all fields! / කරුණාකර සියලු තොරතුරු ඇතුලත් කරන්න!');
      return;
    }
    if (regPass !== regPassConfirm) {
      setAuthError('Passwords do not match! / මුරපද ගැලපෙන්නේ නැත!');
      return;
    }
    if (registeredUsers.some(u => u.username === regUser)) {
      setAuthError('Username already exists! / මෙම පරිශීලක නාමය දැනටමත් ඇත!');
      return;
    }
    
    setRegisteredUsers([...registeredUsers, { username: regUser, password: regPass }]);
    setAuthSuccess('Registration successful! Please login. / ලියාපදිංචිය සාර්ථකයි! කරුණාකර ඇතුල්වන්න.');
    setAuthMode('login');
    setLoginUser(regUser);
    setLoginPass('');
    setRegUser('');
    setRegPass('');
    setRegPassConfirm('');
  };
  
  // Weather state
  const [weather, setWeather] = useState(null);
  
  // Alerts
  const [showAlerts, setShowAlerts] = useState(false);
  const alertsList = testPoints.filter(p => p.moisture < 40).map(p => ({
    id: p.id, msg: `Low Moisture (${p.moisture}%) in ${p.name}`
  }));

  const t = translations[lang];
  const selectedPoint = testPoints.find(p => p.id === selectedPointId) || testPoints[0];

  useEffect(() => {
    const fetchWeather = async () => {
      const [lat, lng] = parseLocation(selectedPoint.location);
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (e) {
        setWeather(null);
      }
    };
    fetchWeather();
  }, [selectedPoint.location]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const submitNewFarm = () => {
    if (!newFarmName.trim()) return;
    const baseM = 60 + Math.floor(Math.random() * 20);
    const baseT = 25 + Math.floor(Math.random() * 7);
    const newPoint = {
      id: Date.now().toString(),
      name: newFarmName,
      datetime: new Date().toLocaleString(),
      location: `${7.8731 + (Math.random()*2 - 1)}, ${80.7718 + (Math.random()*1 - 0.5)}`, // Random coordinates in SL
      time: new Date().toLocaleTimeString(),
      moisture: baseM,
      temp: baseT,
      ph: (5.5 + Math.random() * 2).toFixed(1),
      salinity: (1.0 + Math.random() * 2).toFixed(1),
      n: 120 + Math.floor(Math.random() * 60),
      p: 30 + Math.floor(Math.random() * 30),
      k: 40 + Math.floor(Math.random() * 40),
      history: makeHistory(baseM, baseT)
    };
    setTestPoints([...testPoints, newPoint]);
    setSelectedPointId(newPoint.id);
    setShowAddModal(false);
    setNewFarmName('');
    setActiveTab('map');
  };

  const calcFertilizer = () => {
    let cropN = selectedCrop ? selectedCrop.req.n : 160;
    let cropP = selectedCrop ? Math.round(selectedCrop.req.n * 0.3) : 50; 
    let cropK = selectedCrop ? Math.round(selectedCrop.req.n * 0.5) : 80;

    let defN = Math.max(0, cropN - selectedPoint.n) * 2;
    let defP = Math.max(0, cropP - selectedPoint.p) * 2;
    let defK = Math.max(0, cropK - selectedPoint.k) * 2;

    const hA = landSize * 0.4047;
    const urea = Math.round((defN / 0.46) * hA);
    const tsp = Math.round((defP / 0.46) * hA);
    const mop = Math.round((defK / 0.60) * hA);
    
    return { urea, tsp, mop };
  };
  const fertData = calcFertilizer();

  const calcYield = () => {
    // Predictive harvest target kg/Hectare (Rice standard)
    const base = 4000;
    const moistureBonus = (selectedPoint.moisture - 50) * 15;
    const npkBonus = (selectedPoint.n + selectedPoint.p + selectedPoint.k - 200) * 5;
    return Math.max(1000, Math.round(base + moistureBonus + npkBonus));
  };

  const calculateSuitability = (crop, point) => {
    let score = 100;
    const advice = [];
    const mDiff = point.moisture - crop.req.m;
    if (Math.abs(mDiff) > 10) { score -= 20; advice.push(mDiff < 0 ? 'increaseMoisture' : 'decreaseMoisture'); }
    const nDiff = point.n - crop.req.n;
    if (Math.abs(nDiff) > 20) { score -= 15; if (nDiff < 0) advice.push('increaseNitrogen'); }
    if (Math.abs(point.ph - crop.req.ph) > 0.5) { score -= 10; advice.push('adjustPH'); }
    return { score: Math.max(score, 0), advice };
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <Leaf size={64} color="var(--accent-green)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{t.loginTitle || "Smart Soil Dashboard"}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t.loginSubtitle || "Enterprise Agriculture Analysis"}</p>
          
          {authError && <div style={{color: 'white', background: 'var(--accent-red)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem'}}>{authError}</div>}
          {authSuccess && <div style={{color: 'white', background: 'var(--accent-green)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem'}}>{authSuccess}</div>}

          {authMode === 'login' ? (
            <>
              <input type="text" placeholder={t.username || "Username"} value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
              <input type="password" placeholder={t.password || "Password"} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
              <button onClick={handleLogin}>{t.signIn || "Sign In"}</button>
              <div style={{marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                New User? <span style={{color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => {setAuthMode('register'); setAuthError(''); setAuthSuccess('');}}>Create an account</span>
              </div>
            </>
          ) : (
            <>
              <input type="text" placeholder={t.username || "Username"} value={regUser} onChange={(e) => setRegUser(e.target.value)} />
              <input type="password" placeholder={t.password || "Password"} value={regPass} onChange={(e) => setRegPass(e.target.value)} />
              <input type="password" placeholder={"Confirm Password"} value={regPassConfirm} onChange={(e) => setRegPassConfirm(e.target.value)} />
              <button onClick={handleRegister}>Register (ලියාපදිංචි වන්න)</button>
              <div style={{marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                Already have an account? <span style={{color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => {setAuthMode('login'); setAuthError(''); setAuthSuccess('');}}>Login here</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);
    setAiResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64data = reader.result.split(',')[1];
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = 'You are an expert plant pathologist. Analyze this leaf. If it is healthy, say it\'s healthy. If there is a disease or pest, identify it. Reply ONLY with a strict JSON object: { "name": "Disease/Pest Name", "remedy": "A short 1-sentence agricultural remedy." }. No markdown, pure JSON.';
        const imageParts = [{ inlineData: { data: base64data, mimeType: file.type } }];
        
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        
        try {
          const cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
          const parsed = JSON.parse(cleanJson);
          setAiResult({ name: parsed.name, remedy: parsed.remedy });
        } catch (err) {
           setAiResult({ name: "Analysis Result Format Error", remedy: responseText });
        }
      } catch (err) {
        console.error(err);
        setAiResult({ name: "AI Connection Error", remedy: err.message || "Could not reach Gemini AI." });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Farm Name,Coordinates,Last Update,Moisture(%),pH,Temp(C),Salinity(dS/m),Nitrogen(mg/kg),Phosphorus(mg/kg),Potassium(mg/kg),Suitability Score\n";
    testPoints.forEach(row => {
      let scoreStr = "N/A";
      if (selectedCrop) {
         let info = calculateSuitability(selectedCrop, row);
         scoreStr = info.score + "%";
      }
      let rowArray = [
        row.id, 
        row.name, 
        `"${row.location}"`,
        `"${row.datetime}"`,
        row.moisture, 
        row.ph, 
        row.temp, 
        row.salinity, 
        row.n, 
        row.p, 
        row.k,
        scoreStr
      ];
      csvContent += rowArray.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smart_soil_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = [
    { subject: 'Moisture', A: selectedPoint.moisture, fullMark: 100 },
    { subject: 'pH', A: selectedPoint.ph * 10, fullMark: 100 },
    { subject: 'Temp', A: selectedPoint.temp, fullMark: 50 },
    { subject: 'Nitrogen', A: selectedPoint.n / 3, fullMark: 100 },
    { subject: 'Phosphorus', A: selectedPoint.p, fullMark: 100 },
    { subject: 'Potassium', A: selectedPoint.k, fullMark: 100 },
  ];

  return (
    <div className="app-container">
      <div className="report-header-print" style={{marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', width: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h1 style={{margin: '0 0 0.5rem 0', color: '#16a34a'}}>{t.officialReport || "Smart Soil Dashboard - Official Diagnostics Report"}</h1>
            <div style={{color: '#64748b', fontSize: '1.1rem'}}>{t.reportDate || "Report Date:"} {new Date().toLocaleString('en-US')}</div>
          </div>
          <div style={{textAlign: 'right', fontSize: '1rem', color: '#334155', lineHeight: '1.5'}}>
            <div><strong>Farm Area:</strong> {selectedPoint.name}</div>
            <div><strong>GPS Location:</strong> {selectedPoint.location}</div>
            <div><strong>System ID:</strong> #{selectedPoint.id.slice(-6)}</div>
          </div>
        </div>
        <div style={{marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', gap: '3rem', flexWrap: 'wrap'}}>
            <div><strong>Crop Analyzed:</strong> <span style={{color: 'var(--accent-green)', fontWeight: 'bold'}}>{selectedCrop ? t[selectedCrop.name] || selectedCrop.name : 'Generic Baseline Assessment'}</span></div>
            <div><strong>Land Size Assessed:</strong> {landSize} Acres ({(landSize * 0.4047).toFixed(2)} Hectares)</div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{margin: '0 0 1rem 0'}}>{t.addFarm || "Add New Farm"}</h2>
            <p style={{color: 'var(--text-secondary)'}}>{t.clickOnMap || "Provide a name for your new location to auto-generate coordinates & satellite insights."}</p>
            <input type="text" placeholder={t.farmName || "Farm Name"} value={newFarmName} onChange={(e) => setNewFarmName(e.target.value)} autoFocus />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>{t.cancel || "Cancel"}</button>
              <button className="btn-primary" onClick={submitNewFarm}>{t.saveFarm || "Save Location"}</button>
            </div>
          </div>
        </div>
      )}

      {showAddCropModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{margin: '0 0 1rem 0'}}>{t.addCrop || "Add Custom Crop"}</h2>
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
               <input type="text" placeholder={t.cropName || "Crop Name"} value={newCropName} onChange={(e) => setNewCropName(e.target.value)} style={{flex: 1}} autoFocus />
               <input type="text" placeholder={t.cropIcon || "Icon (Emoji)"} value={newCropIcon} onChange={(e) => setNewCropIcon(e.target.value)} style={{width: '120px'}} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem'}}>
               <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t.idealMoisture || "Target Moisture (%)"}:</label>
               <input type="number" value={reqM} onChange={(e) => setReqM(e.target.value)} />
               
               <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t.idealNitrogen || "Target Nitrogen (mg/kg)"}:</label>
               <input type="number" value={reqN} onChange={(e) => setReqN(e.target.value)} />
               
               <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t.idealPH || "Target pH"}:</label>
               <input type="number" step="0.1" value={reqPH} onChange={(e) => setReqPH(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddCropModal(false)}>{t.cancel || "Cancel"}</button>
              <button className="btn-primary" onClick={submitNewCrop}>{t.saveCrop || "Save Crop"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header" style={{ marginBottom: '1.5rem' }}>
        <div className="logo-section">
          <div className="logo-box"><Leaf size={28} /></div>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <h1 style={{margin: 0}}>{t.appTitle}</h1>
              <span className="live-badge print-hide"><div className="pulse-dot"></div> {t.liveStream || "LIVE"}</span>
            </div>
            <div className="header-subtitle">{t.appSubtitle}</div>
          </div>
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          
          <div style={{position: 'relative'}}>
            <button className="alert-btn" onClick={() => setShowAlerts(!showAlerts)}>
              <Bell size={18} /> <span className="print-hide">{t.alerts}</span>
              {alertsList.length > 0 && <div className="alert-badge">{alertsList.length}</div>}
            </button>
            {showAlerts && (
              <div className="alert-dropdown">
                <h4 style={{margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between'}}>
                  {t.alerts} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer'}} onClick={() => setShowAlerts(false)}>✖</span>
                </h4>
                {alertsList.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>{t.noAlerts}</p> : 
                  alertsList.map((a, i) => (
                    <div key={i} style={{padding: '0.5rem', background: 'var(--accent-red)', color: 'white', borderRadius: 4, marginBottom: '0.5rem', fontSize: '0.85rem'}}>
                      <b>{t.criticalAlert}:</b> {a.msg}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <button className="lang-toggle print-hide" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <select 
            className="lang-toggle print-hide" 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            style={{ cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
          <button className="lang-toggle print-hide" onClick={() => setIsAuthenticated(false)} style={{border: 'none', color: 'var(--accent-red)'}}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Top Stats */}
      <div className="top-stats-container print-hide">
        <h2 className="top-stats-title">{t.fieldWideStats}</h2>
        <div className="main-stats-grid">
          <Card title={t.avgMoisture} value={summaryData.moisture.value} unit={summaryData.moisture.unit} icon={summaryData.moisture.icon} min={summaryData.moisture.min} max={summaryData.moisture.max} t={t} />
          <Card title={t.avgPH} value={summaryData.ph.value} unit={summaryData.ph.unit} icon={summaryData.ph.icon} min={summaryData.ph.min} max={summaryData.ph.max} t={t} />
          <Card title={t.avgTemp} value={summaryData.temp.value} unit={summaryData.temp.unit} icon={summaryData.temp.icon} min={summaryData.temp.min} max={summaryData.temp.max} t={t} />
          <Card title={t.avgSalinity} value={summaryData.salinity.value} unit={summaryData.salinity.unit} icon={summaryData.salinity.icon} min={summaryData.salinity.min} max={summaryData.salinity.max} t={t} />
        </div>
        <div className="sub-stats-grid">
          <SmallCard title={t.avgNitrogen} value={summaryData.npk.n} unit={summaryData.npk.unit} />
          <SmallCard title={t.avgPhosphorus} value={summaryData.npk.p} unit={summaryData.npk.unit} />
          <SmallCard title={t.avgPotassium} value={summaryData.npk.k} unit={summaryData.npk.unit} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Activity size={18} /> {t.overview}</button>
        <button className={`tab-btn ${activeTab === 'crop' ? 'active' : ''}`} onClick={() => setActiveTab('crop')}><Leaf size={18} /> {t.cropAnalysis}</button>
        <button className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}><BarChart2 size={18} /> {t.dataCharts}</button>
        <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}><Map size={18} /> {t.fieldMap}</button>
        <button className={`tab-btn ${activeTab === 'pest' ? 'active' : ''}`} onClick={() => setActiveTab('pest')}><Bug size={18} /> {t.pestTab || "Pest AI"}</button>
      </div>

      {/* Split View */}
      <div className="bottom-split">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
             <h3 className="points-header" style={{margin:0}}>{t.testPoints}</h3>
             <button className="lang-toggle" style={{padding: '0.4rem', display: 'flex'}} onClick={() => setShowAddModal(true)}>
               <Plus size={16} />
             </button>
          </div>
          
          <div className="points-list">
            {testPoints.map(p => (
              <div key={p.id} className={`point-card ${selectedPointId === p.id ? 'active' : ''}`} onClick={() => { setSelectedPointId(p.id); setSelectedCrop(null); }}>
                <div className="point-header-row">
                  <div>
                    <h4 className="point-title">{p.name}</h4>
                  </div>
                  <div className="point-location"><MapPin size={12} /></div>
                </div>
                
                <div className="point-mini-stats">
                  <div className="mi-stat"><div className="mi-icon-box" style={{color: 'var(--accent-blue)'}}><Droplet size={12} /></div> {p.moisture}%</div>
                  <div className="mi-stat"><div className="mi-icon-box" style={{color: 'var(--accent-orange)'}}><Thermometer size={12} /></div> {p.temp}°C</div>
                  <div className="mi-stat"><div className="mi-icon-box" style={{color: 'var(--accent-purple)'}}><FlaskConical size={12} /></div> {p.ph}</div>
                  <div className="mi-stat"><div className="mi-icon-box" style={{color: 'var(--accent-orange)'}}><Waves size={12} /></div> {p.salinity}</div>
                </div>
                <div className="npk-mini-row">
                  <span>N <span className="np-val">{p.n}</span></span>
                  <span>P <span className="np-val">{p.p}</span></span>
                  <span>K <span className="np-val">{p.k}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="main-content">
          
          {activeTab === 'overview' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <h3 className="panel-title">{selectedPoint.name}</h3>
                  <p className="panel-subtitle">
                    {t.liveStream || "Live Data Stream:"} • {currentTime.toLocaleString(lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-US', { dateStyle: 'full', timeStyle: 'medium' })}
                  </p>
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button className="lang-toggle print-hide" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-green)', color: 'white'}} onClick={exportToCSV}>
                    <Download size={16} /> {t.exportCsv || "Export CSV"}
                  </button>
                  <button className="lang-toggle print-hide" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-primary)'}} onClick={() => window.print()}>
                    <Download size={16} /> {t.downloadReport || "Download"}
                  </button>
                </div>
              </div>

              {/* Yield & Profit Card */}
              <div className="yield-card print-hide" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
                   <div>
                      <h3 style={{margin: '0 0 0.5rem 0', fontWeight: 500}}><CheckCircle size={18} style={{marginRight: '0.5rem', verticalAlign:'middle'}}/>{t.predictedYield || "Predicted Yield Target"}</h3>
                      <div style={{opacity: 0.9, fontSize: '0.9rem'}}>{t.basedOnCur || "Based on current soil health"}</div>
                   </div>
                   <div style={{textAlign: 'right'}}>
                     <span className="yield-val" style={{fontSize: '1.8rem'}}>{calcYield()}</span> <span style={{fontSize: '0.9rem'}}>{t.kgPerHectare || "kg/Hectare"}</span>
                   </div>
                 </div>
                 
                 <div style={{background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                      <DollarSign size={16} color="var(--accent-green)"/>
                      <label style={{fontSize: '0.9rem'}}>{t.marketPrice || "Market Price (per kg)"}:</label>
                      <input type="number" value={marketPrice} onChange={(e) => setMarketPrice(Number(e.target.value) || 0)} style={{width: '80px', padding: '0.3rem', fontSize: '0.9rem'}}/> Rs.
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                      <div style={{fontSize: '0.9rem'}}>{t.estimatedProfit || "Estimated Gross Profit"}:</div>
                      <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)'}}>
                        Rs. {Math.round(calcYield() * (landSize * 0.4047) * marketPrice).toLocaleString()}
                      </div>
                    </div>
                 </div>
              </div>

              {/* Weather Card */}
              {weatherData && (
                <div className="weather-card print-hide">
                  <div>
                    <h3>{t.weatherForecast || "Live Weather"}</h3>
                    <div style={{opacity: 0.8, fontSize: '0.85rem'}}>{locationName || selectedPoint.location}</div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div className="weather-temp">{weatherData.temperature}°C</div>
                    {weatherData.weathercode < 3 ? <SunMedium size={48} /> : weatherData.weathercode < 60 ? <Cloud size={48} /> : <CloudRain size={48} />}
                  </div>
                </div>
              )}

              {/* Smart Irrigation Panel */}
              <div className="smart-panel print-hide">
                 <h3 style={{margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px'}}><Activity size={18}/> {t.smartIrrigation || "Smart Irrigation"}</h3>
                 <div className="pump-switch">
                    <div>
                        <div style={{fontWeight: 'bold'}}>{t.pumpStatus || "Pump Status"}</div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{t.autoMode || "Auto"}</div>
                    </div>
                    <div>
                        {selectedPoint.moisture < 45 ? (
                           <div style={{padding: '6px 12px', background: 'rgba(59,130,246,0.2)', color: 'var(--accent-blue)', borderRadius: '20px', fontWeight: 'bold', border: '1px solid var(--accent-blue)', animation: 'pulse 2s infinite'}}>{t.pumpOn || "PUMPING WATER"}</div>
                        ) : (
                           <div style={{padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', borderRadius: '20px', fontWeight: 'bold'}}>{t.pumpOff || "STANDBY"}</div>
                        )}
                    </div>
                 </div>
              </div>
              
              <div className="overview-grid">
                <div className="ov-card">
                  <div className="ov-label">{t.soilMoisture}</div>
                  <div className="ov-value ov-val-blue">{selectedPoint.moisture}%</div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.phLevel}</div>
                  <div className="ov-value ov-val-purple">{selectedPoint.ph}</div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.temp}</div>
                  <div className="ov-value ov-val-orange">{selectedPoint.temp}°C</div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.elecCond || "Salinity (EC)"}</div>
                  <div className="ov-value ov-val-gray">{selectedPoint.salinity} <span style={{fontSize: '0.8rem', fontWeight: 500}}>dS/m</span></div>
                </div>
              </div>
              
              <div className="overview-grid">
                <div className="ov-card">
                  <div className="ov-label">{t.nitrogen}</div>
                  <div className="ov-value ov-val-green">{selectedPoint.n} <span style={{fontSize: '0.8rem', fontWeight: 500}}>mg/kg</span></div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.phosphorus}</div>
                  <div className="ov-value ov-val-purple">{selectedPoint.p} <span style={{fontSize: '0.8rem', fontWeight: 500}}>mg/kg</span></div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.potassium}</div>
                  <div className="ov-value ov-val-orange">{selectedPoint.k} <span style={{fontSize: '0.8rem', fontWeight: 500}}>mg/kg</span></div>
                </div>
              </div>

              {/* Fertilizer Calculator */}
              <div className="calc-panel print-hide">
                 <div className="calc-header">
                   <Calculator size={18} /> {t.fertilizerCalc || "Fertilizer Calculator"}
                 </div>
                 <div className="calc-input-row">
                   <label>{t.landSize || "Land Size (Acres)"}:</label>
                   <input type="number" min="0.5" step="0.5" value={landSize} onChange={(e) => setLandSize(Number(e.target.value) || 0)} />
                 </div>
                 <div className="calc-results">
                    <div className="calc-res-box">
                       <div className="ov-label">{t.ureaNeeded || "Urea"}</div>
                       <div className="calc-res-val ov-val-green">{fertData.urea}</div>
                       <div className="card-unit">{t.kg || "kg"}</div>
                    </div>
                    <div className="calc-res-box">
                       <div className="ov-label">{t.tspNeeded || "TSP"}</div>
                       <div className="calc-res-val ov-val-purple">{fertData.tsp}</div>
                       <div className="card-unit">{t.kg || "kg"}</div>
                    </div>
                    <div className="calc-res-box">
                       <div className="ov-label">{t.mopNeeded || "MOP"}</div>
                       <div className="calc-res-val ov-val-orange">{fertData.mop}</div>
                       <div className="card-unit">{t.kg || "kg"}</div>
                    </div>
                 </div>
              </div>

            </div>
          )}

          {activeTab === 'crop' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 className="panel-title">{t.selectIntendedCrop}</h3>
                <button className="btn-primary" onClick={() => setShowAddCropModal(true)} style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <Plus size={16} /> {t.addCrop || "Add Custom Crop"}
                </button>
              </div>
              <div className="search-box">
                <Search size={16} />
                <input type="text" placeholder={t.searchCrops} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              
              <div className="crop-grid">
                {crops.filter(c => (t[c.name] || c.name).toLowerCase().includes(searchQuery.toLowerCase())).map(crop => (
                  <div key={crop.id} className="crop-card" onClick={() => setSelectedCrop(crop)} style={selectedCrop?.id === crop.id ? {background: 'var(--accent-green-light)', borderColor: 'var(--accent-green)'} : {}}>
                    <span className="crop-icon">{crop.icon}</span>
                    <span className="crop-name">{t[crop.name] || crop.name}</span>
                  </div>
                ))}
              </div>

              {!selectedCrop ? (
                <div className="empty-state">
                  <Leaf size={48} />
                  <h3>{t.selectCropToAnalyze}</h3>
                  <p>{t.getPersonalizedRecs}</p>
                </div>
              ) : (() => {
                const suit = calculateSuitability(selectedCrop, selectedPoint);
                return (
                  <div>
                    <h3 style={{margin: '0 0 1rem 0'}}>{t.matchScore}: {t[selectedCrop.name] || selectedCrop.name}</h3>
                    <div style={{fontSize: '2rem', fontWeight: 'bold', color: suit.score > 70 ? 'var(--accent-green)' : 'var(--accent-orange)'}}>{suit.score}%</div>
                    <div className="match-score-bar-bg">
                       <div className="match-score-bar-fill" style={{ width: `${suit.score}%`, background: suit.score > 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}></div>
                    </div>
                    
                    <div className="ai-advice-box">
                      <h4><Brain size={18} /> {t.aiAdvice}</h4>
                      {suit.advice.length === 0 ? (
                        <p style={{margin: 0}}>{t.perfectMatch}</p>
                      ) : (
                        <>
                          <p style={{marginTop: 0}}>{t.needsImprovement}</p>
                          <ul>
                            {suit.advice.map((adv, idx) => <li key={idx}>{t[adv] || adv}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'charts' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h3 className="panel-title" style={{margin: 0}}>{selectedPoint.name}</h3>
                <button className="lang-toggle" onClick={() => setIsHistoryMode(!isHistoryMode)} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Clock size={16} /> {isHistoryMode ? t.allLocations : t.history7D}
                </button>
              </div>
              
              {isHistoryMode ? (
                <>
                  <div className="chart-container-box">
                    <div className="chart-box-title">{t.history7D} - {t.moisture} & {t.temp}</div>
                    <div style={{height: 250}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedPoint.history}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{fontSize: 10}} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="moisture" name={t.moisture + " (%)"} stroke="var(--accent-blue)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="temp" name={t.temp + " (°C)"} stroke="var(--accent-orange)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="chart-container-box" style={{height: 300, display: 'flex', justifyContent: 'center'}}>
                    <ResponsiveContainer width={400} height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Status" dataKey="A" stroke="var(--accent-green)" fill="var(--accent-green)" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-container-box">
                    <div className="chart-box-title">{t.moistureAndTemp} ({t.allLocations})</div>
                    <div style={{height: 200}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={testPoints}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{fontSize: 10}} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="moisture" name={t.moisture + " (%)"} stroke="var(--accent-blue)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="temp" name={t.temp + " (°C)"} stroke="var(--accent-orange)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-container-box" style={{marginBottom: 0}}>
                    <div className="chart-box-title">{t.npkComparison}</div>
                    <div style={{height: 200}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={testPoints}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{fontSize: 10}} />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="n" name="N" fill="var(--accent-green)" />
                          <Bar dataKey="p" name="P" fill="var(--accent-purple)" />
                          <Bar dataKey="k" name="K" fill="var(--accent-orange)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div>
              <h3 className="panel-title">{t.fieldMapView}</h3>
              
              <div className="map-container">
                <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: 'inherit', zIndex: 1 }}>
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name={t.streetView || "Street Map"}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name={t.satelliteView || "Satellite Map"}>
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri'
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>

                  <LocationButton t={t} />
                  <MapAutoPan selectedPoint={selectedPoint} />
                  {testPoints.map(p => (
                    <Marker key={p.id} position={parseLocation(p.location)} icon={customIcon}>
                      <Popup>
                        <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{p.name}</div>
                        <div style={{color: 'var(--text-secondary)'}}>{p.time}</div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <p className="map-caption print-hide">{t.clickOnMarkers}</p>
            </div>
          )}

          {activeTab === 'pest' && (
            <div>
              <h3 className="panel-title">{t.pestTab || "Pest & Disease AI"}</h3>
              <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>{t.pestTip || "Upload a clear photo of the leaf."}</p>
              
              {!uploadedImage ? (
                <div className="pest-upload-zone print-hide">
                  <label style={{cursor: 'pointer', display: 'block', width: '100%', height: '100%'}}>
                    <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleImageUpload} />
                    <Camera size={48} style={{margin: '0 auto 1rem auto', opacity: 0.5, color: 'var(--text-primary)'}} />
                    <h3 style={{margin: '0 0 0.5rem 0', fontWeight: 500}}>{t.dropImageHere || "Drag & Drop or Click to Upload"}</h3>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>JPG, PNG (Max 5MB)</div>
                  </label>
                </div>
              ) : isAnalyzing ? (
                <div className="empty-state print-hide" style={{padding: '4rem 1rem'}}>
                  <div className="pulse-dot" style={{width: 24, height: 24, margin: '0 auto 1.5rem auto'}}></div>
                  <h3>{t.analyzingData || "AI Neural Network Analyzing..."}</h3>
                  <p>Processing visual patterns and spectral signatures...</p>
                </div>
              ) : (
                aiResult && (
                  <div style={{animation: 'fadeIn 0.5s ease'}}>
                     <div className="pest-upload-zone print-hide" style={{padding: '1.5rem', marginBottom: '1.5rem', borderStyle: 'solid', borderColor: 'var(--accent-green)', background: "transparent", cursor: 'default'}}>
                        <img src={uploadedImage} alt="Scanned Leaf" style={{width: '240px', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'}} />
                        <h4 style={{margin: 0, color: 'var(--accent-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
                           <CheckCircle size={20} /> {t.scanComplete || "Analysis Complete"}
                        </h4>
                     </div>

                     <div className="chart-container-box">
                        <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
                           <div style={{background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 8}}>
                             <ShieldAlert size={32} color="var(--accent-red)" />
                           </div>
                           <div>
                              <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text-primary)'}}>{t.diseaseDetected || "Detected: "} <span style={{color: 'var(--accent-orange)'}}>{aiResult.name}</span></h3>
                              <p style={{margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5}}>
                                <strong>{t.aiRemedy || "Remedy: "}</strong> {aiResult.remedy}
                              </p>
                           </div>
                        </div>
                     </div>
                     <button className="btn-secondary print-hide" onClick={() => {setUploadedImage(null); setAiResult(null);}}>Scan Another Leaf</button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapAutoPan({ selectedPoint }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPoint) {
      const loc = parseLocation(selectedPoint.location);
      map.flyTo(loc, 11, { animate: true, duration: 1.5 });
    }
  }, [selectedPoint, map]);
  return null;
}

function LocationButton({ t }) {
  const map = useMap();
  const [position, setPosition] = useState(null);

  const locateUser = (e) => {
    e.preventDefault();
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 14);
    }).on("locationerror", function (e) {
      alert("Could not access your location. Please check browser permissions: " + e.message);
    });
  };

  const userIcon = new L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="map-pin-icon-wrap" style="background: var(--accent-red)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  return (
    <>
      <button 
        className="lang-toggle print-hide" 
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(0,0,0,0.2)' }} 
        onClick={locateUser}
      >
        <MapPin size={16} /> {t.myLocation}
      </button>
      {position === null ? null : (
        <Marker position={position} icon={userIcon}>
          <Popup>
            <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{t.youAreHere}</div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

// Subcomponents
function Card({ title, value, unit, icon, min, max, t }) {
  return (
    <div className="stat-card">
      <div className="card-title-row">
        <span>{title}</span>
        {icon}
      </div>
      <div className="card-value">
        {value} <span className="card-unit">{unit}</span>
      </div>
      <div className="card-footer print-hide">
        <span className="val-min"><TrendingDown size={14} /> {t.min}: {min}{unit && unit.includes('C') ? '°C' : unit.includes('%') ? '%' : ''}</span>
        <span className="val-max"><TrendingUp size={14} /> {t.max}: {max}{unit && unit.includes('C') ? '°C' : unit.includes('%') ? '%' : ''}</span>
      </div>
    </div>
  );
}

function SmallCard({ title, value, unit }) {
  return (
    <div className="stat-card">
      <div className="card-title-row"><span>{title}</span></div>
      <div className="card-value">{value} <span className="card-unit">{unit}</span></div>
    </div>
  );
}

export default App;
