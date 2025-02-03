import React, { useState, useEffect } from 'react';
import { Button, Modal } from '@mui/material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import callAPI from '../../../../commonFunctions/ApiRequests.js';
import { useNavigate } from 'react-router-dom';
import './OTPVerification.scss';
import Toaster from '../Toaster/Toaster.js';

const OTPVerification = (props) => {

    const userData = JSON.parse(localStorage.getItem('userDetails'))


    const [otp, setOtp] = useState('');
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(1 * 60); // 1 minute in seconds
    const navigate = useNavigate()



    useEffect(() => {
        let timerInterval;
        if (props.open) {
            timerInterval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 0) {
                        clearInterval(timerInterval);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timerInterval);
    }, [props.open, timer]);

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')} : ${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleChange = (newValue) => {

        if (newValue.length > 0) {
            setErrors({});
        }
        
        setOtp(newValue);
    };

    const onSuccess = () => {
        localStorage.setItem("OTPForDocuments", true);
        navigate("/documents");
    }

    const handleCloseModal = () => {
        setLoading(false);
        setErrors({});
        setOtp(''); // Clear OTP field when the modal closes
        setTimer(1 * 60); // Reset the timer
    };

    const verifyOtp = async (enteredOtp) => {
        setLoading(true);
        try {
            const response = await callAPI.post('./api/v1/email/verifyOtp', { email: props.email, otp: enteredOtp });
            if (response.status === 200) {
                setToasterData({
                    show: true,
                    type: "success",
                    message: response.data.message,
                    autoHideDuration: 1000
                });
                setLoading(false);
                setTimer(1 * 60); // Reset timer
                onSuccess();
                props.callbackFun()
                // props.onClose(); // Close the modal if the OTP is correct
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            setErrors({ otp: error.message });
            setLoading(false);
        }
    };

    const resendOTP = () => {
        
        setOtp('')

        const req={"email": props.email,"userId": userData.id}
        setTimer(1 * 60); // Reset timerrr
        callAPI.post('./api/v1/email/sendOtp', req)
        .then((response) => {
            if (response?.status === 200) {
                setToasterData({
                    show: true,
                    type: "success", //// Updated type to success
                    message: "OTP sent successfully", //// Updated message
                });
                setLoading(false)

            } else {
                setToasterData({
                    show: true,
                    type: "error",
                    message: response?.message,
                });
            }
        })
    }

    
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };

    return (
        <>
            {toasterData && (
                <Toaster
                    className="DashboardToaster"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}
        <Modal
            open={props.open}
            onClose={() => {
                props.onClose();
                handleCloseModal();
            }}
            className='d-flex align-items-center justify-content-center confirm-modal-popup'
        >
            <div className="modal-paper modal-otp-popup">
                <div className='modal-header'>
                    <h3>Confirmation</h3>
                </div>
                <div className='modal-body mb-15px'>
                    <p>{props.message}</p>
                </div>
                <MuiOtpInput
                    length={6}
                    value={otp}
                    onChange={handleChange}
                    autoFocus
                />
                {loading && <p>Loading...</p>}
                {errors.otp && <p className='errorOTP'>{errors.otp}</p>}
                <p className='mt-15px'>
                    Resend in <span className='timer'>{formatTimer(timer)}</span>
                    {timer === 0 && <a className='resendOTP' onClick={resendOTP}>Resend OTP ?</a>}
                </p>
                <div className='modal-actions'>
                    <Button
                        className='default-btn'
                        onClick={() => {
                            if (otp.length === 6) {
                                verifyOtp(otp);
                            } else {
                                setErrors({ otp: 'Incorrect OTP. Please try again.' });
                            }
                        }}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {props.primaryAction}
                    </Button>
                    <Button
                        className='default-btn'
                        onClick={() => {
                            props.denyOnClick();
                            handleCloseModal(); // Clear OTP field and reset timer when the cancel button is clicked
                        }}
                        variant='contained'
                        color='secondary'
                        disabled={loading}
                    >
                        {props.secondaryAction}
                    </Button>
                </div>
            </div>
        </Modal>
        </>
    );
};

export default OTPVerification;
