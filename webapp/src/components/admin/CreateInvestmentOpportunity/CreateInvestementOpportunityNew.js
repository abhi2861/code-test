
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../../Header/Header";
import NumericInput from "../../shared/components/NumericInput/NumericInput";

import { Box, Stack, TextField, Button, Typography, FormControl, Grid, CircularProgress, Tooltip } from '@mui/material'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import callAPI from '../../../commonFunctions/ApiRequests';
import { currencifyInDollars, formatDate, convertToBaseFormatDate } from '../../../commonFunctions/CommonMethod';
import Toaster from '../../shared/components/Toaster/Toaster';
import './CreateInvestmentOpportunity.css'
import CustomSelect from '../../shared/components/CustomSelect/CustomSelect';
import InputFileIcon from '../../../assets/Icons/input-file-icon.svg'
import { base64toUrl } from '../../../commonFunctions/CommonMethod';
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';
import Footer from '../../Footer/Footer';

const CreateInvestmentOpportunityNew = () => {
    const location = useLocation();
    const locationName = location && location.state ? JSON.parse(location.state) : "";
    const navigate = useNavigate()
    const userData = JSON.parse(localStorage.getItem('userDetails'))
    let invStartDate =  convertToBaseFormatDate(locationName?.Investmentdata?.startDate)
    let invEndDate = convertToBaseFormatDate(locationName?.Investmentdata?.endDate)

    let reformattedStartDate = invStartDate?.split('-').reverse().join('-').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1-$3-$2');
    let reformattedEndDate = invEndDate?.split('-').reverse().join('-').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1-$3-$2');

    const investmentEditData = locationName && locationName?.type === 'edit' && locationName.Investmentdata ? {
        id: locationName.Investmentdata.id,
        name: locationName.Investmentdata.name,
        minAmount: locationName.Investmentdata.minAmount,
        perUnitPrice: locationName.Investmentdata.perUnitPrice,
        startDate: reformattedStartDate,
        endDate: reformattedEndDate,
        carry: locationName.Investmentdata.carry + '%',
        templateId: locationName.Investmentdata.templateId,
        description: locationName.Investmentdata.description,
        companyId: locationName.Investmentdata.companyId,
        documents: locationName.Investmentdata.documents,
    } : {}


    const [InvestmentData, setInvestmentData] = useState(investmentEditData ? investmentEditData : {})
    const [showError, setShowError] = useState();
    const [selectedValue, setSelectedValue] = useState(null);
    const [companylist, setCompanylist] = useState()
    const [optionalUpload, setOptionalUpload] = useState(null)
    const [loading, setLoading] = useState(false);
    const [toasterData, setToasterData] = useState({
        show: false,
        type: '',
        message: ''
    })
    const [templatelist, setTemplatelist] = useState()
    const [selectedTemp, setSelectedTemp] = useState(null)
    const [showEye, setShowEye] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: {
            fileType: "",
            base64Data: "",
            fileName: ""
        },
    });
    // const location = useLocation();
    // const locationName = location && location.state ? JSON.parse(location.state) : "";
    // const locationName = location && location.state ? location.state : "";
    const currentDate = new Date();
    let currentFormatedDate = convertToBaseFormatDate(currentDate.toISOString())
    let reformatcurrentDate = currentFormatedDate?.split('-').reverse().join('-').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1-$3-$2');



    const validate = (value, fieldName) => {


        value = String(value);
        if (!value.trim()) {
            switch (fieldName) {
                case 'carry':
                    return `Carry is required`;
                case 'startDate':
                    return `Start date is required`;
                case 'perUnitPrice':
                    return `Per unit price is required`;
                case 'endDate':
                    return `End date is required`;
                case 'minAmount':
                    return `Minimum amount is required`;
                case 'companyId':
                    return `Company is required`;
                // case 'templateName':
                //     return `Template is required`;
                case 'name':
                    return `Investment name is required`;
                default:
                    break;
            }
        }
        return '';

    }

    const twoWayBind = (key, value) => {
        let error = { ...showError }
        const errorMessage = validate(value, key);
        if (key === 'startDate' && InvestmentData.endDate && new Date(value) > new Date(InvestmentData.endDate)) {
            error.endDate = 'End date must be greater than start date';
        }
        else {
            delete error.endDate;
        }
        if (errorMessage) {
            error[key] = errorMessage;
        }
        else {
            delete error[key];
        }

        setInvestmentData({
            ...InvestmentData,
            [key]: value
        });
        setShowError(error);
    }


    const handleChange = (key, value) => {
        setSelectedValue(value);

        const companyIdError = validate(value, key);
        setShowError((prevErrors) => ({
            ...prevErrors,
            companyId: companyIdError,
        }));

        setInvestmentData({
            ...InvestmentData,
            companyId: value
        })
    };


    const handletemplateChange = (key, value) => {

        setSelectedTemp(value)
        const templateNameError = validate(value, key);
        setShowError((prevErrors) => ({
            ...prevErrors,
            templateName: templateNameError,
        }));

        setInvestmentData({
            ...InvestmentData,
            templateId: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const formErrors = {};

        if (!InvestmentData.carry) {
            formErrors.carry = "Carry number is required";
        }

        if (!InvestmentData.startDate) {
            formErrors.startDate = "Start date is required";
        }

        if (!InvestmentData.endDate) {
            formErrors.endDate = "End date is required";
        }

        if (!InvestmentData.minAmount) {
            formErrors.minAmount = "Minimum amount is required";
        }

        if (new Date(InvestmentData.endDate) <= new Date(InvestmentData.startDate)) {
            formErrors.endDate = "End date must be greater than start date";
        }


        if (!InvestmentData.companyId && !locationName?.companyData?.id) {
            formErrors.companyId = "Company is required";
        }

        // if (!InvestmentData.templateId) {
        //     formErrors.templateName = "Template is required";
        // }

        if (!InvestmentData.name) {
            formErrors.name = "Investment name is required";
        }

        if (!InvestmentData.perUnitPrice) {
            formErrors.perUnitPrice = `Per unit price is required`
        }

        if (Object.keys(formErrors).length > 0) {
            setShowError(formErrors);
            return;
        }

        const updatecarry = InvestmentData?.carry.replace(/[^0-9.]/g, '');
        const updateAmount = InvestmentData?.minAmount.replace(/[^0-9.]/g, '');

        let updatedperUnitPrice = InvestmentData?.perUnitPrice;

        if(locationName?.Investmentdata?.investmentStatus !== "ActiveInvestment")
        {
            updatedperUnitPrice = InvestmentData?.perUnitPrice.replace(/[^0-9.]/g, '');
        }

        const selectedCompany = companylist.filter(company => selectedValue === company.id);

        setLoading(true)

        const req = {
            ...InvestmentData,
            companyId: InvestmentData?.companyId || locationName?.companyData?.id,
            name: InvestmentData?.name,
            minAmount: updateAmount,
            perUnitPrice: updatedperUnitPrice,
            startDate: InvestmentData?.startDate,
            endDate: InvestmentData?.endDate,
            userId: locationName?.loggedInId || userData?.id || null,
            carry: updatecarry,
            documents: InvestmentData?.documents || null,
            description: InvestmentData?.description,
            // templateId: InvestmentData?.templateId,
            fmvValue: selectedCompany[0]?.fmvValue,
            id: investmentEditData.id
        }
        callAPI.post('./api/v1/investment/createInvestmentOpportunity', req)
            .then((response) => {
                if (response.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message,
                    });
                    resetForm();
                    setTimeout(() => { navigate('/adminDashboard', { state: { tabValue: '3' } }) }, 1000)
                    setLoading(false)
                }
                else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                    setLoading(false)
                }
            })

        setShowError({});
    }

    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };

    const resetForm = () => {
        setInvestmentData({})
        setSelectedValue(null)
        setOptionalUpload(null)
    }

    //cancel the form
    const handleCancelForm = () => {
        // window.location.reload()
        resetForm()
        navigate('/adminDashboard', { state: { tabValue: '3' } })
    }


    const getCompany = () => {

        callAPI.get('./api/v1/company/getCompany')
            .then((response) => {
                if (response?.status === 200) {
                    const newData = response.data?.data?.map((item) => ({
                        value: item?.id,
                        id: item?.id,
                        label: item?.name,
                        image: item?.logo,
                        fmvValue: item?.fmvValue

                    }))

                    setCompanylist(newData)

                    let companyId = investmentEditData && investmentEditData.companyId ? investmentEditData.companyId : locationName?.companyData?.id

                    const matchedCompany = newData.filter(company => companyId === company.id);
                    if (matchedCompany.length > 0) {
                        setSelectedValue(matchedCompany[0]?.id);
                    }
                }
            })
    }

    const getTemplate = () => {
        callAPI.get('./api/v1/pandadocapis/getTemplatesByTable')
            .then((response) => {
                if (response?.status === 200) {
                    const newData = response.data?.data?.map((item) => ({
                        value: item?.id,
                        label: item?.templateName,
                    }))

                    if (locationName && locationName.Investmentdata) {
                        setSelectedTemp(locationName.Investmentdata?.templateId)
                    }
                    setTemplatelist(newData)
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                }
            })
    }

    useEffect(() => {
        getCompany();
        getTemplate()
    }, [])
    //update opportunity data

    // useEffect(() => {

    //     if (locationName && locationName?.type === "updateOpportunity") {
    //         setInvestmentData({
    //             companyId: locationName?.Investmentdata?.companyId || '',
    //             name: locationName?.Investmentdata?.name || '',
    //             minAmount: locationName?.Investmentdata?.minAmount || '',
    //             pricePerUnit: locationName?.Investmentdata?.pricePerUnit || '',
    //             startDate: locationName?.Investmentdata?.startDate,
    //             endDate: locationName?.Investmentdata?.endDate,
    //             userId: locationName?.Investmentdata?.loggedInId || userData?.id || null,
    //             carry: locationName?.Investmentdata?.carry,
    //             documents: locationName?.Investmentdata?.document || null,
    //             description: locationName?.Investmentdata?.document || '',
    //             templateId: locationName?.Investmentdata?.templateId || '',
    //             // fmvValue: selectedValue?.fmvValue,
    //         })
    //         setOptionalUpload(locationName?.Investmentdata?.document)
    //     }

    // }, [locationName && locationName.type === "updateOpportunity"])

    // useEffect(() => {

    //     if (locationName && locationName?.Investmentdata) {
    //         setOptionalUpload(locationName?.Investmentdata?.documents)
    //     }

    // }, [locationName && locationName.Investmentdata])



    //for uploading optional file 
    const uploadoptionalFile = async (e) => {
        const file = e.target.files[0];


        const maxSize = 8 * 1024 * 1024
        if (file && file.size <= maxSize) {
            if (file && !isExcelFile(file)) {
                setOptionalUpload(file);
                const base64 = await convertToBase64(file);
                setFormData({
                    ...formData,
                    companyProfile: {
                        fileType: file.type,
                        base64Data: base64,
                        fileName: file.name
                    }
                });
                setInvestmentData({
                    ...InvestmentData,
                    documents: {
                        fileType: file.type,
                        base64Data: base64,
                        fileName: file.name
                    }
                });
                setShowEye(true);
                setShowError((prevErrors) => ({
                    ...prevErrors,
                    fileSizeError: ''
                }));
            }
        }
        else if (file && file.size > maxSize) {
            setShowError((prevErrors) => ({
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

    // convert file to base64
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
    // for view pdf
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

    //for remove
    const removeFile = () => {
        setShowEye(false);
        setOptionalUpload(null)
        setInvestmentData(
            {
                ...InvestmentData,
                documents: null
            }
        )
        if (locationName) {
            locationName.Investmentdata.documents = '';
        }
    }
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


            <div className='container investment-opportunity-wrapper flex-grow-1'>
                <Box className='heading-section'>
                    <h4>Create Investment Opportunity</h4>
                </Box>
                <div className='IOpportunityMain rounded-borders-card padding-20 default-box-shadow-1'>
                    <form onSubmit={handleSubmit} className='CInvestmentOpportunityForm'>
                        <h3 className='mb-25px'>Investment Opportunity Details</h3>
                        {/* Investment Name */}
                        <Grid container className='three-col-fields'>
                            <Grid lg={3.8} item>
                                {/* Select a company */}
                                <CustomSelect
                                    options={companylist}
                                    value={selectedValue}
                                    onChange={(key, option) => handleChange('companyId', option)}
                                    Obejctkey={'companyId'}
                                    sx={{ width: '50%' }}
                                    label="Select company"
                                    error={!!showError?.companyId}
                                    helperText={showError?.companyId}
                                />
                            </Grid>
                            <Grid lg={3.8} item>
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    //   sx={{ width: "50%" }}
                                    fullWidth
                                    label="Investment Name"
                                    id="name"
                                    type="text"
                                    value={InvestmentData?.name || ""}
                                    onChange={(e) => {
                                        twoWayBind("name", e.target.value);
                                    }}
                                    error={!!showError?.name}
                                    helperText={showError?.name}
                                />
                            </Grid>
                            <Grid lg={3.8} item>
                                {/* Minimum Amount */}
                                <NumericInput
                                    label="Minimum Amount"
                                    value={InvestmentData?.minAmount || ""}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                    decimalScale={2}
                                    allowNegative={false}
                                    onChange={(e) => {
                                        twoWayBind("minAmount", e.target.value);
                                    }}
                                    customInput={TextField}
                                    error={!!showError?.minAmount}
                                    helperText={showError?.minAmount}
                                    disabled={locationName?.Investmentdata?.investmentStatus === "ActiveInvestment" ? true : false}
                                />
                            </Grid>
                            <Grid lg={3.8} item>
                                {/* Price per Unit */}
                                <NumericInput
                                    label="Per Unit Price"
                                    value={InvestmentData?.perUnitPrice || ""}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                    decimalScale={2}
                                    allowNegative={false}
                                    onChange={(e) => {
                                        twoWayBind("perUnitPrice", e.target.value);
                                    }}
                                    customInput={TextField}
                                    error={!!showError?.perUnitPrice}
                                    helperText={showError?.perUnitPrice}
                                    disabled={locationName?.Investmentdata?.investmentStatus === "ActiveInvestment" ? true : false}
                                />
                            </Grid>
                            <Grid lg={3.8} item>
                                {/* Start Date */}
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    label="Start Date"
                                    type="date"
                                    name="Date"
                                    defaultValue=""
                                    fullWidth
                                    value={InvestmentData?.startDate || ''}
                                    onChange={(e) => { twoWayBind('startDate', e.target.value) }}
                                    error={!!showError?.startDate}
                                    helperText={showError?.startDate}
                                    inputProps={{
                                        min: locationName?.type === "edit" ? '' : reformatcurrentDate

                                    }}
                                />
                            </Grid>
                            {/* End Date */}
                            <Grid lg={3.8} item>
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    label="End Date"
                                    type="date"
                                    name="Date"
                                    defaultValue=""
                                    fullWidth
                                    value={InvestmentData?.endDate || ''}
                                    onChange={(e) => { twoWayBind('endDate', e.target.value) }}
                                    error={!!showError?.endDate}
                                    helperText={showError?.endDate}
                                    inputProps={{
                                        min: InvestmentData?.startDate || (locationName?.type === "edit" ? '' : reformatcurrentDate)

                                    }}
                                />
                            </Grid>

                            {/* Carry */}
                            <Grid lg={3.8} item>
                                <NumericInput
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ maxLength: 3 }}
                                    label="Carry"
                                    value={InvestmentData?.carry || ""}
                                    suffix={"%"}
                                    allowNegative={false}
                                    onChange={(e) => {
                                        twoWayBind("carry", e.target.value.slice(0, 2));
                                    }}
                                    customInput={TextField}
                                    error={!!showError?.carry}
                                    helperText={showError?.carry}
                                />
                            </Grid>
                            {/* <Grid lg={3.8} item>
                                <CustomSelect
                                    options={templatelist}
                                    value={selectedTemp}
                                    onChange={(key, option) => handletemplateChange('templateName', option)}
                                    Obejctkey={'templateName'}
                                    sx={{ width: '50%' }}
                                    label="Select Template"
                                    error={!!showError?.templateName}
                                    helperText={showError?.templateName}

                                />
                            </Grid> */}

                            <Grid lg={3.8} item className='flex-50'>
                                {/* Upload File */}
                                <div className='d-flex upload-company-profile'>
                                    <div className='input-field-wrapper position-relative'>
                                        <FormControl fullWidth>
                                            <div className='upload-file-wrap'>
                                                <span className='upload-icon'><img src={InputFileIcon} /></span>
                                                <div className='upload-file-text'>
                                                    <>
                                                        <Typography>Upload Document</Typography>
                                                        <small className='d-flex align-items-center'>
                                                            {(optionalUpload && optionalUpload?.name) ? <small className='line-clamp-1'>{optionalUpload?.name}</small> : <small>JPG, PNG, XML, PDF <br />Max upload file size: 8MB</small>}
                                                            {
                                                               (investmentEditData?.documents || optionalUpload) && showEye  ?
                                                                    <>
                                                                        <CustomTooltip title="View" placement="right">
                                                                            <RemoveRedEyeIcon onClick={() => { investmentEditData?.documents && !optionalUpload?.name ? openPdfUrl(investmentEditData?.documents) : base64toUrl(formData?.companyProfile?.base64Data) }} className='cursor-pointer ml-5px view-doc' />
                                                                        </CustomTooltip>
                                                                    </>

                                                                    : ''
                                                            }

                                                        </small>
                                                    </>
                                                </div>
                                                {optionalUpload && optionalUpload?.name || InvestmentData?.documents ?
                                                    <Button variant='contained' color='secondary' onClick={() => { removeFile('documents') }} className='upload-action-btn' >REMOVE FILE</Button> :
                                                    <Button variant='outlined' className='upload-action-btn'>
                                                        SELECT FILE
                                                        <input
                                                            type="file"
                                                            name='companyprofile'
                                                            onChange={(e) => { uploadoptionalFile(e) }}
                                                        />
                                                    </Button>
                                                }
                                            </div>
                                        </FormControl>

                                    </div>


                                </div>
                                {showError?.fileSizeError && (
                                    <p className=' error-text'>
                                        {showError.fileSizeError}
                                    </p>
                                )}
                            </Grid>
                            <Grid lg={12} item className='flex-100'>
                                {/* Description */}
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ width: "100%" }}
                                    label="Description"
                                    value={InvestmentData?.description || ""}
                                    onChange={(e) => {
                                        twoWayBind("description", e.target.value);
                                    }}
                                    id="description"
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                        </Grid>
                        <Stack direction="row" spacing={2} row>
                            <Button className='default-btn' type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : "Submit"}</Button>
                            <Button className='default-btn' onClick={() => { handleCancelForm() }} color='secondary' variant="contained">Cancel</Button>
                        </Stack>
                    </form>
                </div>
            </div>
            <Footer />
        </div>


    )

}

export default CreateInvestmentOpportunityNew;