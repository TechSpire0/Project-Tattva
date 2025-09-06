import React, { useState, useMemo } from 'react';

// --- Static Data for Initial Frontend Development ---
const DUMMY_SPECIES_LIST = [
  { id: 1, common_name: 'Indian Mackerel' },
  { id: 2, common_name: 'Indian Oil Sardine' },
  { id: 3, common_name: 'Indo-Pacific King Mackerel' },
  { id: 4, common_name: 'Barramundi (Asian Sea Bass)' },
  { id: 5, common_name: 'Silver Pomfret' },
  { id: 6, common_name: 'Malabar Trevally' },
  { id: 7, common_name: 'Black Pomfret' },
  { id: 8, common_name: 'Giant Tiger Prawn' },
  { id: 9, common_name: 'Yellowfin Tuna' },
  { id: 10, common_name: 'Skipjack Tuna' },
];

const DUMMY_SIGHTINGS_DATA = [
    { sighting_id: 'STATIC-001', latitude: 15.30, longitude: 74.12, sighting_date: '2024-07-15T10:00:00Z', species_id: 1, species: { id: 1, common_name: 'Indian Mackerel' }, sea_surface_temp_c: 29.1 },
    { sighting_id: 'STATIC-002', latitude: 12.97, longitude: 77.59, sighting_date: '2024-07-15T11:00:00Z', species_id: 2, species: { id: 2, common_name: 'Indian Oil Sardine' }, sea_surface_temp_c: 28.5 },
    { sighting_id: 'STATIC-003', latitude: 18.92, longitude: 72.83, sighting_date: '2024-07-16T09:30:00Z', species_id: 1, species: { id: 1, common_name: 'Indian Mackerel' }, sea_surface_temp_c: 29.3 },
    { sighting_id: 'STATIC-004', latitude: 8.48, longitude: 76.95, sighting_date: '2024-07-16T14:00:00Z', species_id: 3, species: { id: 3, common_name: 'Indo-Pacific King Mackerel' }, sea_surface_temp_c: 30.1 },
    { sighting_id: 'STATIC-005', latitude: 22.57, longitude: 88.36, sighting_date: '2024-07-15T16:00:00Z', species_id: 4, species: { id: 4, common_name: 'Barramundi (Asian Sea Bass)' }, sea_surface_temp_c: 29.8 },
    { sighting_id: 'STATIC-006', latitude: 15.35, longitude: 74.15, sighting_date: '2024-07-15T12:00:00Z', species_id: 1, species: { id: 1, common_name: 'Indian Mackerel' }, sea_surface_temp_c: 29.2 },
];
// --- End of Static Data ---

function FilterPanel({ onFilterChange, isFiltering }) {
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        
        {/* Interactive Species Search */}
        <div className="md:col-span-1 relative">
          <label htmlFor="species-search" className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            autoComplete="off"
          />
          {isDropdownOpen && filteredSpecies.length > 0 && (
            // --- THE FIX IS HERE: Increased z-index dramatically ---
            // z-[2000] is an extremely high value that will force this dropdown to render
            // on top of all other elements on the page, including the complex map layers.
            <ul className="absolute z-[2000] w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {filteredSpecies.map(species => (
                <li
                  key={species.id}
                  onMouseDown={() => handleSelectSpecies(species)}
                  className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                >
                  {species.common_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date Selector */}
        <div className="md:col-span-1">
          <label htmlFor="select-date" className="block text-sm font-medium text-gray-700 mb-1">
            Select Date
          </label>
          <input
            type="date"
            id="select-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Go Button */}
        <div className="md:col-span-1">
          <button
            onClick={handleApplyFilters}
            disabled={isFiltering}
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md
                       hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isFiltering ? 'Loading...' : 'Go'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;

