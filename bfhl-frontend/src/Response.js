import React from 'react';

function Response({ apiResponse, selectedOptions }) {
  const filterResponse = () => {
    let filteredResponse = { ...apiResponse };
    if (!selectedOptions.includes('alphabets')) {
      delete filteredResponse.alphabets;
    }
    if (!selectedOptions.includes('numbers')) {
      delete filteredResponse.numbers;
    }
    if (!selectedOptions.includes('highestAlphabet')) {
      delete filteredResponse.highestAlphabet;
    }
    return filteredResponse;
  };

  const filteredResponse = filterResponse();

  return (
    <div>
      <h3>Response:</h3>
      <pre>{JSON.stringify(filteredResponse, null, 2)}</pre>
    </div>
  );
}

export default Response;
