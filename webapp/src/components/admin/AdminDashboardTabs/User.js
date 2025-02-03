import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  TextField,
  TablePagination,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  FilterList,
} from "@material-ui/icons";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import { userData } from './usersData';
import callAPI from "../../../commonFunctions/ApiRequests";
import { ReactTable } from "../../shared/components/ReactTable/ReactTable";
import Toaster from "../../shared/components/Toaster/Toaster";
import Loader from "../../shared/components/Loader/Loader";
import CustomizedMenus from "../../shared/components/DropdownMenu/CustomizedMenus";
import {
  currencifyInDollars,
  splitDate,
  convertToBaseFormatDate,
} from "../../../commonFunctions/CommonMethod";
import "./User.scss";

const User = () => {
  const userData = JSON.parse(localStorage.getItem("userDetails"));
  const [userListData, setUserListData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    email: "",
    emailSubject: "",
    emailBody: "",
  });

  const role = localStorage.getItem("role");

  const getUsersData = () => {
    setLoading(true);
    callAPI
      .get(`./api/v1/user/usersList?status=Closed&role=${role}`)
      .then((response) => {
        if (response?.status === 200) {
          let data = response?.data?.data;
          if (data && data.length > 0) {
            data = data.map((item) => {
              return {
                name: item?.name,
                email: item?.email,
                phone: item?.phone,
                // totalInvestments: item?.totalInvestments,
                totalInvestments:
                  item?.investmetDetails?.length > 0
                    ? item?.investmetDetails?.length
                    : 0,
                totalFund: item?.totalFund,
                lastLoginDate: item?.lastLoginDate,
                id: item?.id,
                accreditation: item?.accreditation,
                kycApproved: item?.kycApproved,
                innerJSX:
                  item?.investmetDetails &&
                  item?.investmetDetails.length > 0 ? (
                    <tr>
                      <td colSpan={8} className="innerTable">
                        <Table className="admins-user-table">
                          <thead>
                            <th className="company-in-table">Company</th>
                            <th className="investment-name-in-table">
                              Investment Opportunity
                            </th>
                            <th className="text-right investment-name-in-table">
                              Invested Amount
                            </th>
                            <th className="text-right current-amount-in-table">
                              Current Amount
                            </th>
                          </thead>
                          <tbody>
                            {item.investmetDetails.map((innerItem) => {
                              return (
                                <tr>
                                  <td className="company-in-table">
                                    <div className="d-flex align-items-center company-info-in-table">
                                      <div className="company-logo-in-table">
                                        <img src={innerItem?.companyLogo} />
                                      </div>
                                      <b>{innerItem?.companyName}</b>
                                    </div>
                                  </td>
                                  <td className="investment-name-in-table">
                                    {innerItem?.investmentName}
                                  </td>
                                  <td className="text-right investment-name-in-table">
                                    {currencifyInDollars(innerItem?.amount) ??
                                      0.0}
                                  </td>
                                  <td className="text-right current-amount-in-table">
                                    {currencifyInDollars(
                                      innerItem?.currentValue ?? 0.0
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </td>
                    </tr>
                  ) : null,
              };
            });
            setUserListData(data);
          }
          setLoading(false);
        } else {
          setLoading(false);
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
        }
      });
  };

  const handleResetPasswordClick = (email) => {
    setLoading(true);

    callAPI
      .post("./api/v1/email/requestResetPassword", { email: email })
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
      });
  };

  const handleApproveKyc = (userId) => {
    setLoading(true);

    const req = {
      userId: userId,
      isApproved: true,
    };

    callAPI.post("./api/v1/user/approveKyc", req).then((response) => {
      if (response.status === 200) {
        setLoading(false);
        setToasterData({
          show: true,
          type: "success",
          message: response?.data?.message,
        });
        getUsersData();
      } else {
        setLoading(false);
        setToasterData({
          show: true,
          type: "error",
          message: response?.message,
        });
      }
    });
  };

  useEffect(() => {
    getUsersData();
  }, []);

  useEffect(() => {
    setColumns([
      {
        Header: "Name",
        accessor: "name",
        className: "text-left user-name-in-table",
        Cell: (localProps) => (
          <div className="user-details-in-table">
            <p className="name name-text">{localProps.value}</p>
          </div>
        ),
      },
      {
        Header: "Email",
        accessor: "email",
        className: "number-of-inv-in-table",
        Cell: (localProps) => (
          <p className="email-text">{localProps.value ?? "--"}</p>
        ),
      },
      {
        Header: "Phone",
        accessor: "phone",
        className: "number-of-inv-in-table",
        Cell: (localProps) => <p>{localProps.value ?? "--"}</p>,
      },
      {
        Header: "Investor Status",
        accessor: "accreditation",
        className: "number-of-inv-in-table",
        Cell: (localProps) => (
          <p className="number-of-inv-in-table">{localProps.value ?? "--"}</p>
        ),
      },
      {
        Header: "No. Of Investments",
        accessor: "totalInvestments",
        className: "text-right number-of-inv-in-table",
        Cell: (localProps) => <p>{localProps.value ?? 0}</p>,
      },
      {
        Header: "Funds Raised",
        accessor: "totalFund",
        className: "text-right funds-raised-in-table",
        Cell: (localProps) => (
          <p>{currencifyInDollars(localProps.row.original?.totalFund ?? 0)}</p>
        ),
      },
      {
        Header: "Last Login",
        accessor: "lastLoginDate",
        filter: "",
        Filter: "",
        className: "last-login-in-table",
        Cell: (localProps) => (
          <p>
            {localProps.value
              ? convertToBaseFormatDate(localProps.value)
              : "--"}
          </p>
        ),
      },
      // {
      //   Header: "KYC Status",
      //   accessor: "kycApproved",
      //   filter: "",
      //   Filter: "",
      //   className: "last-login-in-table",
      //   Cell: (localProps) => (
      //     <p
      //       className={`${
      //         localProps.value ? "success-color" : "pending-color"
      //       }`}
      //     >
      //       {localProps.value ? "Approved" : "Pending"}
      //     </p>
      //   ),
      // },
      {
        Header: "Action",
        accessor: "",
        Filter: "",
        filter: "",
        Cell: (props) => (
          <div>
            <CustomizedMenus
              options={[
                "Send Password Reset Link",
                "Send Email",
                ...(props?.row?.original?.kycApproved ? [] : ["Approve"]),
              ]}
              onSelect={(option) =>
                handleOptionSelect(option, props.row.original)
              }
            />
          </div>
        ),
      },
    ]);
  }, [userListData]);

  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handleOptionSelect = (option, column) => {
    switch (option) {
      case "Send Password Reset Link":
        handleResetPasswordClick(column?.email);
        break;
      case "Send Email":
        handleOpenModal(column);
        break;
      case "Approve":
        handleApproveKyc(column?.id);
        break;
      default:
        break;
    }
  };

  //modal box
  const handleOpenModal = (column) => {
    setEmailData((prevState) => ({
      ...prevState,
      userId: column?.id,
      email: column?.email,
    }));

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmailData({
      email: "",
      emailSubject: "",
      emailBody: "",
    });
  };

  const handleCancel = () => {
    handleCloseModal();
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBodyChange = (value) => {
    setEmailData((prevState) => ({
      ...prevState,
      emailBody: value,
    }));
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    callAPI
      .post(`./api/v1/email/sendEmailToUser`, emailData)
      .then((response) => {
        if (response?.status === 200) {
          handleCloseModal();
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
      });
  };

  return (
    <div className="user-details-wrapper">
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
        data={userListData}
        title="Users"
        expandable={true}
      />
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="create-survey-modal-title"
        aria-describedby="create-survey-modal-description"
        className="medium-popup"
      >
        <div className="email-modal-wrapper">
          <div className="sendMailHeading">
            <h3>Send Email</h3>
          </div>
          <form className="emailFormStyle" onSubmit={handleSendEmail}>
            <TextField
              InputLabelProps={{ shrink: true }}
              label="Email"
              fullWidth
              name="email"
              value={emailData.email || ""}
              onChange={handleChange}
              disabled={true}
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              label="Subject"
              fullWidth
              name="emailSubject"
              value={emailData.emailSubject || ""}
              onChange={handleChange}
            />
            <div>
              <ReactQuill
                theme="snow"
                value={emailData.emailBody || ""}
                onChange={handleBodyChange}
                className="emailBodyStyle"
              />
            </div>
            <div className="modal-buttons">
              <Button variant="contained" type="submit" className="sendEmail">
                {loading ? <CircularProgress size={24} /> : "Send"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                className="cancleEmail"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default User;
