'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { getMajorCityCoordinates } from '@/lib/geocoding';

// Local city database for offline suggestions
const NEPAL_CITIES = [
  'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar', 'Bharatpur', 
  'Chitwan', 'Dharan', 'Butwal', 'Nepalgunj', 'Janakpur', 'Hetauda', 'Birgunj',
  'Dhangadhi', 'Itahari', 'Gorkha', 'Baglung', 'Tansen', 'Dang', 'Tulsipur',
  'Kalaiya', 'Siddharthanagar', 'Mahendranagar', 'Tikapur', 'Rajbiraj', 'Lahan',
  'Siraha', 'Gaur', 'Malangwa', 'Triyuga', 'Damak', 'Mechinagar', 'Birtamod',
  'Urlabari', 'Inaruwa', 'Khandbari', 'Bhojpur', 'Diktel', 'Okhaldhunga',
  'Charikot', 'Jiri', 'Sindhuli', 'Kamalamai', 'Manthali', 'Dhulikhel',
  'Banepa', 'Panauti', 'Madhyapur', 'Kirtipur', 'Tokha', 'Budhanilkantha',
  'Tarakeshwar', 'Dakshinkali', 'Nagarjun', 'Kageshwari', 'Gokarneshwar',
  'Changunarayan', 'Suryabinayak', 'Mahalaxmi', 'Godawari', 'Konjyosom', 'Bagmati'
];

// Function to get local city suggestions
const getLocalCitySuggestions = (query: string, forceShow: boolean = false) => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!forceShow && normalizedQuery.length < 2) return [];
  
  const matches = NEPAL_CITIES.filter(city => 
    city.toLowerCase().includes(normalizedQuery) ||
    normalizedQuery.includes(city.toLowerCase())
  ).slice(0, 5);
  
  // Convert to Nominatim-like format
  return matches.map(city => {
    const coords = getMajorCityCoordinates(city);
    return {
      display_name: `${city}, Nepal`,
      lat: coords?.latitude?.toString() || '27.7172',
      lon: coords?.longitude?.toString() || '85.3240',
      address: {
        city: city,
        country: 'Nepal'
      },
      isLocal: true // Flag to identify local suggestions
    };
  });
};

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id?: number;
  address?: {
    city?: string;
    country?: string;
  };
  isLocal?: boolean;
}

interface LocationAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  additionalContext?: string; // Additional context like full address for better geocoding
}

export function LocationAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder = 'Start typing city name...',
  required = false,
  disabled = false,
  className = '',
  additionalContext = '',
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Nominatim API
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // First try local city matching for better performance
      const localCities = getLocalCitySuggestions(query);
      if (localCities.length > 0) {
        setSuggestions(localCities);
        setShowSuggestions(true);
        setIsLoading(false);
        return;
      }

      // Try Nominatim API for more detailed results
      let searchQuery = query;
      if (additionalContext && additionalContext.trim().length > 0) {
        searchQuery = `${query}, ${additionalContext}`;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=5&countrycodes=np&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BloodBankManagementSystem/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        // Fallback to local suggestions if API fails
        const fallbackCities = getLocalCitySuggestions(query, true);
        setSuggestions(fallbackCities);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      // Fallback to local city suggestions when API fails
      const fallbackCities = getLocalCitySuggestions(query, true);
      setSuggestions(fallbackCities);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500); // 500ms debounce
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    // Extract city name from display_name (usually first part before comma)
    const cityName = suggestion.display_name.split(',')[0].trim();
    
    onChange(cityName, {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });

    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={`space-y-2 relative ${className}`}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          id={id}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10"
          required={required}
          disabled={disabled}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-slate-50' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {suggestion.display_name.split(',')[0]}
                    </p>
                    {suggestion.isLocal && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        Local
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {suggestion.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && value.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-slate-500 text-center">
            No locations found. Try a different search term.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Start typing to see location suggestions from Nominatim API
      </p>
    </div>
  );
}
