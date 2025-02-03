import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Modal, Button, Tooltip, FormControl, Typography, Table } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { formatCurrency } from '../../../commonFunctions/ConvertIntoCurrency';
import { splitDate, currencifyInDollars, formatDate, base64toUrl, isExcelFile, convertToBase64 } from '../../../commonFunctions/CommonMethod';
import Toaster from '../../shared/components/Toaster/Toaster';
import { ReactTable } from '../../shared/components/ReactTable/ReactTable'
import ConfirmPopUp from '../../shared/components/ConfirmPopUp/ConfirmPopUp';
import CustomizedMenus from '../../shared/components/DropdownMenu/CustomizedMenus';
import callAPI from '../../../commonFunctions/ApiRequests';



const AdminInvestments = (props) => {
    const navigate = useNavigate()
    const [columns, setColumns] = useState([])
    const [delemsg, setDelmsg] = useState(null)

    const options = ["Create Application",'Edit', "End Investment", "Delete"];
    const option = ['Edit', "Delete"]
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [confirmApproveModel, setConfirmApproveModel] = useState(false)
    const [InvestmentId, setInvestmentId] = useState('')
    const [deleteModel, setDeleteModel] = useState(false)
    const [deleteId, setDeleteId] = useState('')


    //edit 
    const editHandler = (data) => {
        const state = {
            type: 'edit',
            Investmentdata: data
        };
        // // navigate('/CreateCompany', { state: { type: "edit", companydata: JSON.stringify(data) } })
        navigate('/createInvestementOpportunity', { state: JSON.stringify(state) })
    }

    const fetchHandler = () => {
        props.fetchInvestmentData()
    }

    useEffect(() => {
        props.fetchInvestmentData()
    }, [delemsg])

    //End Investment
    const endInvestment = (id) => {
        const req = {
            id: id
        }
        callAPI.post(`./api/v1/investment/endInvestmentOpportunity`, req)
            .then((response) => {
                if (response.status === 200) {
                    setToasterData({
                        show: true,
                        type: "success",
                        message: response?.data.message
                    });
                    setConfirmApproveModel(false);
                    fetchHandler()
                    props.fetchCountData()
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message
                    });
                }
            })
    }
    const deleteInvestmentOpportunity = (id) => {
        // setLoading(true)
        if (id) {
            callAPI.del(`./api/v1/investment/deleteInvestmentOpportunity?id=${id}`)
                .then((response) => {
                    
                    if (response.data.status === 200) {
                        // props.setData()
                        setToasterData({
                            show: true,
                            type: "success",
                            message: response?.data?.message,
                        });
                        const updatedData = props.data.filter(item => item.id !== id);
                        props.setData(updatedData); 

                        setDeleteModel(false)
                        props.setDeletemsg(response?.data?.message)
                        setDelmsg(response?.data?.message)
                        props.fetchInvestmentData()
                         props.fetchCountData()
                    } else {
                        setToasterData({
                            show: true,
                            type: "error",
                            message: response?.message,
                        });
                        setDeleteModel(false)
                        //  setConfirmModel(false)
                    }
                })
            // setLoading(false)


        }

    }

    const handleOptionsClick = (data, options) => {
       
        if (options === "End Investment") {
            setConfirmApproveModel(true)
            setInvestmentId(data.id)
        } else if (options === "Edit") {
            editHandler(data)
        } else if (options === "Delete") {
            
            setDeleteModel(true);
            setDeleteId(data.id)
        }else if(options === 'Create Application') {
              navigate("/CreateApplication", { state: JSON.stringify(data) });
            }
        else {
            return;
        }
    }

    //toaster function
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };

    useEffect(() => {
        setColumns([
            {
                Header: 'Company',
                accessor: 'companyName',
                className: 'text-left company-name-in-table',
                Cell: localProps =>
                    <div className='d-flex align-items-center company-info-in-table'>
                        <div className='company-logo-in-table'>
                            <img src={localProps.row.original?.companyLogo} />
                        </div>
                        <b>{localProps.row.original?.companyName}</b>
                    </div>
            },
            {
                Header: 'Investment Opportunity',
                accessor: 'name',
                className: 'investment-name-in-table',
                Cell: localProps =>
                    <p>{localProps.value}</p>
            },
            {
                Header: 'No. Of People Invested',
                accessor: 'numberofInvestors',
                className: 'text-right people-invested-in-table',
                Cell: localProps =>
                    <p>{localProps.row.original?.numberofInvestors ?? 0}</p>
            },
            {
                Header: 'Total Invested Amount',
                accessor: 'totalFundRaised',
                className: 'text-right people-invested-in-table',
                Cell: localProps =>
                    <p>{currencifyInDollars(localProps.value ?? 0)}</p>
            },
            {
                Header: 'Actions',
                accessor: '',
                filter: '',
                Filter: '',
                className: '',
                Cell: localProps =>

                    <div>
                        <CustomizedMenus
                            options={localProps.row.original?.investmentStatus === "ActiveInvestment" ? options : option}
                            onSelect={(option) => handleOptionsClick(localProps.row.original, option)} />
                    </div>

            }
        ])
    }, [props.data])




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

            <ReactTable
                columns={columns}
                data={props.data}
                title='Investments'
                expandable={true}
            />


            <ConfirmPopUp
                open={confirmApproveModel}
                message='end the investment'
                agreeOnClick={() => endInvestment(InvestmentId)}
                denyOnClick={() => { setConfirmApproveModel(false) }}
                primaryAction='Yes'
                secondaryAction='No'
            />
            <ConfirmPopUp
                open={deleteModel}
                message='delete'
                agreeOnClick={() => deleteInvestmentOpportunity(deleteId)}
                denyOnClick={() => { setDeleteModel(false) }}
                primaryAction='Yes'
                secondaryAction='No'
            />
        </>

    )

}

export default AdminInvestments;