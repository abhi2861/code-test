
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import NumericInput from '../shared/components/NumericInput/NumericInput';
import { Box, Stack, TextField, Button, Grid, CircularProgress } from '@mui/material'
import callAPI from '../../commonFunctions/ApiRequests';
import Toaster from '../shared/components/Toaster/Toaster';
import CustomSelect from '../shared/components/CustomSelect/CustomSelect';
import Footer from '../Footer/Footer';
const CreateApplicationPage = () => {
    const location = useLocation();
    const locationName = location && location.state ? JSON.parse(location.state) : "";
    const navigate = useNavigate()
    const [showError, setShowError] = useState();
    const [companylist, setCompanylist] = useState([])
    const [loading, setLoading] = useState(false);
    const [toasterData, setToasterData] = useState({
        show: false,
        type: '',
        message: ''
    })
    const [templatelist, setTemplatelist] = useState([])
    const [formData, setFormData] = useState({
        user: '',
        oppurtunity: '',
        amount: '',
        applicationDate: '',
        perUnitPrice: ''

    });
    const handleChange = (key, selectedValue) => {
        const selectedInvestment = investmentList.find(investment => investment.value === selectedValue);
        if (selectedInvestment) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [key]: selectedValue,
                perUnitPrice: selectedInvestment.perUnitPrice
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [key]: selectedValue
            }));
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = {};
        if (!formData.applicationDate) {
            formErrors.applicationDate = "Application date is required";
        }
        if (!formData.amount) {
            formErrors.amount = "Amount is required";
        }
        if (!formData.user) {
            formErrors.user = "User is required";
        }
        if (!formData.oppurtunity) {
            formErrors.oppurtunity = "Investment opportunity is required";
        }
        if (Object.keys(formErrors).length > 0) {
            setShowError(formErrors);
            return;
        }
        setLoading(true);
        const req = {
            id: null,
            companyId: locationName?.companyId,
            investmentId: formData.oppurtunity,
            amount: formData.amount,
            userId: formData.user,
            applied: true,
            interestedYN: false,
            contactedYN: false,
            perUnitPrice: formData.perUnitPrice,
            applicationDate: formData.applicationDate,
        }
        callAPI.post('./api/v1/investment/createUserInvestment', req)
            .then((response) => {
                if (response.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message,
                    });
                    resetForm();
                    setTimeout(() => { navigate('/adminDashboard', { state: { tabValue: '1' } }) }, 1000);
                    setLoading(false);
                } else {
                    resetForm();
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                    setLoading(false);
                }
            });
        setShowError({});
    };

    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };
    const resetForm = () => {
        setInvestmentData({})
    }
    const handleCancelForm = () => {
        resetForm()
        navigate('/adminDashboard', { state: { tabValue: '3' } })
    }
    const getCompany = () => {
        callAPI.get('./api/v1/user/getUsers')
            .then((response) => {
                if (response?.status === 200) {
                    setCompanylist(response?.data?.data)
                }
            })
    }
    const getAllinvestmentOpportunity = () => {
        callAPI.get('./api/v1/investment/getAllInvestmentOpportunity')
            .then((response) => {
                if (response?.status === 200) {
                    if (locationName && locationName.Investmentdata) {
                        setSelectedTemp(locationName.Investmentdata?.templateId)
                    }
                    setTemplatelist(response?.data?.data)
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
        getAllinvestmentOpportunity()
    }, [])
    const usersData = companylist?.map(user => ({
        label: user.name,
        value: user.userId
    }));
    const investmentList = templatelist?.map(investment => ({
        value: investment.investmentId,
        image: investment.logo,
        perUnitPrice: investment.perUnitPrice,
        label: investment.investmentName
    }));
    const handleNumericInputChange = (key, value) => {
        let error = { ...showError };
        if (key === 'amount') {
            if (Number(value) < 0) {
                error[key] = 'Amount must be a positive value';
            } else {
                delete error[key];
            }
        }
        setFormData(prevData => ({
            ...prevData,
            [key]: value,
        }));
        setShowError(error);
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
            <div className='container investment-opportunity-wrapper flex-grow-1'>
                <Box className='heading-section'>
                    <h4> Create Application</h4>
                </Box>
                <div className='IOpportunityMain rounded-borders-card padding-20 default-box-shadow-1'>
                    <form onSubmit={handleSubmit} className='CInvestmentOpportunityForm'>
                        <Grid container className='three-col-fields'>
                            <Grid lg={3.8} item>
                                <CustomSelect
                                    options={usersData}
                                    value={formData.user}
                                    onChange={(key, option) => handleChange('user', option)}
                                    Objectkey={'companyId'}
                                    sx={{ width: '50%' }}
                                    label="Select User"
                                    error={!!showError?.user}
                                    helperText={showError?.user}
                                />
                            </Grid>
                            <Grid lg={3.8} item>
                                <CustomSelect
                                    options={investmentList}
                                    value={formData.oppurtunity}
                                    onChange={(key, option) => handleChange('oppurtunity', option)}
                                    Objectkey={'Investmentopportunity'}
                                    sx={{ width: '50%' }}
                                    label="Select Investment opportunity"
                                    error={!!showError?.oppurtunity}
                                    helperText={showError?.oppurtunity}

                                />
                            </Grid>
                            <Grid lg={3.8} item>
                                <NumericInput
                                    label="Amount"
                                    value={formData.amount || ""}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                    decimalScale={2}
                                    allowNegative={false}
                                    onChange={(e) => handleNumericInputChange('amount', e.target.value)}
                                    customInput={TextField}
                                    error={!!showError?.amount}
                                    helperText={showError?.amount}
                                />
                            </Grid>
                            <Grid lg={3.8} item>
                                {/* Start Date */}
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    label="Application Date"
                                    type="date"
                                    name="Date"
                                    defaultValue=""
                                    fullWidth
                                    value={formData.applicationDate || ''}
                                    onChange={(e) => handleNumericInputChange('applicationDate', e.target.value)}
                                    error={!!showError?.applicationDate}
                                    helperText={showError?.applicationDate}
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
export default CreateApplicationPage;