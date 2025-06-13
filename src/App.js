import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [country, setCountry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const getInfo = async () => {
    if (!city) return;

    setLoading(true);
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.cod !== 200) {
        setError('City not found');
        setWeather(null);
        setCountry(null);
        setLoading(false);
        return;
      }

      setWeather(weatherData);
      const countryCode = weatherData.sys.country;

      const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const countryData = await countryRes.json();

      setCountry(countryData[0]);
      setError('');
      localStorage.setItem('lastCity', city);
    } catch (err) {
      setError('Something went wrong');
      setWeather(null);
      setCountry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
      setCity(savedCity);
      setTimeout(() => getInfo(), 500);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <button onClick={() => setDarkMode(!darkMode)} className="toggle-btn">
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1>Weather-Country Info 🌞</h1>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {(weather || country) && (
        <div className="result-container">
          {weather && (
            <div className="weather-info">
              <h2>Weather in {weather.name}</h2>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="weather icon"
              />
              <p>Temperature: {weather.main.temp}°C</p>
              <p>Condition: {weather.weather[0].description}</p>
              <p>Humidity: {weather.main.humidity}%</p>
            </div>
          )}

          {country && (
            <div className="country-info">
              <h2>Country: {country.name.common}</h2>
              <img src={country.flags.svg} alt="flag" width="150" />
              <p><strong>Capital:</strong> {country.capital?.[0]}</p>
              <p><strong>Continent:</strong> {country.region}</p>
              <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && getInfo()}
        />
        <button onClick={getInfo}>Get Info</button>
      </div>
    </div>
  );
}

export default App;