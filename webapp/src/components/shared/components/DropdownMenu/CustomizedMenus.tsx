import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MoreVert } from '@material-ui/icons';
import './DropdownMenu.scss'

function CustomizedMenus({ options, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (option) => {
    setAnchorEl(null);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div>
      {/* <Button
        
      >
        Open Menu
      </Button> */}
      <MoreVert aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick} className='icon-color more-vertical-icon cursor-pointer' />
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)} // Close the menu only when the anchorEl is set to null
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className='dropdown-menu-wrapper'
      >
        {options.map((option, index) => (
          <MenuItem key={index} onClick={() => handleClose(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>

    </div>
  );
}

export default CustomizedMenus;
