'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  address?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

interface FullAddressAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  cityContext?: string; // City name for better geocoding
}

export function FullAddressAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder = 'Start typing full address...',
  required = false,
  disabled = false,
  className = '',
  cityContext = '',
}: FullAddressAutocompleteProps) {
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
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Combine address with city for better results
      let searchQuery = query;
      if (cityContext && cityContext.trim().length > 0) {
        searchQuery = `${query}, ${cityContext}, Nepal`;
      } else {
        searchQuery = `${query}, Nepal`;
      }

      console.log('Searching for full address:', searchQuery);

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
        console.log('Address suggestions:', data);
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
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
    // Extract meaningful address parts
    let addressText = '';
    
    if (suggestion.address) {
      const parts = [];
      if (suggestion.address.road) parts.push(suggestion.address.road);
      if (suggestion.address.neighbourhood) parts.push(suggestion.address.neighbourhood);
      if (suggestion.address.suburb) parts.push(suggestion.address.suburb);
      
      addressText = parts.length > 0 ? parts.join(', ') : suggestion.display_name.split(',')[0];
    } else {
      // Fallback to first part of display name
      addressText = suggestion.display_name.split(',').slice(0, 2).join(', ');
    }
    
    onChange(addressText, {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });

    console.log('Selected address:', addressText, {
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
          {suggestions.map((suggestion, index) => {
            // Format display text
            const parts = suggestion.display_name.split(',').slice(0, 3);
            const mainText = parts[0];
            const subText = parts.slice(1).join(',');

            return (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-slate-50' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {mainText}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {subText}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && value.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-slate-500 text-center">
            No addresses found. Try a different search term or enter manually.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Type street name, area, or landmark for precise location
      </p>
    </div>
  );
}
