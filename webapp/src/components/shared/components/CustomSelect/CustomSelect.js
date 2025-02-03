import React, { useState } from 'react';
import Select from 'react-select';
import { Typography } from '@mui/material';
import './CustomSelect.scss';

const CustomSelect = (props) => {
  const [inputValue, setInputValue] = useState('');

  const onChange = (val) => {
    if (props.onChange) {
      props.onChange(props.Objectkey, val?.value);
    }
  };

  const handleInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const handleMenuOpen = () => {
    onChange(null);
  };

  const customFilterOption = (option, rawInput) => {

    if (!rawInput) {
      return true;
    }

    const input = rawInput.trim().toLowerCase();
    const label = getLabelValue(option);
    const checkedLabel = String(label).trim().toLowerCase();

    return checkedLabel.startsWith(input);
  };

  const getLabelValue = (option) => {

    if (!option || typeof option !== 'object') {
      return '';
    }

    const textContent = [];

    if (option.image && typeof option.image === 'string') {
      textContent.push(option.image);
    }

    const traverse = (element) => {
      if (typeof element === 'string') {
        textContent.push(element);
      } else if (Array.isArray(element)) {
        element.forEach((child) => traverse(child));
      } else if (element && element.props && element.props.children) {
        traverse(element.props.children);
      }
    };


    traverse(option.label);

    return textContent.join(' ').trim();
  };

  return (
    <div className='default-react-select'>
      <label>{props.label ? props.label : 'Select'}</label>
      <Select
        options={props.options ?? []}
        value={props.value && Array.isArray(props.options) ? props.options.filter(item => item.value === props.value)[0] : null}
        onChange={option => onChange(option)}
        onInputChange={handleInputChange}
        onMenuOpen={handleMenuOpen}
        placeholder={props.placeholder}
        getOptionLabel={(option) => (
          <div style={{ display: 'flex', alignItems: 'center', padding: '5px' }}>
            {option.image && <img src={option.image} alt="Company Logo" style={{ width: '30px', marginRight: '10px' }} />}
            <div>{option.label}</div>
          </div>
        )}
        getOptionValue={(option) => option.id}
        filterOption={customFilterOption}
        inputValue={inputValue}
        isSearchable
      />
      {props.error && (
        <Typography className='customSelectError'>{props.helperText}</Typography>
      )}
    </div>
  );
};

export default CustomSelect;
