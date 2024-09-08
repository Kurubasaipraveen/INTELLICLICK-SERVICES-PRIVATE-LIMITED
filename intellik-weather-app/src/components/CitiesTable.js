import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import '../styles/CitiesTable.css';

function CitiesTable() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCities();
  }, [page]);

  useEffect(() => {
    handleSearch(); // Reapply search filter when cities or search text changes
  }, [search, cities]);

  useEffect(() => {
    handleSort(); // Reapply sorting when sort key or direction changes
  }, [sortKey, sortDirection, filteredCities]);

  const fetchCities = async () => {
    try {
      const response = await axios.get(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&start=${page * 100}&rows=100`
      );
      console.log(response.data); // Inspect the API response

      const newCities = response.data.records.map((record) => ({
        name: record.fields.name,
        country: parseCountry(record.fields.country), // Parse the country field
        timezone: record.fields.timezone,
        population: record.fields.population,
      }));
      setCities((prevCities) => [...prevCities, ...newCities]);
      if (newCities.length === 0) setHasMore(false);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const parseCountry = (countryField) => {
    // Example logic to handle URLs or special formatting
    if (typeof countryField === 'string' && countryField.startsWith('http')) {
      // Extract country code or name from URL if necessary
      return 'Country Code or Name'; // Modify this based on actual URL structure
    }
    return countryField || 'N/A';
  };

  const handleSearch = () => {
    const results = cities.filter(city =>
      city.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCities(results);
  };

  const handleSort = () => {
    const sortedCities = [...filteredCities].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredCities(sortedCities);
  };

  const handleSortChange = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleCityClick = (cityName, e) => {
    if (e.button === 0) { // Left click
      navigate(`/weather/${cityName}`);
    } else if (e.button === 1) { // Middle click (to open in new tab)
      window.open(`/weather/${cityName}`, '_blank');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search cities"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='search'
      />
      <InfiniteScroll
        dataLength={filteredCities.length || cities.length}
        next={() => setPage(page + 1)}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more cities to load</p>}
      >
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSortChange('name')}>City Name {sortKey === 'name' ? (sortDirection === 'asc' ? '🔼' : '🔽') : ''}</th>
              <th onClick={() => handleSortChange('country')}>Country {sortKey === 'country' ? (sortDirection === 'asc' ? '🔼' : '🔽') : ''}</th>
              <th onClick={() => handleSortChange('timezone')}>Timezone {sortKey === 'timezone' ? (sortDirection === 'asc' ? '🔼' : '🔽') : ''}</th>
              <th onClick={() => handleSortChange('population')}>Population {sortKey === 'population' ? (sortDirection === 'asc' ? '🔼' : '🔽') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {(filteredCities.length ? filteredCities : cities).map((city, index) => (
              <tr key={index} onClick={(e) => handleCityClick(city.name, e)}>
                <td>{city.name}</td>
                <td>{city.country}</td>
                <td>{city.timezone}</td>
                <td>{city.population}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
}

export default CitiesTable;
