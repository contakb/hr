import React, { useState } from 'react';
import Select from 'react-select';

function SelectionComponent() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const options = [
    { value: 'pyl_1', label: 'Pył 1' },
    { value: 'pyl_2', label: 'Pył 2' },
    { value: 'pyl_3', label: 'Pył 3' },
    { value: 'other', label: 'Other (specify)' },
  ];

  const handleSelectChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions);
    setShowCustomInput(selectedOptions.some(option => option.value === 'other'));
  };

  return (
    <div>
      <Select
        isMulti
        name="dusts"
        options={options}
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={handleSelectChange}
        value={selectedOptions}
      />
      {showCustomInput && (
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="Specify if other"
          className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      )}
    </div>
  );
}

export default SelectionComponent;
