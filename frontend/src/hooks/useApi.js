// src/hooks/useApi.js

import { useState, useEffect } from "react";

// This is a custom hook. Its name must start with 'use'.
// It takes one argument: 'apiFunc', which is the function that will make the actual API call.
const useApi = (apiFunc) => {
  // useState holds the data we get back from the API. Initial state is null.
  const [data, setData] = useState(null);

  // useState holds the error object if the API call fails. Initial state is null.
  const [error, setError] = useState(null);

  // useState tracks whether the API call is currently in progress. Initial state is true.
  const [loading, setLoading] = useState(true);

  // useEffect is a React hook that runs side effects. API calls are side effects.
  // The empty array [] at the end means this effect will run only once, when the component mounts.
  useEffect(() => {
    // We define an async function inside the effect to perform the API call.
    const fetchData = async () => {
      try {
        // Set loading to true before we start the request.
        setLoading(true);

        // Reset any previous errors.
        setError(null);

        // 'await' pauses the function until the API call (apiFunc) is complete.
        const response = await apiFunc();

        // If the call is successful, we update our 'data' state with the response data.
        setData(response.data);
      } catch (err) {
        // If an error occurs during the API call, we catch it.
        // We update our 'error' state with the error object.
        setError(err);
      } finally {
        // The 'finally' block runs whether the request succeeded or failed.
        // We set loading to false because the request is now complete.
        setLoading(false);
      }
    };

    // We call the function we just defined to kick off the process.
    fetchData();
  }, [apiFunc]); // The dependency array ensures this effect re-runs if the apiFunc changes.

  // The hook returns an object containing the three crucial states.
  // Any component that uses this hook can access these values to render the UI accordingly.
  return { data, error, loading };
};

export default useApi;
