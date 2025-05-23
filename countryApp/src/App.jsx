import { useState, useEffect } from 'react';
import useWeather from './hooks/useWeather';
import axios from 'axios';

const App = () => {
  const [query, setQuery] = useState('');
  const [allCountries, setAllCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Load all countries once
  useEffect(() => {
    axios
      .get('https://restcountries.com/v3.1/all')
      .then(response => setAllCountries(response.data))
      .catch(() => setAllCountries([]));
  }, []);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setSelectedCountry(null);
  };

  const filteredCountries = allCountries.filter((c) =>
    c.name.common.toLowerCase().startsWith(query.toLowerCase())
  );

  const showCountry = (country) => {
    setSelectedCountry(country);
  };

  const renderCountries = () => {
    if (selectedCountry) {
      return <CountryDetails country={selectedCountry} />;
    }

    if (filteredCountries.length > 10) {
      return <p>Too many matches, specify another filter.</p>;
    }

    if (filteredCountries.length > 1) {
      return filteredCountries.map(country => (
        <div key={country.cca3}>
          {country.name.common}
          <button onClick={() => showCountry(country)}>show</button>
        </div>
      ));
    }

    if (filteredCountries.length === 1) {
      return <CountryDetails country={filteredCountries[0]} />;
    }

    return <p>No matches.</p>;
  };

  return (
    <div>
      <h1>Country Finder</h1>
      <input value={query} onChange={handleQueryChange} placeholder="Search country..." />
      {renderCountries()}
    </div>
  );
};

const CountryDetails = ({ country }) => {
  const weather = useWeather(country.capital?.[0]);

  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>Capital: {country.capital?.[0]}</p>
      <p>Area: {country.area}</p>
      <h3>Languages:</h3>
      <ul>
        {Object.values(country.languages || {}).map(lang => <li key={lang}>{lang}</li>)}
      </ul>
      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="150" />

      {weather && (
        <div>
          <h3>Weather in {country.capital?.[0]}</h3>
          <p>Temperature: {weather.main.temp} °C</p>
          <p>Wind: {weather.wind.speed} m/s</p>
          <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="Weather icon" />
        </div>
      )}
    </div>
  );
};

export default App;