import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Grid, Stack, Tooltip, Typography, TextField } from '@mui/material'
// import SaveAltIcon from '@mui/icons-material/RemoveRedEye';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ReportIcon from '@mui/icons-material/Report';
import Header from '../../Header/Header'
import callAPI from '../../../commonFunctions/ApiRequests'
import { formatCurrency } from '../../../commonFunctions/ConvertIntoCurrency';
import { convertToBaseFormatDate } from '../../../commonFunctions/CommonMethod'
import Toaster from '../../shared/components/Toaster/Toaster';
import NumericInput from '../../shared/components/NumericInput/NumericInput';
import './CompanyDetailsUser.scss'
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';
import ExternalLink from '../../../assets/ActionIcons/External.svg';
import Footer from '../../Footer/Footer';
import CompanyCommunitySentiment from './CompanyCommunitySentiment';





const CompanyDetailsUser = () => {
    const userData = JSON.parse(localStorage.getItem('userDetails'))
    const navigate = useNavigate(); 
    const location = useLocation()
    const locationName = location && location?.state ? location?.state : "";
    const [companyInfo, setCompanyInfo] = useState({})
    const [surveyForm, setSurveyForm] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date());
    const [errors, setErrors] = useState({});
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [oppoErrors, setOppoErrors] = useState({})
    const limitCharLength = 80;
    const [textExpandable, setTextExpandable] = useState({});
    const toggleInnerTable = (index) => {
        setTextExpandable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    }
    //get company All-Details
    const getCompanyData = () => {

        const companyId = locationName?.data?.companyId || null
        const investmentId = locationName?.data?.id 

        if (!companyId && !investmentId) {
            navigate('/')
            return;
        }
        
        callAPI.get(`./api/v1/company/getDetailsByCompanyId?companyId=${companyId}&investmentId=${investmentId}`)
            // callAPI.get(`./api/v1/company/getDetailsByCompanyId?companyId=96`)

            .then((response) => {
                if (response.status === 200) {
                    const newsurvey = response?.data?.data?.interestSurveys?.map((item) => item)
                    setCompanyInfo(response?.data?.data)
                    setSurveyForm(newsurvey)
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                }
            })
    }


    const twoWayBind = (key, value, index) => {
        const newFields = [...surveyForm]
        // newFields[index].amount = value
        newFields[index].enteramount = value
        // if (value && surveyForm[index].minimumInvestmentAmount > Number(value.replace(/[^0-9.]/g, ''))) {
        //     setErrors({
        //         ...errors,
        //         [index]: `Amount should be greater than or equals to minimum amount ${formatCurrency(surveyForm[index].minimumInvestmentAmount)}`,
        //     });
        //     return;
        // } else

        // if (key === 'InvestmentAmount' && !value) {
        //     setErrors({
        //         ...errors,
        //         [index]: `Please enter amount`,
        //     });
        //     return;
        // }

        // else {
        //     setErrors({
        //         ...errors,
        //         [index]: '',
        //     });
        // }
        setSurveyForm(newFields);
    }


    const opportunitytwoWayBind = (key, value, index) => {
        const newFields = [...companyInfo?.InvestmentOpportunities]
        newFields[index].enteramount = value

        if (value && companyInfo?.InvestmentOpportunities[index].minAmount > Number(value.replace(/[^0-9.]/g, ''))) {
            setOppoErrors({
                ...oppoErrors,
                [index]: (
                    <span style={{ color: 'orange' }}>
                        Amount should be greater than or equal to minimum amount {formatCurrency(companyInfo?.InvestmentOpportunities[index].minAmount)}
                    </span>
                ),
            });
        } else if (key === 'Opportunity' && !value) {
            setOppoErrors({
                ...oppoErrors,
                [index]: `Please enter amount`,
            });
            return;
        }

        else {
            setOppoErrors({
                ...oppoErrors,
                [index]: '',
            });
        }

        setCompanyInfo({
            ...companyInfo,
            InvestmentOpportunities: newFields
        })
    }


    //formSubmit
    const handleSubmit = (surveyData, index, Interested) => {
        let formattedAmount;
        // if (Interested !== "Interested") {
        //     if (!surveyData.enteramount) {
        //         setErrors({
        //             ...errors,
        //             [index]: `Please enter amount`,
        //         });
        //         return;
        //     }

        if (surveyData?.enteramount) {
            formattedAmount = surveyData?.enteramount.replace(/[^0-9.]/g, '');

        }

        // if (surveyForm[index].minimumInvestmentAmount > Number(formattedAmount)) {
        //     setErrors({
        //         ...errors,
        //         [index]: `Amount should be greater than or equals to minimum  amount ${formatCurrency(surveyForm[index].minimumInvestmentAmount)}`,
        //     });
        //     return;
        // }
        // }
        const req_2 =
        {
            companyId: locationName?.data?.companyId || null,
            interestSurveyId: surveyData?.interestSurveyId,
            minimumInvestmentAmount: surveyData?.minimumInvestmentAmount,
            startDate: surveyData?.startDate,
            endDate: surveyData?.endDate,
            interestedYN: Interested === 'Committed',
            amount: formattedAmount || "0",
            id: surveyData.interestCaptureId ? surveyData.interestCaptureId : null
        }

        callAPI.post('./api/v1/survey/createInterestCapture', req_2)
            .then((response) => {
                if (response.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message,
                    })
                    getCompanyData()

                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response.message,
                    })

                }
            })
    }

    //submit opportunity

    const submitOpportunity = (value, index, selectedStatus) => {
        let opportunityformattedAmount;
        if (!value.enteramount) {
            setOppoErrors({
                ...oppoErrors,
                [index]: `Please enter amount`,
            });
            return;
        }

        opportunityformattedAmount = value.enteramount.replace(/[^0-9.]/g, '');
        if (value && selectedStatus == "Applied" && companyInfo.InvestmentOpportunities[index].minAmount > Number(opportunityformattedAmount)) {
            // setOppoErrors({
            //     ...oppoErrors,
            //     [index]: (
            //         <span style={{ color: 'orange' }}>
            //             x should be greater than or equal to minimum amount {formatCurrency(companyInfo.InvestmentOpportunities[index].minAmount)}
            //         </span>
            //     ),
            // });
            setOppoErrors({})
        }

        const req = {
            id: value?.userInvestmentId ? value?.userInvestmentId : null,
            companyId: locationName?.data?.companyId || null,
            investmentId: value?.id,
            amount: opportunityformattedAmount || null,
            userId: userData?.id,
            applied: selectedStatus === "Applied" ? true : false,
            interestedYN: selectedStatus === "Interested" ? true : false,
            contactedYN: selectedStatus === "Contact" ? true : false,
            perUnitPrice: value?.perUnitPrice
        };
        callAPI.post('./api/v1/investment/createUserInvestment', req)
            .then((response) => {
                if (response?.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message
                    });
                    getCompanyData();
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message
                    });
                }
            });

    }


    useEffect(() => {
        setCurrentDate(new Date());
        getCompanyData();
    }, [locationName])



    //toaster function
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };

    const openPdfUrl = (url) => {
        if (!url) {
            setToasterData({
                show: true,
                type: "error",
                message: 'URL is empty or invalid.'
            });
            return;
        }

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
    }

    const limitChar = (str, limit) => {
        return str.length > limit ? `${str.slice(0, limit)}...` : str;
    }
    
    return (
        <div className='pageWrapperFix'>
            {toasterData && (
                <Toaster
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}
            <Header />
            <div className='d-flex flex-grow-1 separateBox'>
                <div className='container flex-grow-1'>
                    <div>
                        <div className='heading-section opportunity-details d-flex align-items-center'>
                            <div className={`company-logo rounded-borders-card-5  ${companyInfo?.logo ? 'company-default-logo' : ''} `} >
                                {
                                    companyInfo?.logo && companyInfo ?
                                        <img src={companyInfo?.logo} alt='logo' /> :
                                        <h2 className='text-white placeholder-img'>{companyInfo.name ? companyInfo.name.substring(0, 1) : null}</h2>
                                }
                                {/* <img src={companyInfo?.logo} alt='logo' /> */}
                            </div>
                            <div className='companyDetailTitle'>
                                <div className='d-flex align-items-center'>
                                    <h3 className='opportunity-company'>{companyInfo?.name}</h3>
                                    <span className='d-inline-flex'>

                                        {/* <img src={shareIcon} alt='share' /> */}


                                    </span>
                                </div>
                                <div>
                                    {/* <small className='default-status-pill oppurtunity-status'>Open</small> */}
                                    {/* <small className='default-status-pill'>April 10, 2024 - July 20, 2024</small> */}

                                </div>
                            </div>
                        </div>
                        <div className='about-company-card mb-15px'>
                            <div className='border-sbottom-D9D9D9'>
                                <div className='title-container'>
                                    <h4 className='mb-15px'>About Company</h4>
                                    {
                                        companyInfo?.companyProfile &&
                                        <div className='d-flex download-prospectus align-items-center'>
                                            <b className='mr-5px'>Company Profile</b>
                                            <CustomTooltip title='Download Company Profile' placement='right'>
                                                <SaveAltIcon className='cursor-pointer view-doc' onClick={() => { openPdfUrl(companyInfo?.companyProfile) }} />
                                            </CustomTooltip>
                                        </div>
                                    }
                                </div>

                                {companyInfo?.description && <p className='long-desc-text mb-15px' dangerouslySetInnerHTML={{ __html: companyInfo?.description.replace(/\n/g, '<br />') }}></p>}


                            </div>
                        </div>

                        {/* opportunnity part */}
                        <div className='rounded-borders-card opportunity-container align-items-start jusify-content-between'>
                            <div className='padding-15 border-bottom-D9D9D9'>
                                <h4>Investment Opportunities</h4>
                            </div>
                            {
                                companyInfo?.InvestmentOpportunities && companyInfo?.InvestmentOpportunities.length > 0 ?

                                    companyInfo?.InvestmentOpportunities?.map((opportunity, index) =>
                                        <div index={index} className='padding-20'>
                                            <div>
                                                <div className='title-container'>
                                                    <h4 className='mb-25px survey-name '>{opportunity?.name}</h4>
                                                    {
                                                        opportunity?.document &&
                                                        <div className='d-flex download-prospectus'>
                                                            <b className='mr-5px'>Investment Memo</b>
                                                            <CustomTooltip className='cursor-pinter' title='Download Investment Memo' placement='right'>
                                                                <SaveAltIcon className='cursor-pointer  view-doc' onClick={() => { openPdfUrl(opportunity?.document) }} />
                                                            </CustomTooltip>
                                                        </div>
                                                    }
                                                </div>

                                                {
                                                    opportunity?.description ?
                                                        <p className='long-desc-text'
                                                            dangerouslySetInnerHTML={{ __html: opportunity?.description ? opportunity?.description.replace(/\n/g, '<br />') : '' }}>

                                                        </p> : ''
                                                }



                                            </div>

                                        
                                                    <Grid container spacing={2} className='mt-25px pt-5 align-items-start jusify-content-between flex-no-wrap min-amt-grid'>

                                                        <Grid item lg={2.5} alignSelf='center' className='p-0  mr-15px'>
                                                            <NumericInput
                                                                label="Minimum Amount"
                                                                value={opportunity?.enteramount || 0}
                                                                thousandSeparator={true}
                                                                prefix={"$"}
                                                                decimalScale={2}
                                                                allowNegative={false}
                                                                onChange={(e) => {
                                                                    opportunitytwoWayBind("Opportunity", e.target.value, index);

                                                                }}
                                                                customInput={TextField}
                                                                // disabled={opportunity?.staus ? true : false}
                                                                helperText={oppoErrors[index]}
                                                                error={Boolean(oppoErrors[index])}
                                                            />

                                                        </Grid>
                                                        <Grid item lg={'auto'} alignSelf='center' className='interest-btn inv-action-grid p-0 date-grid-cards'>

                                                            <Button variant="contained"
                                                                className='default-btn'
                                                                color='primary'
                                                                onClick={() => { submitOpportunity(opportunity, index, "Applied") }}
                                                            // disabled={survey?.committedYN && survey?.interestedYN && survey?.amount > 0 ? true : false}
                                                            // disabled={opportunity?.committedYN ? true : false}
                                                            >
                                                                Apply
                                                            </Button>
                                                        </Grid>

                                                        {opportunity.applied && (
                                                            <div className='ml-50px inv-opp-applied-pill'>
                                                                <div className='opportunity-content-apply opportunity-content-wrapper'>
                                                                    <b className='bg-69A26E applied-pill mr-5px appliedInDescription'>Applied</b>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </Grid>

                                      



                                            {/* <Grid container spacing={2} className='pt-5 align-items-start jusify-content-between'>
                                                <Grid item lg={2.5} alignSelf='center' className='p-0  mr-15px'>

                                                    <NumericInput
                                                        label="Minimum Amount"
                                                        value={opportunity?.enteramount || 0}
                                                        thousandSeparator={true}
                                                        prefix={"$"}
                                                        decimalScale={2}
                                                        allowNegative={false}
                                                        onChange={(e) => {
                                                            opportunitytwoWayBind("Opportunity", e.target.value, index);

                                                        }}
                                                        customInput={TextField}
                                                        // disabled={opportunity?.staus ? true : false}
                                                        helperText={oppoErrors[index]}
                                                        error={Boolean(oppoErrors[index])}
                                                    />
                                                </Grid>
                                                <Grid item lg={'auto'} alignSelf='center' className='interest-btn inv-action-grid p-0 date-grid-cards'>

                                                    {
                                                        opportunity?.status !== 'Open' ? <Button variant="contained"
                                                            color='primary'
                                                            onClick={() => { submitOpportunity(opportunity, index, "Applied") }}
                                                        // disabled={survey?.committedYN && survey?.interestedYN && survey?.amount > 0 ? true : false}
                                                        // disabled={opportunity?.committedYN ? true : false}
                                                        >
                                                            Apply
                                                        </Button>
                                                            :

                                                            <Button variant="contained"
                                                                color='primary'
                                                                onClick={() => { submitOpportunity(opportunity, index, "Interested") }}
                                                            // disabled={survey?.committedYN && survey?.interestedYN && survey?.amount > 0 ? true : false}
                                                            // disabled={opportunity?.committedYN ? true : false}
                                                            >
                                                                Interested
                                                            </Button>
                                                    }

                                                </Grid>
                                            </Grid> */}

                                            {
                                                locationName?.type === "viewUpcomig" ?
                                                    <Button variant="contained"
                                                        color='primary'
                                                        className='default-btn'
                                                        onClick={() => { submitOpportunity(opportunity, index, "Interested") }}
                                                    // disabled={survey?.committedYN && survey?.interestedYN && survey?.amount > 0 ? true : false}
                                                    // disabled={opportunity?.committedYN ? true : false}
                                                    >
                                                        Contact Us
                                                    </Button> : ''
                                            }
                                        </div>
                                    )
                                    :
                                    <div className=' no-survey d-flex justify-content-center align-items-center padding-20'>
                                        <p>No Investment Opportunities Available</p>
                                    </div>
                            }
                        </div>

                        <div className='rounded-borders-card survey-cards-wrapper'>
                            <div className='padding-15 border-bottom-D9D9D9'>
                                <h4>Submit Your Interest</h4>
                            </div>

                            {

                                surveyForm && surveyForm?.length > 0 ?
                                    <div className='survey-form-card border-bottom-D9D9D9 mb-25px padding-20'>
                                        {surveyForm.map((survey, index) =>
                                            <div key={index} className={`survey-amt-disabled opportunity-details-grid`}>
                                                <div className='servey-details'>
                                                    <div className='title-container'>
                                                        <h4 className='mb-25px survey-name'>{survey?.name}</h4>
                                                        <div className='d-flex align-items-center download-prospectus'>
                                                            {
                                                                survey?.document &&
                                                                <>
                                                                    <b className='mr-5px'>Prospectus Document</b>
                                                                    <CustomTooltip className='cursor-pinter' title='Download Prospectus Document' placement='right'>
                                                                        <SaveAltIcon className='cursor-pointer  view-doc' onClick={() => { openPdfUrl(survey?.document) }} />
                                                                    </CustomTooltip>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>

                                                    {survey?.description && <p className='long-desc-text'
                                                        dangerouslySetInnerHTML={{ __html: survey?.description ? survey?.description.replace(/\n/g, '<br />') : '' }}>

                                                    </p>}
                                                    {/* <div className='d-flex align-items-center download-prospectus'> */}

                                                    {/* <Button className='btn-underline' onClick={() => { openPdfUrl(newCompany?.companyProfile) }} variant="text">Download Now</Button> */}



                                                    {/* </div> */}
                                                </div>

                                                {
                                                    locationName?.type === "viewCompany" ?

                                                        <>
                                                            <Grid container className='mt-15px survey-card-container d-flex align-items-end justify-content-between'>
                                                                {/* <Grid item lg={2.5} className='background-F2F4F7 date-grid-cards'>
                    <div className='d-flex align-items-center h-100'>
                        <Stack direction={'row'} spacing={2}>
                            <img src={CalendarIcon} alt='icon' />
                            <div className='info-cards'>
                                <span className='info-label d-block font-10'>Open Date</span>
                                <span className='info-value'>{splitDate(survey?.startDate, false, true, 'MMMM', false)} </span>
                            </div>
                        </Stack>
                    </div>
                </Grid> */}
                                                                {/* <Grid item lg={2.5} className='background-F2F4F7 date-grid-cards'>
                    <div className='d-flex align-items-center h-100'>
                        <Stack direction={'row'} spacing={2}>
                            <img src={CalendarIcon} alt='icon' />
                            <div className='info-cards'>
                                <span className='info-label d-block font-10'>Close Date</span>
                                <span className='info-value'>{splitDate(survey?.endDate, false, true, 'MMMM', false)}</span>
                            </div>
                        </Stack>
                    </div>
                </Grid> */}

                                                                <Grid item alignSelf='center' className='p-0 mpx'>
                                                                    <b className='mr-5px'>Investment Range :</b>
                                                                    {/* <p className='d-inline-block'>{formatCurrency(survey?.investmentRange)}.00</p> */}
                                                                    <p className='d-inline-block investment-range'>{survey?.investmentRange ? survey?.investmentRange : '-'}</p>
                                                                </Grid>



                                                                {/* <Grid item alignSelf='center' className='interest-btn align-items-center inv-action-grid p-0 mpx date-grid-cards'>
                                                                <Button variant="contained"
                                                                    className='default-btn'
                                                                    color='primary'
                                                                    onClick={() => { handleSubmit(survey, index, 'Interested') }}
                                                                    // disabled={survey?.committedYN && survey?.interestedYN && survey?.amount > 0 ? true : false}
                                                                    disabled={survey?.interestedYN || survey?.amount > 0 ? true : false}
                                                                >
                                                                    Interested
                                                                </Button>
                                                            </Grid> */}



                                                                <div className='d-flex justify-content-end'>
                                                                    <Grid item lg={4} alignSelf='center' className='p-0 date-grid-cards  mr-15px '>

                                                                        <NumericInput
                                                                            label="Investment Range"
                                                                            value={survey?.enteramount || survey?.amount || 0}
                                                                            thousandSeparator={true}
                                                                            prefix={"$"}
                                                                            decimalScale={2}
                                                                            allowNegative={false}
                                                                            onChange={(e) => {
                                                                                twoWayBind("InvestmentAmount", e.target.value, index);

                                                                            }}
                                                                            customInput={TextField}
                                                                        // disabled={survey?.committedYN ? true : false}
                                                                        // helperText={errors[index]}
                                                                        // error={Boolean(errors[index])}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item lg={'auto'} alignSelf='center' className='inv-action-grid p-0 date-grid-cards'>
                                                                        <Button variant="contained"
                                                                            color='primary'
                                                                            onClick={() => { handleSubmit(survey, index, 'Committed') }}
                                                                            // disabled={survey?.committedYN && survey?.interestedYN && survey?.amount > 0 ? true : false}
                                                                            // disabled={survey?.committedYN ? true : false}
                                                                            className='default-btn'
                                                                        >
                                                                            {/* {survey?.interestedYN && survey?.amount === 0 ? "I am going to commit" : ((survey?.commitedYN && survey?.amount > 0) ? 'commited' : 'I am interested')} */}
                                                                            {/* {!survey.interestedYN && (survey?.amount === 0 || survey?.amount === null) ? "I am Interested" : ((survey?.committedYN && survey?.amount > 0) ? 'I am Interested' : 'I am interested ')} */}
                                                                            Submit Interest
                                                                        </Button>
                                                                    </Grid>
                                                                </div>

                                                            </Grid>
                                                            <div className='d-flex warning-message '>
                                                                <ReportIcon className='report-icon mr-5px' />
                                                                <p className={`${companyInfo?.bulletinBoards && companyInfo?.bulletinBoards?.length > 0 ? 'message-text' : ''} `}>
                                                                    This is not a hard commit among this will help you for estimating raise fund to his company.
                                                                </p>
                                                            </div>
                                                        </>

                                                        : ''
                                                }
                                            </div>
                                        )}
                                    </div>
                                    :
                                    <div className=' no-survey d-flex justify-content-center align-items-center padding-20'>
                                        <p>No Survey Data Available</p>
                                    </div>

                            }
                        </div>
                    </div>
                </div>
                {companyInfo && companyInfo?.bulletinBoards && companyInfo?.bulletinBoards?.length > 0 && (
                    <div className='bulletin-container'>
                        <div>
                            <div className='padding-15 border-bottom-D9D9D9'>
                                <h4 className='mb-0'>Bulletin</h4>
                            </div>
                            {

                                companyInfo && companyInfo?.bulletinBoards && companyInfo?.bulletinBoards?.length > 0 ?
                                    companyInfo.bulletinBoards?.map((bulletin, index) =>

                                        <div key={index} className='padding-15'>

                                            <div className={`rounded-borders-card mb-15px bulletin-card pt-3 pb-3 bulletin-box bulletin-box-single`}>
                                                <div className='border-bottom-D9D9D9 bulletin-headingbox '>
                                                    <div>
                                                        <a className='bulletin-subject d-flex align-items-center' href={bulletin?.source} target="_blank">{bulletin?.subject} <span className='BulletInArrowOutwardIcon'><img src={ExternalLink} /></span></a>
                                                    </div>

                                                    <div className='date-containt'><p><b>Published Date:</b> {convertToBaseFormatDate(bulletin?.publishedDate, false, true, 'MMMM', false)}</p></div>
                                                </div>
                                                <div>

                                                    {/* <p className='long-desc-text bulletin-message ' onClick={() => setExtraInfo(!extraInfo)}>{extraInfo ? bulletin?.message : limitChar(bulletin?.message, limitCharLength)}</p> */}
                                                    <p className='long-desc-text bulletin-message '>
                                                        {textExpandable[bulletin?.id] ? 
                                                        bulletin?.message : limitChar(bulletin?.message, limitCharLength)}
                                                        {` `}
                                                        <Button className='show-more-btn btn-underline' onClick={() => toggleInnerTable(bulletin.id)}>{!textExpandable[bulletin?.id] ? 'show more' : 'show less'}</Button>
                                                    </p>


                                                    {/* <p className='long-desc-text line-clamp-1 bulletin-message '>{bulletin?.message}</p> */}
                                                </div>
                                            </div>
                                        </div>

                                    )
                                    : <div className='border-0 bulletin-card padding-20 text-center'>
                                        <p>No Bulletin Available</p>
                                    </div>
                            }
                        </div>
                    </div>
                )}
            </div>
            <CompanyCommunitySentiment id={locationName?.data?.id}/>
            <Footer />
        </div>
    )
}

export default CompanyDetailsUser