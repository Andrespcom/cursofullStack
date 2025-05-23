import { useState, useEffect } from 'react';
import axios from 'axios';

const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

const useWeather = (city) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        setWeather(response.data);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeather(null);
      }
    };

    fetchWeather();
  }, [city]);

  return weather;
};

export default useWeather;