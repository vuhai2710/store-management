/**
 * useDebounce Hook - Shared debounce utility for realtime search
 *
 * This hook provides debounced values for search inputs across the admin panel.
 * Default delay: 300ms (optimal for realtime search UX)
 *
 * Usage:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This will only run 300ms after user stops typing
 *   fetchData({ keyword: debouncedSearch });
 * }, [debouncedSearch]);
 */

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Basic debounce hook - returns debounced value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {any} - The debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Advanced debounced search hook with built-in state management
 * Provides complete search state management with debouncing
 *
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Debounce delay in ms (default: 300)
 * @param {Function} options.onSearch - Callback when debounced value changes
 * @param {string} options.initialValue - Initial search value (default: '')
 * @returns {Object} - Search state and handlers
 */
export const useDebouncedSearch = ({
  delay = 300,
  onSearch,
  initialValue = "",
} = {}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedValue = useDebounce(searchTerm, delay);
  const isFirstRender = useRef(true);

  // Effect to handle debounced search callback
  useEffect(() => {
    // Skip the first render to avoid initial API call
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (onSearch) {
      setIsSearching(true);
      Promise.resolve(onSearch(debouncedValue)).finally(() => {
        setIsSearching(false);
      });
    }
  }, [debouncedValue, onSearch]);

  // Handler for input onChange
  const handleSearchChange = useCallback((e) => {
    const value = e?.target?.value ?? e;
    setSearchTerm(value);
  }, []);

  // Reset search to initial state
  const resetSearch = useCallback(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Clear search completely
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    searchTerm, // Current input value (raw)
    debouncedValue, // Debounced value for API calls
    isSearching, // Loading state during search
    setSearchTerm, // Direct setter for search term
    handleSearchChange, // onChange handler for inputs
    resetSearch, // Reset to initial value
    clearSearch, // Clear search completely
  };
};

/**
 * Hook for debounced callback execution
 * Useful when you need to debounce a function call directly
 *
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const useDebouncedCallback = (callback, delay = 300) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedFn = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedFn;
};

export default useDebounce;
