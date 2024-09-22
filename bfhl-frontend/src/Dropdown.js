import React from 'react';

const options = [
  { value: 'alphabets', label: 'Alphabets' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'highestAlphabet', label: 'Highest Alphabet' },
];

function Dropdown({ selectedOptions, setSelectedOptions }) {
  const handleChange = (event) => {
    const { value } = event.target;
    setSelectedOptions(
      Array.from(event.target.selectedOptions, (option) => option.value)
    );
  };

  return (
    <div>
      <select multiple value={selectedOptions} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;
