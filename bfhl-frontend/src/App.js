import React, { useState } from 'react';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import Response from './Response';
import './App.css'; 

function App() {
  const [jsonInput, setJsonInput] = useState('');  // State for JSON input
  const [isValidJson, setIsValidJson] = useState(false);  // State to check JSON validity
  const [apiResponse, setApiResponse] = useState(null);  // State for API response
  const [selectedOptions, setSelectedOptions] = useState([]);  // State for dropdown selections

  // Function to validate JSON input
  const validateJson = (input) => {
    try {
      JSON.parse(input);  // If JSON is valid, mark it as valid
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);  // Invalid JSON
    }
    setJsonInput(input);  // Store the input in state
  };

  // Function to handle the submit event
  const handleSubmit = async () => {
    if (isValidJson) {  // Only proceed if the input is valid JSON
      try {
        const response = await fetch('http://localhost:3000/bghl', {
          method: 'POST',
          mode: "cors",  // Ensure CORS mode is specified
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonInput,  // Send the input as body
        });

        if (response.ok) {  // If the request is successful
          const data = await response.json();  // Parse the response
          setApiResponse(data);  // Set the API response in state
        } else {
          console.error('Error fetching data from the API');  // Log errors in case of failure
        }
      } catch (error) {
        console.error('Error during fetch:', error);  // Catch any network or fetch errors
      }
    }
  };

  return (
    <div className="App">
      <h1>Your Roll Number</h1>
      {/* TextInput component */}
      <TextInput value={jsonInput} onChange={validateJson} />
      
      {/* Submit button (disabled if JSON is invalid) */}
      <button onClick={handleSubmit} disabled={!isValidJson}>
        Submit
      </button>
      
      {/* Display the dropdown and response components only if there is a valid API response */}
      {apiResponse && (
        <>
          <Dropdown selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
          <Response apiResponse={apiResponse} selectedOptions={selectedOptions} />
        </>
      )}
    </div>
  );
}

export default App;
