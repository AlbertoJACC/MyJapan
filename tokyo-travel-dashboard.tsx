import React, { useState, useEffect } from 'react';
import { MapPin, Train, Utensils, ShoppingBag, AlertCircle, CheckCircle, Clock, Wifi, DollarSign, Camera, Book, Cloud, CloudRain, Sun, Calendar, TrendingUp, RefreshCw } from 'lucide-react';

const TokyoTravelDashboard = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [checklist, setChecklist] = useState({
    efectivo: false,
    toalla: false,
    bateria: false,
    bolsaBasura: false,
    pasaporte: false
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState({
    weather: true,
    exchange: true,
    events: true
  });
  const [eurAmount, setEurAmount] = useState(100);
  const [jpyAmount, setJpyAmount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchWeather();
    fetchExchangeRates();
    fetchEvents();
    
    // Actualizar cada 30 minutos
    const interval = setInterval(() => {
      fetchWeather();
      fetchExchangeRates();
      fetchEvents();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (exchangeRates) {
      setJpyAmount((eurAmount * exchangeRates.eurToJpy).toFixed(2));
    }
  }, [eurAmount, exchangeRates]);

  const fetchWeather = async () => {
    try {
      setLoading(prev => ({ ...prev, weather: true }));
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo&forecast_days=3');
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(prev => ({ ...prev, weather: false }));
    }
  };

  const fetchExchangeRates = async () => {
    try {
      setLoading(prev => ({ ...prev, exchange: true }));
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const data = await response.json();
      setExchangeRates({
        eurToJpy: data.rates.JPY,
        jpyToEur: 1 / data.rates.JPY,
        lastUpdate: new Date(data.time_last_updated)
      });
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(prev => ({ ...prev, exchange: false }));
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(prev => ({ ...prev, events: true }));
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{
            type: "web_search_20250305",
            name: "web_search"
          }],
          messages: [{
            role: "user",
            content: "Search for current events happening in Tokyo today or this week. Include festivals, exhibitions, concerts, and special cultural events. Give me a brief list with dates."
          }]
        })
      });
      
      const data = await response.json();
      
      if (data.content) {
        let eventText = "";
        for (const block of data.content) {
          if (block.type === "text") {
            eventText += block.text + " ";
          }
        }
        setEvents(eventText.trim());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents("No se pudieron cargar los eventos actuales. Intenta buscar en TimeOut Tokyo o Japan Guide.");
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-gray-400" />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return "Despejado";
    if (code === 1) return "Mayormente despejado";
    if (code === 2) return "Parcialmente nublado";
    if (code === 3) return "Nublado";
    if (code >= 51 && code <= 67) return "Lluvia";
    if (code >= 71 && code <= 77) return "Nieve";
    return "Variado";
  };

  const tokyoTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));

  const toggleCheckItem = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const tabs = [
    { id: 'inicio', label: '🏠 Inicio', icon: MapPin },
    { id: 'directo', label: '📊 Datos en Vivo', icon: TrendingUp },
    { id: 'transporte', label: '🚇 Transporte', icon: Train },
    { id: 'comida', label: '🍜 Comida', icon: Utensils },
    { id: 'otaku', label: '⛩️ Otaku', icon: ShoppingBag },
    { id: 'protocolo', label: '⚠️ Protocolo', icon: AlertCircle }
  ];

  const restaurantes = {
    shinjuku: [
      { nombre: 'Omoide Yokocho', tipo: 'Yakitori', precio: '¥¥', nota: 'Ambiente retro' },
      { nombre: 'Ramen Nagi', tipo: 'Ramen', precio: '¥¥', nota: 'Ramen de sardina intenso' }
    ],
    shibuya: [
      { nombre: 'Sushi no Midori', tipo: 'Sushi', precio: '¥¥', nota: 'Calidad-precio, suele haber cola' },
      { nombre: 'Uobei', tipo: 'Sushi', precio: '¥', nota: 'Sushi en "tren bala"' }
    ],
    akihabara: [
      { nombre: 'Kyushu Jangara Ramen', tipo: 'Ramen', precio: '¥¥', nota: 'Mejor tonkotsu de la zona' },
      { nombre: 'Tonkatsu Marugo', tipo: 'Tonkatsu', precio: '¥¥', nota: 'Cerdo empanado premium' }
    ]
  };

  const cadenasBaratas = [
    { nombre: 'Matsuya/Sukiya/Yoshinoya', tipo: 'Gyudon', precio: '¥400-600', horario: '24h' },
    { nombre: 'Tenya', tipo: 'Tempura', precio: '¥500-800', horario: 'Hasta tarde' },
    { nombre: 'CoCo Ichibanya', tipo: 'Curry', precio: '¥600-900', horario: 'Variable' },
    { nombre: 'Sushiro/Kura Sushi', tipo: 'Sushi', precio: '¥100/plato', horario: 'Variable' }
  ];

  const localizacionesAnime = [
    { anime: 'Your Lie in April', lugar: 'Nerima (Towa Hall, Parque Shakujii)', acceso: 'Línea Seibu' },
    { anime: 'Gundam', lugar: 'Kami Igusa (Estatua Gundam)', acceso: 'Línea Seibu' },
    { anime: 'Lucky Star', lugar: 'Santuario Washinomiya (Saitama)', acceso: 'Tobu Isesaki Line' }
  ];

  const protocoloReglas = [
    { accion: 'Propinas', regla: 'NUNCA. Es ofensivo. El buen servicio es estándar.', icono: '💴' },
    { accion: 'Basura', regla: 'No hay papeleras. Lleva bolsa y tira en hotel/konbini.', icono: '🗑️' },
    { accion: 'Caminar', regla: 'No comas ni fumes mientras caminas.', icono: '🚶' },
    { accion: 'Trenes', regla: 'Silencio absoluto. Móvil en silencio. No llamadas.', icono: '🚇' },
    { accion: 'Pagos', regla: 'Usa la bandejita azul, no entregues en mano.', icono: '💳' },
    { accion: 'Escaleras', regla: 'Izquierda parado, derecha para pasar (Tokio).', icono: '↕️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header con reloj en tiempo real */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🇯🇵 Panel de Control: Tokio en Tiempo Real</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Hora en Tokio: {tokyoTime.toLocaleTimeString('es-ES')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Checklist: {Object.values(checklist).filter(Boolean).length}/5</span>
            </div>
            {weather && (
              <div className="flex items-center gap-2">
                {getWeatherIcon(weather.current.weather_code)}
                <span>{weather.current.temperature_2m}°C</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación por tabs */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white border-b-4 border-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido dinámico */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* TAB: DATOS EN VIVO */}
        {activeTab === 'directo' && (
          <div className="space-y-6">
            {/* Conversor de Divisas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">💱 Conversor EUR ↔ JPY</h2>
                <button
                  onClick={() => {
                    fetchExchangeRates();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading.exchange}
                >
                  <RefreshCw className={`w-4 h-4 ${loading.exchange ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
              
              {loading.exchange ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 mt-2">Cargando tipos de cambio...</p>
                </div>
              ) : exchangeRates ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Tipo de cambio actual:</p>
                    <p className="text-3xl font-bold text-blue-600">1 EUR = {exchangeRates.eurToJpy.toFixed(2)} JPY</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Actualizado: {exchangeRates.lastUpdate.toLocaleString('es-ES')}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Euros (EUR)</label>
                      <input
                        type="number"
                        value={eurAmount}
                        onChange={(e) => setEurAmount(Number(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        min="0"
                        step="1"
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Yenes (JPY)</label>
                      <div className="w-full px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg font-bold text-blue-700 text-xl">
                        ¥{jpyAmount}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 50, 100, 200, 500, 1000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setEurAmount(amount)}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        {amount} EUR
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-red-600">Error al cargar tipos de cambio</p>
              )}
            </div>

            {/* Meteorología */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">🌤️ Meteorología en Tokio</h2>
                <button
                  onClick={fetchWeather}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading.weather}
                >
                  <RefreshCw className={`w-4 h-4 ${loading.weather ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
              
              {loading.weather ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 mt-2">Cargando datos meteorológicos...</p>
                </div>
              ) : weather ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-lg">
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(weather.current.weather_code)}
                      <div>
                        <p className="text-4xl font-bold text-gray-800">{weather.current.temperature_2m}°C</p>
                        <p className="text-lg text-gray-700">{getWeatherDescription(weather.current.weather_code)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white/50 p-3 rounded">
                        <p className="text-sm text-gray-600">Humedad</p>
                        <p className="text-xl font-bold text-gray-800">{weather.current.relative_humidity_2m}%</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <p className="text-sm text-gray-600">Viento</p>
                        <p className="text-xl font-bold text-gray-800">{weather.current.wind_speed_10m} km/h</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">Pronóstico 3 días</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {weather.daily.time.slice(0, 3).map((date, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium text-gray-700 mb-2">
                            {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                          {getWeatherIcon(weather.daily.weather_code[idx])}
                          <p className="text-sm text-gray-600 mt-2">{getWeatherDescription(weather.daily.weather_code[idx])}</p>
                          <p className="text-sm text-gray-800 mt-1">
                            <span className="text-red-600 font-bold">{weather.daily.temperature_2m_max[idx]}°</span>
                            {' / '}
                            <span className="text-blue-600 font-bold">{weather.daily.temperature_2m_min[idx]}°</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">Error al cargar datos meteorológicos</p>
              )}
            </div>

            {/* Eventos Actuales */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">📅 Eventos en Tokio Ahora</h2>
                <button
                  onClick={fetchEvents}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading.events}
                >
                  <RefreshCw className={`w-4 h-4 ${loading.events ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
              
              {loading.events ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-600 mt-2">Buscando eventos actuales...</p>
                </div>
              ) : events ? (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="text-gray-700 whitespace-pre-wrap">{events}</div>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">Error al cargar eventos</p>
              )}
              
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Para más eventos actualizados, consulta TimeOut Tokyo o Japan Guide.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Checklist Diario</h2>
              <p className="text-gray-600 mb-4">Marca antes de salir del hotel:</p>
              <div className="space-y-3">
                {[
                  { key: 'efectivo', label: '💴 Dinero en efectivo', desc: 'Templos y ramen solo aceptan efectivo' },
                  { key: 'toalla', label: '🧻 Toalla de mano', desc: 'Muchos baños sin secador' },
                  { key: 'bateria', label: '🔋 Batería externa', desc: 'Para Maps y traductor' },
                  { key: 'bolsaBasura', label: '🛍️ Bolsa para basura', desc: 'No hay papeleras públicas' },
                  { key: 'pasaporte', label: '🛂 Pasaporte', desc: 'Para compras Tax Free' }
                ].map(item => (
                  <div
                    key={item.key}
                    onClick={() => toggleCheckItem(item.key)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      checklist[item.key]
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.desc}</div>
                      </div>
                      {checklist[item.key] && <CheckCircle className="w-6 h-6 text-green-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">💡 Consejo Pro</h3>
              <p className="text-lg">Si ves una cola larga de gente local frente a un restaurante pequeño y sin pretensiones, ponte en la cola. En Japón, las colas son el mejor indicador de calidad.</p>
            </div>
          </div>
        )}

        {/* TAB: TRANSPORTE */}
        {activeTab === 'transporte' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🚇 Tarjetas IC (Suica/Pasmo)</h2>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="font-semibold text-green-800">✅ Estado 2025: Venta reanudada en marzo 2025</p>
                <p className="text-green-700">La escasez de chips ha terminado. Ya puedes comprar tarjetas físicas.</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="font-semibold text-blue-800">📱 Alternativa iPhone</p>
                <p className="text-blue-700">Añade la Suica directamente a Apple Wallet para pago contactless.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🚄 Shinkansen (Tren Bala)</h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="font-semibold text-red-800">⚠️ Fechas Pico</p>
                <p className="text-red-700">En Golden Week, Obon y Fin de Año: los trenes Nozomi (más rápidos) solo operan con asientos reservados. ¡Reserva con antelación!</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📱 Apps Esenciales</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Wifi className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-bold text-gray-800">Navegación</h3>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Google Maps (fiable)</li>
                    <li>• Japan Travel by Navitime</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Book className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-bold text-gray-800">Idioma</h3>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Google Translate (cámara)</li>
                    <li>• Google Lens</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Utensils className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-bold text-gray-800">Comida</h3>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Tabelog (reseñas locales)</li>
                    <li>• Gurunavi</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-bold text-gray-800">Trámites</h3>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Visit Japan Web (esencial)</li>
                    <li>• Para aduanas e inmigración</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMIDA */}
        {activeTab === 'comida' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🍜 Restaurantes por Barrio</h2>
              {Object.entries(restaurantes).map(([barrio, lugares]) => (
                <div key={barrio} className="mb-6">
                  <h3 className="text-xl font-bold text-red-600 mb-3 capitalize">{barrio}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {lugares.map((rest, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-400 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800">{rest.nombre}</h4>
                          <span className="text-green-600 font-bold">{rest.precio}</span>
                        </div>
                        <p className="text-sm text-gray-600">{rest.tipo}</p>
                        <p className="text-sm text-gray-500 mt-1 italic">{rest.nota}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">💴 Cadenas "Salva-Bolsillo"</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {cadenasBaratas.map((cadena, idx) => (
                  <div key={idx} className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800">{cadena.nombre}</h4>
                      <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded">{cadena.horario}</span>
                    </div>
                    <p className="text-sm text-gray-600">{cadena.tipo}</p>
                    <p className="text-lg text-green-600 font-bold mt-1">{cadena.precio}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">🍺 Guía Rápida: Izakaya</h3>
              <ul className="space-y-2">
                <li><strong>Qué es:</strong> Bar donde se bebe y se comparten platos pequeños (como tapeo)</li>
                <li><strong>El "Otoshi":</strong> Aperitivo obligatorio al sentarte (cargo de mesa). No lo devuelvas.</li>
                <li><strong>Cómo pedir:</strong> Grita "Sumimasen!" (¡Disculpe!) para llamar al camarero</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: OTAKU */}
        {activeTab === 'otaku' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🛍️ Compras: Figuras y Merch</h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                  <h3 className="font-bold text-purple-800 mb-2">🏢 Nakano Broadway</h3>
                  <p className="text-gray-700">A menudo más barato que Akihabara para figuras de segunda mano. Ideal para coleccionistas.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <h3 className="font-bold text-blue-800 mb-2">📚 Jimbocho</h3>
                  <p className="text-gray-700">El barrio de los libros. Perfecto para libros de arte, revistas antiguas y cafeterías tranquilas.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                  <h3 className="font-bold text-green-800 mb-2">♻️ Cadenas de Segunda Mano</h3>
                  <p className="text-gray-700">Mandarake, Book Off, Surugaya - tesoros ocultos a buen precio.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📸 Localizaciones de Anime</h2>
              <div className="space-y-4">
                {localizacionesAnime.map((loc, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-2 border-pink-300">
                    <div className="flex items-start gap-3">
                      <Camera className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{loc.anime}</h3>
                        <p className="text-gray-700 mt-1"><strong>Lugar:</strong> {loc.lugar}</p>
                        <p className="text-gray-600 text-sm mt-1"><strong>Acceso:</strong> {loc.acceso}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROTOCOLO */}
        {activeTab === 'protocolo' && (
          <div className="space-y-6">
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-red-800 mb-2">⚠️ ¡CRÍTICO! Normas Sociales</h2>
              <p className="text-red-700">Estas reglas son esenciales para no ofender. Léelas con atención.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {protocoloReglas.map((regla, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{regla.icono}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">{regla.accion}</h3>
                      <p className="text-gray-700">{regla.regla}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🚇 Regla de Oro en Escaleras</h3>
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
                <p className="text-gray-800 text-lg">
                  <strong>En Tokio:</strong> Mantente a la <span className="text-red-600 font-bold">IZQUIERDA</span> si estás parado.
                </p>
                <p className="text-gray-600 mt-2">La derecha es para quienes caminan (aunque se recomienda no caminar).</p>
                <p className="text-sm text-gray-500 mt-2 italic">Nota: En Osaka es al revés (derecha parado, izquierda caminar).</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-6 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">Panel actualizado en tiempo real • Datos en vivo de meteorología, divisas y eventos • ¡Disfruta Tokio! 🇯🇵</p>
        </div>
      </div>
    </div>
  );
};

export default TokyoTravelDashboard;