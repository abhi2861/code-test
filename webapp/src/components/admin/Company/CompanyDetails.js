import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Modal, Button, Tooltip, FormControl, Typography, Table } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { CircularProgress, } from "@mui/material";
import callAPI from '../../../commonFunctions/ApiRequests';
import { formatCurrency } from '../../../commonFunctions/ConvertIntoCurrency';
import { convertToBaseFormatDate, currencifyInDollars, formatDate,  isExcelFile, convertToBase64 } from '../../../commonFunctions/CommonMethod';
import CustomizedMenus from '../../shared/components/DropdownMenu/CustomizedMenus';
import Toaster from '../../shared/components/Toaster/Toaster';
import Loader from '../../shared/components/Loader/Loader';
import NumericInput from '../../shared/components/NumericInput/NumericInput';
import AddSurvey from '../../../assets/ActionIcons/Add-Survey.svg'
import ConfirmPopUp from '../../shared/components/ConfirmPopUp/ConfirmPopUp';
import { ReactTable } from '../../shared/components/ReactTable/ReactTable'
import InputFileIcon from '../../../assets/Icons/input-file-icon.svg'
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';




const CompanyDetails = (props) => {


    const navigate = useNavigate()
    const userData = JSON.parse(localStorage.getItem('userDetails'))
    const currentDate = new Date(); // Get current date
    let currentFormatedDate = convertToBaseFormatDate(currentDate.toISOString())
    let reformatcurrentDate = currentFormatedDate?.split('-').reverse().join('-').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1-$3-$2');

    //state for companies data
    const [companyData, setCompanyData] = useState([])
    const [columns, setColumns] = useState([])
    //for modal box
    const [isModalOpen, setIsModalOpen] = useState(false);
    //for Confirmation modal box
    const [confirmModel, setConfirmModel] = useState(false);
    //form for suervey
    const [surveyform, setSurveyForm] = useState({
        companyId: null,
        loggedInId: userData?.id,
        startDate: "",
        endDate: "",
        investmentRange: ``,
        name: '',
        description: '',
        documents: null

    })
    const [optionalUpload, setOptionalUpload] = useState(null)
    const [deleteCompanyId, setDeleteCompanyId] = useState('')
    //for toaster
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false);
    const[deleteModel,setDeleteModel]=useState(false)
    const[deleteId,setDeleteId]=useState('')



    //edit company
    const handleEdit = (data) => {
        const updatedCompanyData = { ...data, innerJSX: null };
        navigate('/CreateCompany', { state: { type: "edit", companydata: updatedCompanyData } })

    }

    //delete company
    const handleConfirmModal = (id) => {
        setConfirmModel((s) => !s);
        setDeleteCompanyId(id);
    }

    const handleDeleteAPI = (id) => {
        if (id) {
            callAPI.del(`./api/v1/company/deleteCompany?id=${id}`)
                .then((response) => {
                    if (response.status === 200) {
                        setToasterData({
                            show: true,
                            type: "success",
                            message: response?.data?.message,
                        });
                        setConfirmModel(false)
                        getCompanyData();
                    } else {

                        setToasterData({
                            show: true,
                            type: "error",
                            message: response?.message,
                        });
                        setConfirmModel(false)
                    }
                })

        }
    }
    
    const deleteCompany = (id) => {
        if (id) {
            callAPI.del(`./api/v1/company/deleteCompany?id=${id}`)
                .then((response) => {
                    if (response.status === 200) {
                        setToasterData({
                            show: true,
                            type: "success",
                            message: response?.data?.message,
                        });
                        setDeleteModel(false)
                        getCompanyData();
                    } else {

                        setToasterData({
                            show: true,
                            type: "error",
                            message: response?.message,
                        });
                        setDeleteModel(false)
                    }
                })

        }
    }
    

    //for company table
    const getCompanyData = () => {
        setLoading(true)
        // callAPI.get(`./api/v1/company/getCompany?loggedInId=${userData?.id}`)
        callAPI.get(`./api/v1/company/getCompany?status=Closed`)
            .then(response => {
                if (response?.status === 200) {

                    let data = response?.data?.data
                    if (data && data.length > 0) {
                        data = data.map(item => {
                            return (
                                {
                                    "id": item?.id,
                                    "name": item?.name,
                                    "logo": item?.logo,
                                    "companyProfile": item?.companyProfile,
                                    "description": item?.description,
                                    "fmvValue": item?.fmvValue,
                                    "fmvVEffectiveDate": item?.fmvVEffectiveDate,
                                    "fmvVExpirationDate": item?.fmvVExpirationDate,
                                    "fmvlastFairMarketValue": item?.fmvlastFairMarketValue,
                                    "peopleInvested": item?.peopleInvested,
                                    "fundsRaised": item?.fundsRaised,
                                    "innerJSX": item?.investorData && item.investorData.length > 0 ? <tr>
                                        <td colSpan={6} className='innerTable'>
                                            <Table className='company-details-admin-table'>
                                                <thead>
                                                    <th className='investment-name-in-table'>Investment Opportunity</th>
                                                    <th className='name-in-table'>Investor Name</th>
                                                    <th className='invested-amount-in-table text-right'>Invested Amount</th>
                                                    <th className='current-amount-in-table text-right'>Current Amount</th>
                                                </thead>
                                                <tbody>
                                                    {
                                                        item.investorData.map(innerItem => {
                                                            return (
                                                                <tr>

                                                                    <td>{innerItem?.investmentName}</td>
                                                                    <td>{innerItem?.investor}</td>
                                                                    <td className='text-right'>{currencifyInDollars(innerItem?.amount ?? 0.00)}</td>
                                                                    <td className='text-right'>{currencifyInDollars(innerItem?.currentValue ?? 0.00)}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    }

                                                </tbody>
                                            </Table>
                                        </td>
                                    </tr> : null,
                                }
                            )
                        })
                        setCompanyData(data)
                        setLoading(false)
                    }
                    else{
                        setLoading(false)
                    }


                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                   // setLoading(false)
                }
            })
    }

    useEffect(() => {
        getCompanyData();
    }, [])

    useEffect(() => {
        setColumns([
            {
                Header: 'Company',
                accessor: 'name',
                className: 'company-name-in-table text-left',
                Cell: localProps =>
                    <div className='d-flex align-items-center company-info-in-table'>
                        <div className='company-logo-in-table'>
                            <img src={localProps.row.original?.logo} />
                        </div>
                        <b>{localProps.row.original?.name}</b>
                    </div>
            },
            {
                Header: 'No. Of People Invested',
                accessor: 'peopleInvested',
                className: 'text-right people-invested-in-table',
                Cell: localProps =>
                    <p>{localProps.row.original?.peopleInvested ?? 0}</p>
            },
            {
                Header: 'Funds Raised',
                accessor: 'fundsRaised',
                className: 'text-right funds-raised-in-table',
                Cell: localProps =>
                    <p>{currencifyInDollars(localProps.row.original?.fundsRaised) ?? currencifyInDollars(0)}</p>
            },
            {
                Header: 'Fair Market Value',
                accessor: 'fmvValue',
                className: 'text-right fmv-in-table',
                Cell: localProps =>
                    <p>
                        {localProps.value && Number(localProps.value) > 0 ? currencifyInDollars(localProps.value) : '--'}
                        {/* {
                            localProps.row.original?.fmvVEffectiveDate ?
                                ' (' + splitDate(localProps.row.original.fmvVEffectiveDate, true) + ')'
                                : null
                        } */}
                    </p>
            },
            {
                Header: 'Actions',
                accessor: '',
                filter: '',
                Filter: '',
                Cell: localProps =>
                    <div>
                        <CustomizedMenus options={options} icon={menuIcons} onSelect={(option) => handleOptionSelect(option, localProps.row.original?.id, localProps.row.original)} />
                    </div>
            }
        ])
    }, [companyData])


    //modal box
    const handleOpenModal = (id) => {
        setIsModalOpen(true);
        setSurveyForm({
            ...surveyform,
            companyId: id
        })
    };

    const handleCloseModal = () => {
        setTimeout(() => {
            setIsModalOpen(false);
            setErrors({})
        }, 1000)
        setLoading(false);
        setOptionalUpload(null)
        setSurveyForm({});
        setErrors({})
    };

    const handleCancel = () => {
        handleCloseModal();
        setLoading(false);
        setOptionalUpload(null)
        setSurveyForm({});
        setErrors({})
    }

    function validateRequired(value, fieldName) {

        value = String(value);
        if (!value.trim()) {
            switch (fieldName) {
                case 'name':
                    return ` Name is required!`;
                case 'startDate':
                    return `Start date is required`;
                case 'endDate':
                    return `End date is required`;
                case 'investmentRange':
                    return `Investment range is required!`;
                default:
                    break;
            }
        }
        return '';
    }

    const twoWayBind = (key, value) => {

        let newErrors = { ...errors };

        const errorMessage = validateRequired(value, key);
        if (errorMessage) {
            newErrors[key] = errorMessage;
        } else {
            delete newErrors[key];
        }



        setSurveyForm({
            ...surveyform,
            [key]: value
        })

        setErrors(newErrors);
    }


    //--> survey submit
    const submitSurvey = (e) => {
        e.preventDefault();

        const formErrors = {};

        if (!surveyform.name?.trim()) {
            formErrors.name = " Name is required!";
        }

        if (!surveyform.startDate) {
            formErrors.startDate = "Start date is required!";
        }
        if (!surveyform.endDate) {
            formErrors.endDate = "End date is required!";
        }
        if (!surveyform.investmentRange) {
            formErrors.investmentRange = "Investment range is required!";
        }


        // Check if there are any errors
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({})


        const req = {
            ...surveyform,
        }


        setLoading(true)
        callAPI.post('./api/v1/survey/createInterestSurvey', req)
            .then((response) => {
                if (response.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message,
                        autoHideDuration: 1000
                    });
                    setLoading(false)
                    setOptionalUpload(null)
                    setSurveyForm({})


                    handleCloseModal()

                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                    setLoading(false)
                    handleCloseModal()
                }
            })
    }
    //-->



    const handleOptionSelect = (option, columnId, column) => {
       
        // Perform any action you want based on the selected option
        switch (option) {
            case 'Edit':
                handleEdit(column);
                break;
            // case 'Delete Company':
            //     // handleDelete(columnId);
            //     handleConfirmModal(columnId);
            //     break;
            case 'Create Survey':
                handleOpenModal(columnId);
                break;
            case 'Create Investment Opportunity':
                const companyData = {
                    type: 'createInvestment',
                    Investmentdata: column,
                    loggedInId: userData?.id,
                    companyData: {
                        label: column?.name,
                        id: column?.id
                    }
                }

                // navigate('/createInvestementOpportunity', { state: { type: 'createInvestment', companyData: JSON.stringify(column), loggedInId: userData?.id, companyDetails: { label: column?.name, id: column?.id } } })
                // navigate('/createInvestementOpportunity', { state: JSON.stringify(companyData) })
                navigate('/createInvestementOpportunity', { state: JSON.stringify(companyData) })

                break;

            case 'Create Bulletin':
                // handleOpenModal(columnId);
                const companyDetails = {
                    type: 'createBulletin',
                    companyData: column,
                    loggedInId: userData?.id,
                    companyDetails: {
                        label: column?.name,
                        id: column?.id
                    }
                };
                navigate('/CreateNewBulletin', { state: JSON.stringify(companyDetails) })
                // navigate('/CreateNewBulletin', { state: companyDetails })


                break;
            case 'Delete' :
               
               setDeleteModel(true);
               setDeleteId(columnId)
            default:
                break;
        }
    };

    const options = ['Edit', 'Create Survey', 'Create Bulletin', 'Create Investment Opportunity','Delete'];
    const menuIcons = [AddSurvey]
   
    //toaster function
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };


    //for remove
    const removeFile = () => {
        setOptionalUpload(null)
        setSurveyForm(
            {
                ...surveyform,
                documents: null
            }
        )
    }

    //for uploading optional file 
    const uploadoptionalFile = async (e) => {
        const file = e.target.files?.length ? e.target.files[0] : null;
        const maxSize = 8 * 1024 * 1024
        if (file && file.size <= maxSize) {
            if (file && !isExcelFile(file)) { // Check if the file is not an Excel sheet
                setOptionalUpload(file);
                const base64 = await convertToBase64(file);
                setSurveyForm({
                    ...surveyform,
                    documents: {
                        fileType: file.type,
                        base64Data: base64,
                        fileName: file.name
                    }
                });
            }
        }
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
        base64toUrl(url)
    };




    return (

        <>
            {toasterData && (
                <Toaster
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}

            <Loader show={loading} />
            <div className='company-details-wrapper company-details-admin'>
                <ReactTable
                    columns={columns}
                    data={companyData}
                    title='Companies'
                    expandable={true}
                />

            </div >



            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="create-survey-modal-title"
                aria-describedby="create-survey-modal-description"
                className='medium-popup'
            >
                <div className="modal-paper">
                    <div className='modal-header'>
                        <Typography variant='h6'> Create Survey</Typography>
                    </div>

                    <form onSubmit={(e) => submitSurvey(e)}>
                        <div className='two-col-in-popup'>
                            {/* Date start */}
                            <TextField
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                label="Name"
                                margin="normal"
                                type="text"
                                value={surveyform?.name || ''}
                                onChange={(e) => { twoWayBind('name', e.target.value) }}
                                error={!!errors.name}
                                helperText={errors.name}
                            />

                            <TextField
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                label="Investment Range"
                                placeholder='10000 - 99999'
                                margin="normal"
                                type="text"
                                value={surveyform?.investmentRange || ''}
                                onChange={(e) => { twoWayBind('investmentRange', e.target.value) }}
                                error={!!errors.investmentRange}
                                helperText={errors.investmentRange}
                            />
                        </div>

                        <div className='two-col-in-popup'>
                            {/* Date start */}
                            <TextField
                                id="date"
                                label="Start Date"
                                type="date"
                                name="startDate"
                                defaultValue=""
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: reformatcurrentDate// set min date

                                }}
                                onChange={(e) => { twoWayBind('startDate', e.target.value) }}
                                error={!!errors.startDate}
                                helperText={errors.startDate ? errors.startDate.charAt(0).toUpperCase() + errors.startDate.slice(1) : ''}
                            />

                            {/* Date end */}
                            <TextField
                                id="date"
                                label="End Date"
                                name="endDate"
                                type="date"
                                defaultValue=""
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: reformatcurrentDate// set min date

                                }}
                                // style={{ margin: 20 }}
                                onChange={(e) => { twoWayBind('endDate', e.target.value) }}
                                error={!!errors.endDate}
                                helperText={errors.endDate ? errors.endDate.charAt(0).toUpperCase() + errors.endDate.slice(1) : ''}

                            />
                        </div>

                        <div className='two-col-in-popup two-col-in-popup-full'>
                            <TextField
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                label="Description"
                                margin="normal"
                                type="text"
                                multiline
                                rows={4}
                                value={surveyform?.description || ''}
                                onChange={(e) => { twoWayBind('description', e.target.value) }}

                            />
                        </div>

                        <div className='two-col-in-popup upload-file-in-popup-column'>
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
                                                        optionalUpload ?
                                                            <>
                                                                <CustomTooltip title="View" placement="right">
                                                                    <RemoveRedEyeIcon onClick={() => { openPdfUrl(surveyform?.documents?.base64Data) }} className='ml-5px cursor-pointer view-doc' />
                                                                </CustomTooltip>
                                                            </>

                                                            : ''
                                                    }

                                                </small>
                                            </>
                                        </div>
                                        {
                                            optionalUpload && optionalUpload?.name ?

                                                <Button variant='contained' color='secondary' onClick={() => { removeFile() }} className='upload-action-btn' >REMOVE FILE</Button> :
                                                <Button variant='outlined' className='upload-action-btn' >
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
                            {errors?.fileSizeError && (<p className=' error-text'>{errors.fileSizeError}</p>)}
                        </div>




                        <div>
                            <Button className='default-btn' type='submit' variant="contained" color="primary" style={{ marginRight: 10 }}  >{loading ? <CircularProgress size={24} /> : "Submit"}</Button>
                            <Button className='default-btn' onClick={() => { handleCancel() }} variant='contained' color='secondary'>Cancel</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmPopUp
                open={confirmModel}
                onClose={handleConfirmModal}
                message='delete this company'
                agreeOnClick={() => handleDeleteAPI(deleteCompanyId)}
                denyOnClick={() => { setConfirmModel(false) }}
                primaryAction='Yes'
                secondaryAction='No'
            />
             <ConfirmPopUp
    open={deleteModel}
    message='delete'
    agreeOnClick={() => deleteCompany(deleteId)}
    denyOnClick={() => { setDeleteModel(false) }}
    primaryAction='Yes'
    secondaryAction='No'
/>
        </>
    )
}

export default CompanyDetails;