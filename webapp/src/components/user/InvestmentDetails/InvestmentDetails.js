import React, { useEffect, useState } from 'react'
import { Button, TextField, Tooltip } from '@mui/material'
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import '../InvestmentOpportunities/InvestmentOpportunities.scss'
import Toaster from '../../shared/components/Toaster/Toaster'
import NumericInput from '../../shared/components/NumericInput/NumericInput'
import { splitDate, convertToBaseFormatDate } from '../../../commonFunctions/CommonMethod'
import callAPI from '../../../commonFunctions/ApiRequests'
import { formatCurrency } from '../../../commonFunctions/ConvertIntoCurrency'
import PdfIcon from '../../../assets/Icons/adode-pdf.svg'
import { useNavigate } from 'react-router-dom';
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';


const InvestmentDetails = (props) => {

    const navigate = useNavigate()
    const userData = JSON.parse(localStorage.getItem('userDetails'))
    const [investmentData, setInvestmentData] = useState([])
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState({});



    useEffect(() => {
        setInvestmentData(props?.data)
    }, [props?.data])

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


    //toaster function
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };


    const twoWayBind = (key, value, index) => {
        const newFields = [...investmentData]
        newFields[index].enteramount = value
        if (value && investmentData[index].minAmount > Number(value.replace(/[^0-9.]/g, ''))) {
            setErrors({
                ...errors,
                [index]: (
                    <span style={{ color: 'orange' }}>
                        Amount should be greater than or equal to minimum amount {formatCurrency(investmentData[index].minAmount)}
                    </span>
                ),
            });
            return;
        } else if (key === 'InvestmentAmount' && !value) {
            setErrors({
                ...errors,
                [index]: `Please enter amount`,
            });
            return;
        }
        else {
            setErrors({
                ...errors,
                [index]: '',
            });
        }
        setInvestmentData(newFields);
    }

    const handleSubmit = (value, index, selectedStatus) => {
        let formattedAmount;


        if (value?.status === "Open") {


            if (!value.enteramount) {
                setErrors({
                    ...errors,
                    [index]: `Please enter amount`,
                });
                return;
            }

            formattedAmount = value.enteramount.replace(/[^0-9.]/g, '');

            // if (investmentData[index].minAmount > Number(formattedAmount)) {
            //     setErrors({
            //         ...errors,
            //         [index]: (
            //             <span style={{ color: 'orange' }}>
            //                 Amount should be greater than or equal to minimum amount {formatCurrency(investmentData[index].minAmount)}
            //             </span>
            //         ),
            //     });
            // }
            setErrors({})
        }
        const req = {
            id: value?.userInvestmentId ? value?.userInvestmentId : null,
            // loggedInUserId: userData?.id,
            companyId: value?.company?.id,
            investmentId: value?.id,
            // amount: formattedAmount || value?.minAmount,
            amount: formattedAmount || null,
            // paymentId: null,
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
                    props.fetchInvestmentData();
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message
                    });
                }
            });
    };

    const handleOpenCompany = (value) => {
        navigate("/companyDetailsUser", {
            state: { type: "viewOpportunity", data: value, userDetails: userData },
        });
        // props.setClickView(true);
        // props.toggleDrawer();
    };

    const handleInvestment = (value) => {

        if (value.status === "Open") {
            navigate("/companyDetailsUser", {
                state: { type: "viewOpen", data: value, userDetails: userData },
            });
        }

        // else if (value.status === "Upcoming") {
        //     navigate("/companyDetailsUser", {
        //         state: { type: "viewUpcoming", data: value, userDetails: userData },
        //     });
        // } else if (value.status === "Closed") {
        //     navigate("/companyDetailsUser", {
        //         state: { type: "Closed", data: value, userDetails: userData },
        //     });
        // } 
        else {
            return;
        }
    }




    return (
        <div className='opportunity-list-wrapper mt-5'>

            {toasterData && (
                <Toaster
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}


            {
                investmentData && investmentData?.length > 0 ?

                    investmentData.map((investment, index) =>

                        <div key={index} className='opportunity-list-item mb-4 position-relative'>
                            <div className='inv-opportunity-details'>
                                <div className='companyData d-flex align-items-start flex-grow-1'>
                                    <div onClick={() => { handleOpenCompany(investment) }} className='cursor-pointer company-logo default-box-shadow-1'>
                                        <img className='' src={investment?.company?.logo} alt='logo' />
                                    </div>
                                    <div className='flex-grow-1 leftSideDetail'>
                                        <b onClick={() => { handleOpenCompany(investment) }} className='cursor-pointer company-name'>{investment?.company?.name}</b>
                                        <div onClick={() => { handleInvestment(investment) }} className='cursor-pointer opportunity-name-div'>
                                            <b>{investment?.name}</b>
                                        </div>
                                        <div className='about-inv-company'>
                                            
                                            {investment?.description ?
                                                <p className='textPTag' dangerouslySetInnerHTML={{ __html: investment?.description.replace(/\n/g, '<br />') }}></p> : <p className='no-desc-found'>-NA-</p>}
                                            {
                                                investment?.document &&
                                                <div className='d-flex inv-download-prospectus'>
                                                    <b className='mr-5px'>Investment Memo </b>
                                                    <CustomTooltip title='Download Investment Memo' placement='right'>
                                                        <SaveAltIcon className='cursor-pointer view-doc' onClick={() => { openPdfUrl(investment?.document) }} />
                                                    </CustomTooltip>
                                                </div>
                                            }

                                            <div className='opportunity-content-wrapper'>
                                                <div className='opportunity-content'>
                                                    <b className='mr-5px'>Start Date:</b>
                                                    <p className='d-inline-block'>{convertToBaseFormatDate(investment?.startDate, false, true, 'MMMM', false)}</p>
                                                </div>
                                                <div className='opportunity-content'>
                                                    <b className='mr-5px'>End Date:</b>
                                                    <p className='d-inline-block'>{convertToBaseFormatDate(investment?.endDate, false, true, 'MMMM', false)}</p>
                                                </div>
                                                <div className='opportunity-content minimum-amt-value'>
                                                    <b className='mr-5px'>Minimum Amount:</b>
                                                    <p className='d-inline-block'>{formatCurrency(investment?.minAmount)}.00</p>
                                                </div>
                                            </div>

                                            <div className='opportunity-content-apply opportunity-content-wrapper'>
                                                {
                                                    investment?.applied === true &&
                                                    <div className='opportunity-content-apply opportunity-content-wrapper'>
                                                        <b className='bg-69A26E applied-pill mr-5px'>Applied</b>
                                                    </div>
                                                }

                                                <div className='align-items-start justify-content-end opportunity-content d-flex' >



                                                    {
                                                        investment?.status === "Open" ?
                                                            <NumericInput
                                                                className='position-relative mr-15px'
                                                                label="Investment Amount"
                                                                // value={survey?.amount || survey?.minimumInvestmentAmount || 0}
                                                                value={investment.enteramount || 0}
                                                                thousandSeparator={true}
                                                                prefix={"$"}
                                                                decimalScale={2}
                                                                allowNegative={false}
                                                                onChange={(e) => {
                                                                    twoWayBind("InvestmentAmount", e.target.value, index);
                                                                }}
                                                                customInput={TextField}
                                                                // disabled={investment?.applied ? true : false}
                                                                helperText={errors[index]}
                                                                error={Boolean(errors[index])}
                                                            /> :
                                                            " "
                                                    }

                                                    {
                                                        investment?.status === 'Open' ?
                                                            <Button
                                                                className='default-tab-button'
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => { handleSubmit(investment, index, "Applied") }}

                                                            >
                                                                Apply</Button>
                                                            :
                                                            <Button
                                                                className='default-tab-button'
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => { handleSubmit(investment, index, "Contact") }}
                                                            >Contact</Button>
                                                    }
                                                </div>
                                            </div>

                                            {/* {
                                                investment?.applied === true &&
                                                <div className='opportunity-content-apply opportunity-content-wrapper'>
                                                    <b className='bg-69A26E applied-pill mr-5px'>Applied</b>
                                                </div>
                                            } */}


                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='about-inv-company'>

                            </div>

                        </div>


                    )
                    :
                    <div className='no-data-available d-flex align-items-center justify-content-center'>
                        <p>No Investment Opportunity Available</p>
                    </div>
            }





        </div>
    )
}

export default InvestmentDetails;