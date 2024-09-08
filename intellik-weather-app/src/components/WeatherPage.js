import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/WeatherPage.css';

const getBackgroundImage = (weatherDescription) => {
    switch (weatherDescription.toLowerCase()) {
      case 'clear sky':
        return 'url(https://media.istockphoto.com/id/1188520316/photo/landscape-of-the-clear-sky.jpg?s=612x612&w=0&k=20&c=Vnk6XNgITN9AkTk7KMSdYZG7Olk4rAIvJNpm_nCM7t0)';
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
        return 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPmLZt9KxMo2xsoyRpyzx6mZmjdKvD5AMz4w&s)';
      case 'rain':
      case 'shower rain':
        return 'url(https://t4.ftcdn.net/jpg/01/59/19/81/360_F_159198166_N6hs0y3lnoeWm6uiaBgHgpYZf3xjQNke.jpg)';
      case 'snow':
        return 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjacAoEWVClJrz3AEv4L4MEP57K0sE9Gn_VQ&s)';
      case 'thunderstorm':
        return 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnJcLWr0N8mVPMdHQC4Xxbi5XrbFqCr8-7xQ&s)';
      default:
        return 'url()';
    }
  };

function WeatherPage() {
  const { cityName } = useParams(); // No TypeScript annotation here
  const [weatherData, setWeatherData] = useState(null); // Removed TypeScript type
  const [forecastData, setForecastData] = useState(null); // Removed TypeScript type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiKey = '402ac06c27b340a6b2d7322116da71fe'; // Replace with your OpenWeatherMap API key.

  const fetchWeather = async () => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );
      setWeatherData(weatherResponse.data);
    } catch (err) {
      setError('Failed to fetch weather data');
    }
  };

  const fetchForecast = async () => {
    try {
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
      );
      setForecastData(forecastResponse.data);
    } catch (err) {
      setError('Failed to fetch forecast data');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchWeather();
      await fetchForecast();
      setLoading(false);
    };

    fetchData();
  }, [cityName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const backgroundImage = weatherData ? getBackgroundImage(weatherData.weather[0].description) : '';

  return (
    <div className="weather-page" style={{ backgroundImage }}>
      <div className="weather-card">
        {weatherData && (
          <>
            <h2>Weather in {weatherData.name}</h2>
            <img
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
              alt={weatherData.weather[0].description}
              className="weather-icon"
            />
            <p>Temperature: {weatherData.main.temp}°C</p>
            <p>High: {weatherData.main.temp_max}°C</p>
            <p>Low: {weatherData.main.temp_min}°C</p>
            <p>Weather: {weatherData.weather[0].description}</p>
            <p>Humidity: {weatherData.main.humidity}%</p>
            <p>Wind Speed: {weatherData.wind.speed} m/s</p>
            <p>Atmospheric Pressure: {weatherData.main.pressure} hPa</p>
          </>
        )}
      </div>

      {forecastData && (
        <div className="forecast-cards">
          <h3>5-Day Forecast</h3>
          {forecastData.list.slice(0, 5).map((forecast, index) => (
            <div className="forecast-card" key={index}>
              <p>Date: {new Date(forecast.dt_txt).toLocaleDateString()}</p>
              <img
                src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                alt={forecast.weather[0].description}
                className="forecast-icon"
              />
              <p>Temp: {forecast.main.temp_min}°C to {forecast.main.temp_max}°C</p>
              <p>{forecast.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeatherPage;
