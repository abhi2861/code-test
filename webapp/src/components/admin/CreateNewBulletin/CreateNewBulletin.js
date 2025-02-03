import React, { useState } from 'react'
import Header from "../../Header/Header";
import { useLocation, useNavigate } from 'react-router';
import { Box, Stack, TextField, Button, useStepContext, Typography } from '@mui/material'
import { CircularProgress, } from "@mui/material";
import callAPI from '../../../commonFunctions/ApiRequests';
import { formatDate } from '../../../commonFunctions/CommonMethod';
import Toaster from '../../shared/components/Toaster/Toaster';
import Footer from '../../Footer/Footer';



const CreateNewBulletin = () => {

    const navigate = useNavigate()
    const location = useLocation();
    const locationName = location && location.state ? JSON.parse(location.state) : ''




    //state declaration
    const [bulletinForm, setBulletinForm] = useState({
        companyId: locationName?.companyData?.id,
        createdBy: locationName?.loggedInId,
        isPublished: true,
        subject: "",
        message: "",
        publishedDate: "",
        source: "",

    })
    //for toaster
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    //for button loader
    const [loading, setLoading] = useState(false);
    //for error message
    const [errors, setErrors] = useState({});



    const handlecanceform = () => {
        setBulletinForm({})
        navigate('/adminDashboard', { state: { tabValue: '2' } })
    }


    //handling validation
    function validateRequired(value, fieldName) {
        value = String(value);
        if (!value.trim()) {
            switch (fieldName) {
                case 'subject':
                    return `Subject name is required!`;
                case 'publishedDate':
                    return `Published Date is required!`;
                case 'source':
                    return `Source is required!`;
                case 'message':
                    return `Message is required!`;
                default:
                    break;
            }
        }
        return '';
    }

    const twoWayBind = (name, value) => {

        let newErrors = { ...errors };
        const errorMessage = validateRequired(value, name);
        if (errorMessage) {
            newErrors[name] = errorMessage;
        } else {
            delete newErrors[name];
        }

        setErrors(newErrors);

        setBulletinForm({
            ...bulletinForm,
            [name]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        for (const key in bulletinForm) {
            const errorMessage = validateRequired(bulletinForm[key], key);
            if (errorMessage) {
                newErrors[key] = errorMessage;
            }
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }


        callAPI.post('./api/v1/bulletin/createBulletin', bulletinForm)
            .then((response) => {
                if (response.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message,
                    });
                    setLoading(false)
                    setTimeout(() => {
                        navigate('/adminDashboard', { state: { tabValue: '2' } })
                    }, 2000);
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                    setLoading(false)
                }
            })
    }

    //for toaster
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };


    return (

        <div className='pageWrapperFix'>
            <Header role='admin' />
            {toasterData && (
                <Toaster
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}
            <div className='container create-bulletins-wrapper flex-grow-1'>
                <Box className='heading-section'>
                    <h4>Create Bulletin</h4>
                </Box>
                <div className='rounded-borders-card padding-20 default-box-shadow-1'>
                    <Box
                        elevation={0}
                        onSubmit={handleSubmit}
                        component="form"
                    >
                        <Stack spacing={2}>
                            <Stack spacing={2}>

                                <h3>Bulletin Details</h3>

                                <Stack className='create-bulletin-fields field-row-mobile' sx={{ marginTop: '10%' }} direction={"row"} spacing={2}>
                                    <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Subject"
                                        margin="normal"
                                        type="text"
                                        value={bulletinForm?.subject || ''}
                                        onChange={(e) => { twoWayBind('subject', e.target.value) }}
                                        error={!!errors.subject}
                                        helperText={errors.subject}
                                    />

                                    <TextField
                                        label="Date"
                                        type="date"
                                        name="Date"
                                        defaultValue=""
                                        fullWidth
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        value={bulletinForm?.publishedDate || ''}
                                        onChange={(e) => { twoWayBind('publishedDate', e.target.value) }}
                                        error={!!errors.publishedDate}
                                        helperText={errors.publishedDate}
                                    />

                                    <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Source"
                                        margin="normal"
                                        type="text"
                                        value={bulletinForm?.source || ''}
                                        onChange={(e) => { twoWayBind('source', e.target.value) }}
                                        error={!!errors.source}
                                        helperText={errors.source}
                                    />
                                </Stack>
                            </Stack>

                            <Stack spacing={2} className='field-row-mobile'>

                                <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                                    <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Message"
                                        margin="normal"
                                        type="text"
                                        multiline
                                        rows={4}
                                        value={bulletinForm?.message || ''}
                                        onChange={(e) => { twoWayBind('message', e.target.value) }}
                                        error={!!errors.message}
                                        helperText={errors.message}
                                    />

                                </Stack>
                            </Stack>
                            <Stack direction="row" spacing={2} row>
                                <Button
                                    className='default-btn'
                                    type="submit"
                                    color='primary'
                                    variant="contained"
                                >
                                    {loading ? <CircularProgress size={24} /> : " Create"}
                                </Button>

                                <Button
                                    className='default-btn'
                                    variant="contained"
                                    color='secondary'
                                    onClick={() => { handlecanceform(); setLoading(false) }}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        </Stack>

                    </Box>
                </div>
            </div>
            
            <Footer />

        </div>


    )

}

export default CreateNewBulletin;