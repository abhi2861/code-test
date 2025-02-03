import React, { useEffect, useState, useRef } from "react";
import Header from "../../Header/Header";
import { Box, Button, IconButton, TextField, Tooltip } from "@mui/material";
import { ReactTable } from "../../shared/components/ReactTable/ReactTable";
import { splitDate, currencifyInDollars } from '../../../commonFunctions/CommonMethod';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import callAPI from "../../../commonFunctions/ApiRequests";
import Toaster from "../../shared/components/Toaster/Toaster";
import Loader from '../../shared/components/Loader/Loader'
import NumericInput from "../../shared/components/NumericInput/NumericInput";
import EditIcon from "../../../assets/ActionIcons/Edit.svg";
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import CustomTooltip from "../../shared/components/CustomTooltip/CustomTooltip";
import Footer from "../../Footer/Footer";

const FairMarketValue = () => {

  const [fmvData, setFmvData] = useState([])
  const [fmvInitialData, setfmvInitialData] = useState([])
  const userData = JSON.parse(localStorage.getItem('userDetails'))
  const fmvUpdatedData = useRef();
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)

  //for toaster
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });

  //toaster function
  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  //for company table
  const getCompanyData = () => {
    callAPI.get(`./api/v1/company/getCompany?loggedInId=${userData?.id}`)
      .then(response => {
        if (response?.status === 200) {
          response?.data?.data.forEach(item => {
            item.editing = false
          })
          setFmvData(response?.data?.data)
          setfmvInitialData(response?.data?.data)

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
    getCompanyData();
  }, [])

  useEffect(() => {
    setColumns([
      {
        Header: 'Company',
        className: 'company-in-table',
        accessor: 'name',
        filter: 'contains',
        Cell: localProps =>
          <div className='d-flex align-items-center company-info-in-table'>
            <div className='company-logo-in-table'>
              <img src={localProps.row.original?.logo} />
            </div>
            <b>{localProps.row.original?.name}</b>
          </div>
      },
      {
        Header: "Fair Market Value",
        className: 'fmv-in-table text-right',
        accessor: "fmvValue",
        filter: 'contains',
        Cell: localProps => (
          fmvData[localProps.row.index]?.editing ? (
            // <TextField
            //   size="small"
            //   inputRef={fmvUpdatedData}
            //   inputProps={{ type: 'number' }}
            //   defaultValue={localProps.value}
            // />
            <NumericInput
              size="small"
              onValueChange={(values) => handleChange(values.value, localProps.row.index)}
              // inputRef={fmvUpdatedData}
              // value={fmvUpdatedData?.current?.value}
              value={fmvInitialData[localProps.row.index]?.fmvValue}
              prefix={"$"}
              thousandSeparator={true}
              decimalScale={2}
              allowNegative={false}
            />
          ) : (
            <span> {localProps.value && Number(localProps.value) > 0 ? currencifyInDollars(localProps.value) : '--'}</span>
          )
        )
      },
      // {
      //   Header: 'Previous Updated On',
      //   className: 'previous-update-in-table',
      //   accessor: 'fmvVEffectiveDate',
      //   filter: 'contains',
      //   Cell: localProps =>
      //     <p>
      //       {splitDate(localProps.value, true)}
      //     </p>
      // },
      // {
      //   Header: "Previous Fair Market Value",
      //   className: 'previous-fmv-in-table',
      //   accessor: "fmvlastFairMarketValue",
      //   filter: 'contains',
      //   Cell: localProps =>
      //     <p>{currencifyInDollars(localProps.value) ?? 0}</p>
      // },
      {
        Header: "Actions",
        className: 'actions-in-table',
        accessor: "",
        filter: '',
        Filter: '',
        Cell: localProps => <>
          {fmvData[localProps.row.index]?.editing ?
            <span className="edit-actions d-flex align-items-center">
              <IconButton onClick={() => handleSave(localProps.row.index)}>
                <CustomTooltip title='Save' placement='bottom'>
                  <CheckIcon className='action-icon icon-color cursor-pointer' />
                </CustomTooltip>
              </IconButton>
              <IconButton onClick={() => handleCancel(localProps.row.index)}>
                <CustomTooltip title='Cancel' placement='bottom'>
                  <CloseIcon className='action-icon icon-color cursor-pointer' />
                </CustomTooltip>
              </IconButton>
            </span>
            :
            <>
              <CustomTooltip title="Edit" placement="bottom">
                <ModeEditOutlinedIcon className='action-icon icon-color cursor-pointer' onClick={() => handleEdit(localProps.row.index)} />
              </CustomTooltip>
              {/* <img src={EditIcon} /> */}
            </>
          }
        </>
      }
    ])
  }, [fmvData])

  const handleChange = (value, index) => {
    let newData = [...fmvInitialData];
    newData[index].fmvValue = value
    setfmvInitialData(newData);
  }

  const handleEdit = (index) => {
    let newData = JSON.parse(JSON.stringify(fmvData));
    newData.forEach(item => item.editing = false)
    newData[index].editing = true
    setFmvData(newData);
  };

  const handleSave = (index) => {
    setLoading(true)

    let FMVValue = fmvInitialData[index]?.fmvValue

    let req = {
      loggedInUserId: userData?.id,
      companyId: fmvData[index].id,
      fmvValue: FMVValue.replace(/[$ ,]/g, ''),
      // fmvVEffectiveDate: splitDate(new Date(), true)
    }

    if (fmvData[index].fmvValue)
      req['fmvlastFairMarketValue'] = fmvData[index].fmvValue

    callAPI.post('./api/v1/company/updateFMV', req)
      .then(response => {
        if (response.status == 200) {
          let newData = JSON.parse(JSON.stringify(fmvData));
          newData[index].editing = false
          setFmvData(newData);

          getCompanyData();
          setLoading(false);
          setToasterData({
            show: true,
            type: "success",
            message: 'Fair Market Value is Updatedd Successfully',
          });
        } else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
          setLoading(false)
        }
      })
  };

  const handleCancel = (index) => {
    const newData = [...fmvData];
    newData[index].editing = false;
    setFmvData(newData);
  };

  return (
    <div className="pageWrapperFix">
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
        loading ? <Loader show={loading} /> : null
      }
      <Header role="admin" />

      <div className="container fair-market-value-wrapper flex-grow-1">
        <Box className='heading-section'>
          {/* <h4>Fair Market Value</h4> */}
        </Box>

        <div className="fair-market-table">
          <ReactTable
            columns={columns}
            data={fmvData}
            title='Fair Market Value'
            expandable={false}
            isCustomPageCount={true}
            setPageCount={(count) => setPageCount(count)}
            tablePageCount={pageCount}
          />
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default FairMarketValue;
