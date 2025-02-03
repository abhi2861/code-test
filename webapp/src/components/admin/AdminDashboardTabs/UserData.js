import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Stack, Card, CardContent, Tabs, Tab, IconButton, TextField, TablePagination, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Modal, CircularProgress } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, FilterList } from '@material-ui/icons';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import { userData } from './usersData';
import callAPI from '../../../commonFunctions/ApiRequests';
import { ReactTable } from '../../shared/components/ReactTable/ReactTable';
import Toaster from '../../shared/components/Toaster/Toaster';
import Loader from '../../shared/components/Loader/Loader';
import CustomizedMenus from '../../shared/components/DropdownMenu/CustomizedMenus';
import { currencifyInDollars, splitDate, convertToBaseFormatDate } from '../../../commonFunctions/CommonMethod';
import './User.scss'

const UserData = (props) => {

    const userData = JSON.parse(localStorage.getItem('userDetails'))
    const [userListData, setUserListData] = useState([])
    const [columns, setColumns] = useState([])
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailData, setEmailData] = useState({
        email: '',
        emailSubject: '',
        emailBody: ''
    });

    
    const handleResetPasswordClick = (email) => {

        setLoading(true);

        callAPI.post('./api/v1/email/requestResetPassword', { email: email})
        .then((response) => {
            if (response.status === 200) {
                setLoading(false);
                setToasterData({
                    show: true,
                    type: "success",
                    message: response?.data?.message,
                });
                
                
                    } else {
                        setLoading(false);
                        setToasterData({
                            show: true,
                            type: "error",
                            message: response?.message,
                        });
                    }
                })

    }

    useEffect(() => {
        
        props.tab === 'user' ? 

        setColumns([
            {
                Header: 'Name',
                accessor: 'name',
                className: 'text-left user-name-in-table',
                Cell: localProps => <div className="user-details-in-table">
                    <p className="name">{localProps.value}</p>
                </div>
            },
            {
                Header: 'Investor Status',
                accessor: 'accreditation',
                className: 'number-of-inv-in-table',
                Cell: localProps =>
                    <p>{localProps.value?? '--'}</p>
            },
            {
                Header: 'No. Of Investments',
                accessor: 'totalInvestments',
                className: 'text-right number-of-inv-in-table',
                Cell: localProps =>
                    <p>{localProps.value ?? 0}</p>
            },
            {
                Header: 'Funds Raised',
                accessor: 'totalFund',
                className: 'text-right funds-raised-in-table',
                Cell: localProps =>
                    <p>{currencifyInDollars(localProps.row.original?.totalFund ?? 0)}</p>
            },
            {
                Header: 'Last Login',
                accessor: 'lastLoginDate',
                filter: '',
                Filter: '',
                className: 'last-login-in-table',
                Cell: localProps =>
                    <p>{localProps.value ? convertToBaseFormatDate(localProps.value) : '--'}</p>
            },
            {
                Header: 'Action',
                accessor: '',
                Filter: '',
                filter: '',
                Cell: props => <div>
                    <CustomizedMenus options={['Send Password Reset Link', 'Send Email']} onSelect={(option) => handleOptionSelect(option, props.row.original)}/>
                </div>
            }
        ])
        
        
        : 
        
        setColumns([
            {
                Header: 'Name',
                accessor: row => `${row.firstName} ${row.lastName}`,
                className: 'text-left user-name-in-table',
                Cell: localProps => <div className="user-details-in-table">
                    <p className="name">{localProps.value}</p>
                </div>
            },
            {
                Header: 'Email',
                accessor: `email`,
                className: 'text-left user-name-in-table',
                Cell: localProps => <div className="user-details-in-table">
                    <p className="name">{localProps.value}</p>
                </div>
            },
            {
                Header: 'Last Login',
                accessor: 'lastLoginDate',
                filter: '',
                Filter: '',
                className: 'last-login-in-table',
                Cell: localProps =>
                    <p>{localProps.value ? convertToBaseFormatDate(localProps.value) : '--'}</p>
            },
            {
                Header: 'Action',
                accessor: '',
                Filter: '',
                filter: '',
                Cell: props => <div>
                    <CustomizedMenus options={['Send Password Reset Link', 'Send Email']} onSelect={(option) => handleOptionSelect(option, props.row.original)}/>
                </div>
            }
        ])
       
        
    }, [props.data])

    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };

    const handleOptionSelect = (option, column) => {

        switch (option) {
            case 'Send Password Reset Link':
                handleResetPasswordClick(column?.email)
                break;
            case 'Send Email':
                handleOpenModal(column);
                break;
            default:
                break;
        }
    };

        //modal box
        const handleOpenModal = (column) => {

            setEmailData(prevState => ({
                ...prevState,
                userId: column?.id, 
                email: column?.email
            }));

            setIsModalOpen(true);
        };
    
        const handleCloseModal = () => {
                setIsModalOpen(false);
                setEmailData({
                    email: '',
                    emailSubject: '',
                    emailBody: ''
                })
        };
    
        const handleCancel = () => {
            handleCloseModal();
            setLoading(false);
        }

        const handleChange = (e) => {
            const { name, value } = e.target;
            setEmailData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };
        
        const handleBodyChange = (value) => {
            setEmailData(prevState => ({
                ...prevState,
                emailBody: value
            }));
        };

        const handleSendEmail = (e) => {
            e.preventDefault();
            setLoading(true)
            callAPI.post(`./api/v1/email/sendEmailToUser`, emailData)
            .then(response => {
                if (response?.status === 200) {
                    handleCloseModal();
                    setLoading(false)
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data?.message,
                    });

                } else {
                    setLoading(false)
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                }
            })


        };

    return (


        <div className='user-details-wrapper'>

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

            <ReactTable
                columns={columns}
                data={props.data}
                title='Users'
                expandable={true}
            />
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="create-survey-modal-title"
                aria-describedby="create-survey-modal-description"
                className='medium-popup'
            >
                <div className="email-modal-wrapper">
                <div className='sendMailHeading'>
                    <h3>Send Email</h3>
                </div>
                <form className='emailFormStyle'  onSubmit={handleSendEmail}>
                    <TextField
                    InputLabelProps={{ shrink: true }}
                    label="Email"
                    fullWidth
                    name="email"
                    value={emailData.email || ''}
                    onChange={handleChange}
                    disabled={true}
                    />
                    <TextField
                        InputLabelProps={{ shrink: true }}
                        label="Subject"
                        fullWidth
                        name="emailSubject"
                        value={emailData.emailSubject || ''}
                        onChange={handleChange}
                    />
                <div>
                    <ReactQuill
                        theme="snow"
                        value={emailData.emailBody || ''}
                        onChange={handleBodyChange}
                        className='emailBodyStyle'
                    />
                    </div>
                    <div className="modal-buttons">
                        <Button variant="contained" type="submit" className='sendEmail'>{loading ? <CircularProgress size={24} /> : "Send"}</Button>
                        <Button variant="contained" color="secondary" className='cancleEmail'  onClick={handleCancel} >Cancel</Button>
                    </div>
                </form>
                </div>
            </Modal>
        </div>
        
    )
}

export default UserData