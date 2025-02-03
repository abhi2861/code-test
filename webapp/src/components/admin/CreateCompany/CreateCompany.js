

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../Header/Header'
import callAPI from '../../../commonFunctions/ApiRequests';
import Toaster from '../../shared/components/Toaster/Toaster';
import { Box, Button, FormControl, Grid, TextField, Tooltip, FormHelperText, Typography } from '@mui/material';
import { CircularProgress, } from "@mui/material";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import InputFileIcon from '../../../assets/Icons/input-file-icon.svg'
import EditIcon from '../../../assets/ActionIcons/Edit.svg'
import UploadIcon from '../../../assets/ActionIcons/upload.svg'
import UploadWhiteIcon from '../../../assets/ActionIcons/upload-white.svg'
import DeleteIcon from '../../../assets/ActionIcons/delete-red-fill.svg'
import './CreateCompany.scss'
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';
import Footer from '../../Footer/Footer';






const CreateCompany = () => {

    const navigate = useNavigate()
    const location = useLocation();
    // let locationName = location && location.state ? JSON.parse(location.state) : "";
    let locationName = location && location.state ? location.state : "";




    // const { userDetails } = useSelector((state) => state?.auth?.user) // need to take from redux
    const userData = JSON.parse(localStorage.getItem('userDetails'))


    //state declaration
    const [baseImage, setBaseImage] = useState("");
    const [uploadFile, setUploadFile] = useState("");
    const [optinalUpload, setOptinalUpload] = useState(null)
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        loggedInId: userData?.id || '',
        name: '',
        description: '',
        logo: {
            fileType: "",
            base64Data: "",
            fileName: ""
        },
        companyProfile: null
    });

    //for toaster 
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: ""
    })
    //for loader
    const [loading, setLoading] = useState(false);

    function validateRequired(value, fieldName) {
        if (fieldName === 'name' && !value.trim()) {
            return `Company name is required`;
        }
        if (fieldName === 'description' && !value.trim()) {
            return `Company description is required`;
        }
        return '';
    }



    const handleSubmit = (e) => {
        e.preventDefault();


        const formErrors = {};

        if (!formData.name.trim()) {
            formErrors.name = "Company name is required";
        }

        if (!formData.description.trim()) {
            formErrors.description = "Company description is required";
        }
        if (!uploadFile) {
            formErrors.logo = "Please upload a logo";
        }

        // Check if there are any errors
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setLoading(true)



        const data = {
            id: formData.id,
            loggedInId: formData.loggedInId,
            name: formData.name,
            description: formData.description,
            logo: formData.logo,
            companyProfile: formData.companyProfile
        };

        callAPI.post('./api/v1/company/companyCreate', data)
            .then(response => {
                if (response.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message,
                    });
                    setOptinalUpload(null)
                    setUploadFile(null)
                    setFormData({
                        loggedInId: userData?.id || '',
                        name: '',
                        description: '',
                        logo: typeof logo === 'string' ? null : {
                            fileType: "",
                            base64Data: "",
                            fileName: ""
                        },
                        companyProfile: typeof companyProfile === 'string' ? null : {
                            fileType: "",
                            base64Data: "",
                            fileName: ""
                        }

                    })
                    if (locationName && locationName.type === 'edit') {
                        locationName.companydata.logo = '';
                        locationName.companydata.companyProfile = '';
                    }
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

        setErrors({});

    };

    //cancel the form
    const handleCancelForm = () => {
        // window.location.reload()
        setFormData({})
        navigate('/adminDashboard', { state: { tabValue: '2' } })
    }



    //only accept image file
    const isImage = (file) => {
        const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
        return file && acceptedImageTypes.includes(file.type);
    };


    //for company logo
    const uploadImage = async (e) => {
        const file = e.target.files[0]
        if (file && isImage(file)) {
            setUploadFile(file);
            const base64 = await convertToBase64(file);
            setBaseImage(base64)
            setFormData({
                ...formData,
                logo: {
                    fileType: file.type,
                    base64Data: base64,
                    fileName: file.name
                },
            });

        } else {
            setToasterData({
                show: true,
                type: "error",
                message: " File should be image, jpg, png and svg only"
            });
        }
    }

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
    }

    const removeFile = (value) => {
        if (value === 'logo') {
            setUploadFile('')
            setFormData(
                {
                    ...formData,
                    logo: {
                        fileType: "",
                        base64Data: "",
                        fileName: ""
                    },
                }
            );

            if (locationName && locationName.type === 'edit') {
                locationName.companydata.logo = '';
            }


        } else {
            setOptinalUpload(null)
            setFormData(
                {
                    ...formData,
                    companyProfile: null
                }
            )
            if (locationName && locationName.type === 'edit') {
                locationName.companydata.companyProfile = '';
            }

        }
    }


    //for uploading optional file 
    const uploadoptinalFile = async (e) => {

        // Set the error to null
        setErrors((prevErrors) => ({ 
            ...prevErrors,
            fileSizeError: null
        }));

        const file = e.target.files[0];
        const maxSize = 8 * 1024 * 1024
        if (file && file.size <= maxSize) {
        if (file && !isExcelFile(file)) { // Check if the file is not an Excel sheet
            setOptinalUpload(file);
            const base64 = await convertToBase64(file);
            setFormData({
                ...formData,
                companyProfile: {
                    fileType: file.type,
                    base64Data: base64,
                    fileName: file.name
                }
            });
        }}
        else if (file && file.size > maxSize) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                fileSizeError: 'File size exceeds 8MB limit.'
            }));
          }
        else {
            setToasterData({
                show: true,
                type: "error",
                message: 'File type not supported. Please select a different file.'
            });
        }
    }

    // Function to check if the file is an Excel sheete
    const isExcelFile = (file) => {
        const acceptedExcelTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        return file && acceptedExcelTypes.includes(file.type);
    };

    //two way binding
    const handleChange = (e) => {

        const { name, value } = e.target;
        let newErrors = { ...errors };

        const trimmedValue = value.trim();

        const errorMessage = validateRequired(value, name);
        if (errorMessage) {
            newErrors[name] = errorMessage;
        } else {
            delete newErrors[name];
        }

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setErrors(newErrors);

    };

    //edit data set into form
    useEffect(() => {

        if (locationName && locationName?.type === 'edit') {
            setFormData({
                id: locationName?.companydata?.id,
                loggedInId: userData?.id || '',
                name: locationName?.companydata?.name,
                description: locationName?.companydata?.description,
                logo: locationName?.companydata?.logo,
                companyProfile: locationName?.companydata?.companyProfile
            })
            setUploadFile(locationName?.companydata?.logo)
        }
    }, [locationName?.type])

    const base64toUrl = async (url) => {
        const r = await fetch(url);
        const blob = await r.blob();
        const blobcreate = URL.createObjectURL(blob);
        const newWindow = window.open(blobcreate, '_blank');
        if (newWindow) {
            return newWindow.focus();
        } else {
           return setToasterData({
                show: true,
                type: "error",
                message: 'Please allow popups for this site.'
            });
        }
        // return window.open(blobcreate, "_blank");
    }

    const openPdfUrl = (url) => {
        if (locationName.type === 'edit') {
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
                newWindow.focus();
            } else {
                setToasterData({
                    show: true,
                    type: "error",
                    message: 'Please allow popups for this site.'
                });
            }
        } else {
            base64toUrl(url)
        }


    };

    //for close toaster
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };


    return (
        <div className='create-company-wrapper pageWrapperFix'>
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
            <div className='container flex-grow-1'>
                <Box className='heading-section'>
                    <h4>Create Company</h4>
                </Box>
                <div className='create-company-modal rounded-borders-card padding-20 default-box-shadow-1'>
                    <form onSubmit={handleSubmit}>
                        <Grid container className='d-flex flex-no-wrap createCompanyForm'>
                            <div className='company-details-row'>
                                {/* this is for upload logo */}
                                <Grid item className='mb-15px d-flex align-items-start'>
                                    <div className='d-flex position-relative mr-20px'>
                                        <div className='position-relative upload-company-logo'>
                                            <FormControl fullWidth id="outlined-basic" name="name" label="Company Name">
                                                {/* {
                                                    locationName?.type || uploadFile?.name ?
                                                        <div className='display-company-logo'>
                                                            <img
                                                                src={uploadFile?.name ? baseImage : locationName?.companydata?.logo}
                                                                height='30px' width='30px' />
                                                        </div>
                                                        : null
                                                } */}
                                                {
                                                    locationName?.type || uploadFile?.name ?
                                                        <div className='display-company-logo'>
                                                            {
                                                                uploadFile?.name ? <img src={baseImage} /> : (locationName?.companydata?.logo) ?
                                                                    <img
                                                                        src={uploadFile?.name ? baseImage : locationName?.companydata?.logo}
                                                                        height='30px' width='30px' />
                                                                    : ''
                                                            }

                                                        </div>
                                                        : null
                                                }



                                            </FormControl>

                                        </div>
                                        <div className='upload-file-wrap'>
                                            {uploadFile && uploadFile.name || locationName?.companydata?.logo ?
                                                <div className='remove-logo'>
                                                    <Button variant='contained'
                                                        onClick={() => { removeFile('logo') }} className='upload-action-btn'>
                                                        {/* <img src={EditIcon} /> */}
                                                        <CustomTooltip title='Remove' placement='top'>
                                                            <img src={DeleteIcon} />
                                                        </CustomTooltip>
                                                    </Button>
                                                </div> :
                                                <div className='upload-logo'>
                                                    <Button variant='outlined' color='primary' className='upload-action-btn'>
                                                        <img src={UploadIcon} className='upload-grey' />
                                                        <img src={UploadWhiteIcon} className='upload-white' />
                                                        UPLOAD LOGO
                                                        <input
                                                            accept=".jpg, .jpeg, .png, .svg"
                                                            type="file"
                                                            name='logo'
                                                            onChange={(e) => { uploadImage(e) }}
                                                        />
                                                    </Button>
                                                    <div>
                                                        <small className='supported-file'>JPG, PNG, JPEG, SVG</small>
                                                    </div>
                                                    {errors.logo && (<FormHelperText className='logoError'>{errors.logo}</FormHelperText>)}
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    <div className='createCompanyinputs'>
                                        <TextField
                                            fullWidth
                                            autoFocus={true}
                                            InputLabelProps={{ shrink: true }}
                                            id="outlined-basic"
                                            name="name"
                                            label="Company Name"
                                            value={formData?.name || ''}
                                            onChange={handleChange}
                                            variant="outlined"
                                            autoComplete="off"
                                            className='company-name-field'
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.charAt(0).toUpperCase() + errors.name.slice(1) : ''}
                                        />
                                        <div className='d-flex  upload-company-profile'>
                                            <div className='input-field-wrapper position-relative'>
                                                <FormControl fullWidth>
                                                    <div className='upload-file-wrap'>
                                                        <span className='upload-icon'><img src={InputFileIcon} /></span>
                                                        <div className='upload-file-text'>
                                                            <>
                                                                <p>Upload Company Profile</p>
                                                                {/* <div style={{ position: 'absolute', bottom: "56px", backgroundColor: " #fff", color: "rgba(0, 0, 0, 0.6)", padding: "0 5px", left: "15px", fontWeight: "400" }}><p>Company Profile</p></div> */}
                                                                <small className='d-flex align-items-center'>
                                                                    {(optinalUpload && optinalUpload?.name) ? <small className='line-clamp-1'>{optinalUpload?.name}</small> : <small>JPG, PNG, XML, PDF <br/>Max upload file size: 8MB</small>}
                                                                    {
                                                                        // locationName?.type || locationName?.companydata?.companyProfile || optinalUpload?.name ?
                                                                        (locationName?.companydata?.companyProfile || optinalUpload) ?
                                                                            <>
                                                                                <CustomTooltip title="View" placement="right">
                                                                                    <RemoveRedEyeIcon onClick={() => { locationName?.companydata?.companyProfile ? openPdfUrl(locationName?.companydata?.companyProfile) : base64toUrl(formData?.companyProfile?.base64Data) }} className='cursor-pointer ml-5px view-doc' />
                                                                                </CustomTooltip>
                                                                            </>
                                                                            : ''
                                                                    }
                                                                </small>
                                                            </>
                                                        </div>
                                                        {optinalUpload && optinalUpload?.name || locationName?.companydata?.companyProfile ?
                                                            <Button variant='contained' color='secondary' onClick={() => { removeFile('companyprofile') }} className='upload-action-btn' >REMOVE FILE</Button> :
                                                            <Button variant='outlined' className='upload-action-btn'>
                                                                SELECT FILE
                                                                <input
                                                                    type="file"
                                                                    name='companyprofile'
                                                                    onChange={(e) => { uploadoptinalFile(e) }}
                                                                />
                                                            </Button>
                                                        }
                                                    </div>
                                                </FormControl>
                                            </div>

                                        </div>
                                        {errors?.fileSizeError && (<p className=' error-text'>{errors.fileSizeError}</p>)}

                                    </div>
                                </Grid>
                            </div>

                            <Grid item lg={12} className='mb-15px about-us-company'>
                                <FormControl fullWidth>
                                    <TextField
                                        className='text-area-h'
                                        autoFocus={true}
                                        InputLabelProps={{ shrink: true }}
                                        name="description"
                                        label="About Company"
                                        value={formData?.description}
                                        onChange={handleChange} multiline rows={4}
                                        error={!!errors.description}
                                        helperText={errors.description ? errors.description.charAt(0).toUpperCase() + errors.description.slice(1) : ''}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <div className='create-company-action'>
                            <Button className='default-btn' variant='contained' type='submit'> {loading ? <CircularProgress size={24} /> : locationName?.type ? "Update" : "Create"}</Button>
                            <Button className='default-btn' variant='contained' color='secondary' type='button' onClick={() => { handleCancelForm(); setLoading(false) }}>Cancel</Button>
                        </div>
                    </form>
                </div>
            </div >
            <Footer />
        </div >
    );
};

export default CreateCompany;
