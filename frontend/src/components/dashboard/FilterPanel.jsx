import React, { useState, useMemo } from 'react';

// --- Static Data for Initial Frontend Development (UNCHANGED) ---
const DUMMY_SPECIES_LIST = [
{ id: 1, common_name: 'Indian Mackerel' },
{ id: 2, common_name: 'Yellowfin Tuna' },
{ id: 3, common_name: 'Giant Trevally' },
{ id: 4, common_name: 'Nile Tilapia' },
 // ... other dummy data ...
];

const DUMMY_SIGHTINGS_DATA = [
 // ... other dummy data ...
];
// --- End of Static Data ---

function FilterPanel({ onFilterChange, isFiltering }) {
  // --- Component Logic (UNCHANGED) ---
  const [speciesList] = useState(DUMMY_SPECIES_LIST);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedDate, setSelectedDate] = useState('2024-07-15');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredSpecies = useMemo(() => {
    if (!searchTerm) {
      return speciesList;
    }
    return speciesList.filter(species =>
      species.common_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [speciesList, searchTerm]);

  const handleSelectSpecies = (species) => {
    setSelectedSpecies(species.id.toString());
    setSearchTerm(species.common_name);
    setIsDropdownOpen(false);
  };

  const handleApplyFilters = () => {
    if (!selectedSpecies || !selectedDate) {
      alert('Please select a species from the list and a date.');
      return;
    }
    const filteredSightings = DUMMY_SIGHTINGS_DATA.filter(sighting => {
      const sightingDate = sighting.sighting_date.split('T')[0];
      return (
        sighting.species_id.toString() === selectedSpecies &&
        sightingDate === selectedDate
      );
    });
    onFilterChange(filteredSightings);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (selectedSpecies) {
      setSelectedSpecies('');
    }
  }
  // --- END Component Logic ---

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        
        {/* Interactive Species Search */}
        <div className="md:col-span-1 relative">
          <label htmlFor="species-search" className="block text-sm font-medium text-purple-300 mb-2">
            Species
          </label>
          <input
            id="species-search"
            type="text"
            placeholder="Search and select species..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
            className="w-full p-3 border border-purple-400/30 bg-gray-900 text-white rounded-lg shadow-inner focus:ring-pink-500 focus:border-pink-500 transition-all"
            autoComplete="off"
          />
          {isDropdownOpen && filteredSpecies.length > 0 && (
            <ul className="absolute z-[2000] w-full bg-gray-900 border border-purple-400/30 rounded-lg mt-2 max-h-60 overflow-y-auto shadow-2xl">
              {filteredSpecies.map(species => (
                <li
                  key={species.id}
                  onMouseDown={() => handleSelectSpecies(species)}
                  className="px-4 py-3 text-white hover:bg-purple-600/30 cursor-pointer transition-colors"
                >
                  {species.common_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date Selector */}
        <div className="md:col-span-1">
          <label htmlFor="select-date" className="block text-sm font-medium text-purple-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="select-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-purple-400/30 bg-gray-900 text-white rounded-lg shadow-inner focus:ring-pink-500 focus:border-pink-500 transition-all"
          />
        </div>

        {/* Go Button */}
        <div className="md:col-span-1">
          <button
            onClick={handleApplyFilters}
            disabled={isFiltering}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {isFiltering ? 'Loading...' : 'Go'}
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default FilterPanel;