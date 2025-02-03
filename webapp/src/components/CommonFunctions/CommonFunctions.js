import React from 'react'
import { Grid, Radio, FormControl, FormControlLabel, RadioGroup, TextField, Button } from '@mui/material'
import './CommonFunctions.css'
import InputFileIcon from '../../assets/Icons/input-file-icon.svg'

const CommonFunctions = () => {
    return (
        <div className='common-functions-panel border-left-D9D9D9'>
            <h3 className='padding-10 border-bottom-D9D9D9'>Common Functions</h3>
            <div className='padding-10 border-bottom-D9D9D9'>
                <b>Authorization</b>
                <div>
                    <FormControl>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>JWT Authorization</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>
            <div className='padding-10 border-bottom-D9D9D9'>
                <b>Email Functions</b>
                <div>
                    <FormControl>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>SMTP</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                    <FormControl>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>Send Grid</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>
            <div className='padding-10 border-bottom-D9D9D9'>
                <b>File Upload</b>
                <div>
                    <FormControl>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>S3</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                    <FormControl>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>Azure</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                    <FormControl className='mb-15px'>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>System File</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField
                            placeholder='Enter Blob Address'
                            className='text-area-bulletin text-area-h'
                            InputLabelProps={{ shrink: true }}
                            name="content"
                            label='Blob Address'
                        // onChange={handleChange} 
                        />
                    </FormControl>
                </div>
            </div>
            <div className='padding-10 border-bottom-D9D9D9'>
                <b>Logging</b>
                <div>
                    <FormControl>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>Database</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                    <FormControl>
                        <RadioGroup name='system' className='flex-row'
                            onChange={() => { }}
                        >
                            <FormControlLabel control={<Radio size="sm" />} label={<p>Hard Disk</p>} value='system' />
                            {/* <FormControlLabel control={<Radio size="sm" />} label={<p>Select Company</p>} value='company' /> */}
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>
        </div>
    )
}

export default CommonFunctions