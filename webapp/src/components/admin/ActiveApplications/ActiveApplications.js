import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import callAPI from '../../../commonFunctions/ApiRequests';
import { formatCurrency } from '../../../commonFunctions/ConvertIntoCurrency';
import { splitDate, currencifyInDollars, formatDate, convertToBaseFormatDate } from '../../../commonFunctions/CommonMethod';
import CustomizedMenus from '../../shared/components/DropdownMenu/CustomizedMenus';
import Toaster from '../../shared/components/Toaster/Toaster';
import AddSurvey from '../../../assets/ActionIcons/Add-Survey.svg'
import { ReactTable } from '../../shared/components/ReactTable/ReactTable';
import Loader from '../../shared/components/Loader/Loader'
import ConfirmPopUp from '../../shared/components/ConfirmPopUp/ConfirmPopUp';
import CustomTooltip from "../../shared/components/CustomTooltip/CustomTooltip";



const ActiveApplications = (props) => {

    const navigate = useNavigate()

    //state for companies data
    const [columns, setColumns] = useState([])
    //for toaster
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);

    const [confirmModel, setConfirmModel] = useState(false)
    const [confirmApproveModel, setConfirmApproveModel] = useState(false)

    const [rejectApplicantId, setRejectApplicantId] = useState('');

    const [approvedApplicantId, setApprovedApplicantId] = useState('');

    const initialApplicationStatus = ['Approve', 'Reject'];

    const [refundActions, setRefundActions] = useState([])

    const [statusActions, setStatusActions] = useState([])
    const[deleteModel,setDeleteModel]=useState(false)
    const[deleteId,setDeleteId]=useState('')

    const menuIcons = [AddSurvey]

    const refundactions = refundActions.filter(stage => stage.order);
    const refundactionsStages = refundactions.map(stage => stage.value);
