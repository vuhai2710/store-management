import { useState, useEffect, useCallback, useRef } from "react";

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

export const useDebouncedSearch = ({
  delay = 300,
  onSearch,
  initialValue = "",
} = {}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedValue = useDebounce(searchTerm, delay);
  const isFirstRender = useRef(true);

  useEffect(() => {

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

  const handleSearchChange = useCallback((e) => {
    const value = e?.target?.value ?? e;
    setSearchTerm(value);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    searchTerm,
    debouncedValue,
    isSearching,
    setSearchTerm,
    handleSearchChange,
    resetSearch,
    clearSearch,
  };
};

export const useDebouncedCallback = (callback, delay = 300) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

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
