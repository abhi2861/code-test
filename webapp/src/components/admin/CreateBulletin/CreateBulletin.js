// import { Box, Radio, FormControl, FormLabel, FormControlLabel, RadioGroup, Checkbox, TextField, Autocomplete, Button } from '@mui/material'
// import React from 'react'
// import Header from '../../Header/Header'
// import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
// import CheckBoxIcon from '@mui/icons-material/CheckBox';

const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 },
    {
        title: 'The Lord of the Rings: The Return of the King',
        year: 2003,
    },
    { title: 'The Good, the Bad and the Ugly', year: 1966 },
    { title: 'Fight Club', year: 1999 },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        year: 2001,
    },
    {
        title: 'Star Wars: Episode V - The Empire Strikes Back',
        year: 1980,
    },
    { title: 'Forrest Gump', year: 1994 },
    { title: 'Inception', year: 2010 },
    {
        title: 'The Lord of the Rings: The Two Towers',
        year: 2002,
    },
    { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
    { title: 'Goodfellas', year: 1990 },
    { title: 'The Matrix', year: 1999 },
    { title: 'Seven Samurai', year: 1954 },
    {
        title: 'Star Wars: Episode IV - A New Hope',
        year: 1977,
    },
    { title: 'City of God', year: 2002 },
    { title: 'Se7en', year: 1995 },
    { title: 'The Silence of the Lambs', year: 1991 },
    { title: "It's a Wonderful Life", year: 1946 },
    { title: 'Life Is Beautiful', year: 1997 },
    { title: 'The Usual Suspects', year: 1995 },
    { title: 'Léon: The Professional', year: 1994 },
    { title: 'Spirited Away', year: 2001 },
    { title: 'Saving Private Ryan', year: 1998 },
    { title: 'Once Upon a Time in the West', year: 1968 },
    { title: 'American History X', year: 1998 },
    { title: 'Interstellar', year: 2014 },
];

// const CreateBulletin = () => {
//     const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
//     const checkedIcon = <CheckBoxIcon fontSize="small" />;

//     const [formData, setFormData] = useState({
//         companyName: '',
//         aboutCompany: '',
//         logo: baseImage, // Store image file
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         axios.post('http://localhost:8000/api/v1/createCompany/create', formData)
//             .then(response => {
//                 console.log(response.data);
//             })
//             .catch(error => {
//                 console.error('error', error);
//             });
//     };

//     return (
//         <div className='create-bulletin-wrapper'>
//             <Header role='admin' />
//             <div className='container'>
//                 <form onSubmit={handleSubmit}>
//                     <Box className='heading-section'>
//                         <h4>Create Bulletin</h4>
//                         <div className='d-flex align-items-center'>
//                             <FormControl>
//                                 <RadioGroup name='system' className='flex-row'>
//                                     <FormControlLabel control={<Radio size="sm" />} label={<p>Select System</p>} value='system' />
//                                     <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' />
//                                 </RadioGroup>
//                             </FormControl>
//                             <Autocomplete
//                                 multiple
//                                 id="checkboxes-tags-demo"
//                                 options={top100Films}
//                                 disableCloseOnSelect
//                                 getOptionLabel={(option) => option.title}
//                                 renderOption={(props, option, { selected }) => (
//                                     <li {...props}>
//                                         <Checkbox
//                                             icon={icon}
//                                             checkedIcon={checkedIcon}
//                                             style={{ marginRight: 8 }}
//                                             checked={selected}
//                                         />
//                                         {option.title}
//                                     </li>
//                                 )}
//                                 style={{ width: 500 }}
//                                 renderInput={(params) => (
//                                     <TextField {...params} label="Checkboxes" placeholder="Favorites" />
//                                 )}
//                                 className='default-multi-selectbox'
//                             />
//                         </div>
//                     </Box>
//                     <div className='post-bulletin-content rounded-borders-card padding-20 default-box-shadow-1'>
//                         <div className='rounded-borders-card mb-15px'>
//                             <div className='border-bottom-D9D9D9'>
//                                 <TextField fullWidth placeholder='Enter Title' className='bulletin-title' autoFocus={true} InputLabelProps={{ shrink: true }} id="outlined-basic" variant="outlined" />
//                             </div>
//                             <div>
//                                 <FormControl fullWidth>
//                                     <TextField
//                                         placeholder='Enter Content'
//                                         className='text-area-bulletin text-area-h'
//                                         autoFocus={true}
//                                         InputLabelProps={{ shrink: true }}
//                                         name="content"
//                                         // label="About Company"
//                                         // value={formData.aboutCompany} 
//                                         // onChange={handleChange} 
//                                         multiline rows={8} />
//                                 </FormControl>
//                             </div>
//                         </div>
//                         <div>
//                             <Button variant='contained' type='submit' className='mr-15px'>Post</Button>
//                             <Button variant='contained' color='secondary' type='button' onClick={() => window.location.reload()}>Cancel</Button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }

// export default CreateBulletin

import { Box, Radio, FormControl, FormLabel, FormControlLabel, RadioGroup, Checkbox, TextField, Autocomplete, Button } from '@mui/material'
import React, { useState } from 'react'
import Header from '../../Header/Header'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import axios from 'axios';
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const CreateBulletin = () => {
    const [formData, setFormData] = useState({
        system: '',
        checkboxes: [],
        title: '',
        content: ''
    });

    // const top100Films = []; // You need to define this array with your checkbox options

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('./api/v1/bulletin/createBulletin', formData);
            // Optionally, you can reset the form fields here
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className='create-bulletin-wrapper'>
            <Header role='admin' />
            <div className='container'>
                <form onSubmit={handleSubmit}>
                    <Box className='heading-section'>
                        <h4>Create Bulletin</h4>
                        <div className='d-flex'>
                            <FormControl className='select-bulletin-type'>
                                <RadioGroup name='system' className='flex-row' onChange={handleChange}>
                                    <FormControlLabel control={<Radio size="sm" />} label={<p>Select System</p>} value='system' />
                                    <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' />
                                </RadioGroup>
                            </FormControl>
                            <Autocomplete
                                InputLabelProps={{ shrink: true }}
                                multiple
                                id="checkboxes-tags-demo"
                                options={top100Films}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.title}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option.title}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField {...params} label="Checkboxes" placeholder="Favorites" />
                                )}
                                className='default-multi-selectbox flex-grow-1'
                                onChange={(event, value) => setFormData({ ...formData, checkboxes: value })}
                            />
                        </div>
                    </Box>
                    <div className='post-bulletin-content rounded-borders-card padding-20 default-box-shadow-1'>
                        <div className='rounded-borders-card mb-15px'>
                            <TextField fullWidth placeholder='Enter Title' className='bulletin-title' InputLabelProps={{ shrink: true }} id="outlined-basic" variant="outlined" name="title" onChange={handleChange} />
                            <div>
                                <FormControl fullWidth>
                                    <TextField
                                        placeholder='Enter Content'
                                        className='text-area-bulletin text-area-h'
                                        InputLabelProps={{ shrink: true }}
                                        name="content"
                                        onChange={handleChange}
                                        multiline rows={8} />
                                </FormControl>
                            </div>
                        </div>
                        <div>
                            <Button variant='contained' type='submit' className='mr-15px default-btn'>Post</Button>
                            <Button variant='contained' color='secondary' className='default-btn' type='button' onClick={() => window.location.reload()}>Cancel</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBulletin;