useEffect(()=>{
    const updateStatusAction={
        value: "Delete",
        order: 10
    }
    statusActions.push(updateStatusAction)

}, [statusActions])

    useEffect(() => {
        setColumns([
            {
                Header: 'Applicant Name',
                accessor: row => row.User?.firstName + row.User?.lastName,
                className: 'applicant-name-in-table',
                Cell: localProps =>
                    <div className="user-details-in-table">
                        <CustomTooltip title={localProps.row.original?.User?.email} placement='bottom'>
                            <b>{localProps.row.original?.User?.firstName} {localProps.row.original?.User?.lastName}</b>
                        </CustomTooltip>

                    </div>
            },
            {
                Header: 'Company',
                accessor: row => row.company?.name,
                className: 'company-name-in-table text-left',
                Cell: localProps =>
                    <>
                        <div className='d-flex align-items-center company-info'>
                            <img src={localProps.row.original?.company?.logo} />
                            <p>{localProps.row.original?.company?.name}</p>
                        </div>
                    </>
            },
            {
                Header: 'Investment Opportunity',
                accessor: row => row.InvestmentOpportunity?.name,
                className: 'opportunity-name-in-table',
                Cell: localProps =>
                    <>
                        <p>{localProps.row.original?.InvestmentOpportunity?.name}</p>
                    </>
            },
            {
                Header: 'Application Date',
                accessor: row => convertToBaseFormatDate(row.requestedDate),
                className: 'application-date-in-table',
                Cell: localProps =>
                    <p>{localProps.value}</p>
            },

            {
                Header: 'Status',
                accessor: 'status',
                className: 'status-in-table',
                Cell: localProps => (<><p>{localProps?.value?.replace(/([A-Z])/g, ' $1')?.replace(/^./, str => str.toUpperCase()) ?? localProps?.value}</p></>)
            },
            {
                Header: 'Invested Amount',
                accessor: row => row?.amount,
                className: 'people-invested-in-table text-right',
                Cell: localProps => <>
                    <p>
                        {currencifyInDollars(localProps.row.original?.amount ?? 0)}
                    </p>
                </>
            },
            {
                Header: 'Actions',
                accessor: '',
                filter: '',
                Filter: '',
                Cell: localProps =>
                    props.tab === 'active' ?
                        <div>
                            <CustomizedMenus
                                options={localProps.row.original?.status !== "Applied" ? manipulatedStatus : initialApplicationStatus}
                                icon={menuIcons}
                                // onSelect={(option) => updateStatusManually(localProps.row.original?.id, option, localProps.row.original)}
                                onSelect={(option) => handleAllStatus(localProps.row.original?.id, option, localProps.row.original)}

                            />
                        </div>
                        :
                        <div>
                            <CustomizedMenus options={refundactionsStages} onSelect={(option) => handleAllStatus(localProps.row.original?.id, option, localProps.row.original)} />
                        </div>
            }
        ])
    }, [props.data, refundActions, statusActions])



    const approveApplication = (id) => {
        if (id) {
            callAPI.post('./api/v1/pandadocapis/createDocumentByTemplate', { userInvestmentId: id })
                .then((response) => {
                    if (response.status === 200) {
                        setToasterData({
                            show: true,
                            type: "success",
                            message: response?.data?.message,
                        });
                        setConfirmApproveModel(false);
                        props.fetchInvestmentData();
                        props.fetchCountData()
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

    const rejectApplication = (id) => {
        if (id) {
            callAPI.del(`./api/v1/investment/opportunityRejection?userInvestmentId=${id}`)
                .then((response) => {
                    if (response.status === 200) {
                        setToasterData({
                            show: true,
                            type: "success",
                            message: response?.data?.message,
                        });
                        setConfirmModel(false);
                        props.fetchInvestmentData()
                        props.fetchCountData()
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

    const updateStatusManually = (id, selectedStatus) => {
        setLoading(true)
        if (id) {
            callAPI.post('./api/v1/admin/updateApplicationStatus', { userInvestmentId: id, status: selectedStatus })
                .then((response) => {
                    if (response.status === 200) {
                        setToasterData({
                            show: true,
                            type: "success",
                            message: response?.data?.message,
                        });
                        props.fetchInvestmentData();
                        props.fetchCountData()
                    } else {
                        setToasterData({
                            show: true,
                            type: "error",
                            message: response?.message,
                        });
                        setConfirmModel(false)
                    }
                })
            setLoading(false)


        }

    }
const deleteActiveApplication = (id) => {
        setLoading(true)
        if (id) {
            callAPI.del(`api/v1/admin/deleteUserInvestment?id=${id}`)
                .then((response) => {
                    if (response.status === 200) {
                        setToasterData({
                            show: true,
                            type: "success",
                            message: response?.data?.message,
                        });
                        props.fetchInvestmentData();
                        props.fetchCountData()
                        setDeleteModel(false)
                    } else {
                        setToasterData({
                            show: true,
                            type: "error",
                            message: response?.message,
                        });
                        setDeleteModel(false)
                    }
                })
            setLoading(false)

            
        }

    }


    // handle status All here
    const handleAllStatus = (id, selectedStatus, originalData) => {
        if (selectedStatus === 'Approve') {
            setConfirmApproveModel(true)
            setApprovedApplicantId(id)
        } else if (selectedStatus === 'Reject') {
            setConfirmModel(true)
            setRejectApplicantId(id)
        } else if (typeof selectedStatus === 'string' && (selectedStatus !== 'Approve' || 'Reject')) {
            selectedStatus!=='Delete'&& updateStatusManually(id, selectedStatus)
            if(selectedStatus==='Delete'){           
                setDeleteModel(true)
                setDeleteId(id)
            }
           
        }else {
            return;
        }
    }



    //toaster function
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };


    const getRefundStatus = () => {
        setLoading(true)
        callAPI.get(`./api/v1/pandadocapis/getMasterData?type=refundStatus`)
            .then(response => {
                if (response?.status === 200) {
                    setRefundActions(response?.data?.data)
                    setLoading(false)
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
    const getStatusDropdown = () => {
        setLoading(true)
        callAPI.get(`./api/v1/pandadocapis/getMasterData?type=investmentStatus`)
            .then(response => {
                if (response?.status === 200) {
                    setStatusActions(response?.data?.data)
                    setLoading(false)
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

    useEffect(() => {
        getStatusDropdown();
        getRefundStatus()
    }, [])

    // **removing the first two stages from UI - Applied & Approved
    const updatedStages = statusActions.filter(stage => stage.order > 2);

    // ** storing the values - after approved
    const manipulatedStatus = updatedStages.map(stage => stage.value);

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
            <div className='company-details-wrapper active-application-wrapper'>
                <ReactTable
                    columns={columns}
                    data={props.data}
                    title='Applications'
                    expandable={false}
                />
            </div>

            <ConfirmPopUp
                open={confirmApproveModel}
                message='approve this application'
                agreeOnClick={() => approveApplication(approvedApplicantId)}
                denyOnClick={() => { setConfirmApproveModel(false) }}
                primaryAction='Yes'
                secondaryAction='No'
            />

            <ConfirmPopUp
                open={confirmModel}
                message='reject this Opportunity'
                agreeOnClick={() => rejectApplication(rejectApplicantId)}
                denyOnClick={() => { setConfirmModel(false) }}
                primaryAction='Yes'
                secondaryAction='No'
            />
            
             <ConfirmPopUp
                open={deleteModel}
                message='delete'
                agreeOnClick={() => deleteActiveApplication(deleteId)}
                denyOnClick={() => { setDeleteModel(false) }}
                primaryAction='Yes'
                secondaryAction='No'
            />

        </>
    )
}

export default ActiveApplications;