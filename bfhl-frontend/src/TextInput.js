import React from 'react';

function TextInput({ value, onChange }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Enter JSON here'
      />
    </div>
  );
}

export default TextInput;
