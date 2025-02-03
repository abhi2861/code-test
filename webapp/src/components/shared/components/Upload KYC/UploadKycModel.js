import { Button, FormControl, Modal, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { convertToBase64, isExcelFile } from '../../../../commonFunctions/CommonMethod'
import InputFileIcon from '../../../../assets/Icons/input-file-icon.svg'
import CustomTooltip from '../CustomTooltip/CustomTooltip'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import callAPI from '../../../../commonFunctions/ApiRequests'
import { useNavigate } from 'react-router-dom'
import Toaster from '../Toaster/Toaster'


const UploadKycModel = (props) => {
    const Navigate = useNavigate()
    const userData = JSON.parse(localStorage.getItem('userDetails'))
    const [uploadKyc, setUploadKyc] = useState({
        document: null,
    })
    const [responseDoc, setResponseDoc] = useState({document: null})
    const [optionalUpload, setOptionalUpload] = useState(null)
    const [loading, setLoading] = useState(false);
    const [uploads, setUploads] = useState([])
    const [isFileUpload, setIsFileUpload] = useState(null)
    //for toaster
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });

    const [errors, setErrors] = useState({})
    const [fileUrl, setFileUrl]=useState('')

const handleKYCUploadAPI=()=>{
    const req = {
        document: uploadKyc?.document,
        loggedInUserId:userData?.id
    }
    setLoading(true)
    callAPI.post('./api/v1/user/uploaduserkyc', req)
        .then((response) => {
            if (response.status === 200) {
                setToasterData({
                    show: true,
                    type: "success",
                    message: "Your document uploaded! just wait for varification.",
                });
                setLoading(false)
                handleKYCRetriveAPI()
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
const handleKYCRetriveAPI=()=>{
    const req = {
        loggedInUserId:userData?.id
    }
    setLoading(true)
    callAPI.get('./api/v1/user/getuserkyc',req)
        .then((response) => {
            if (response.status === 200) {
                setLoading(false)
             const responseDocuments= response?.data?.documents?.at(-1);
              setResponseDoc({...responseDoc,document:responseDocuments})
              
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


const handleDocClick = (docLink) => {

    const req = {
      docLink: docLink
    };

    callAPI.post('./api/v1/document/getDocumentLink', req)
      .then((response) => {
        if (response.status === 200) {
          const file = response?.data?.data;
          const newWindow = window.open(file, '_blank');

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
        else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
        }
      })
  }

useEffect(() => {
    handleKYCRetriveAPI()
}, [])

useEffect(()=>{
    uploadKyc.document && handleKYCUploadAPI()
},[uploadKyc.document])

    const uploadoptionalFile = async (e) => {
        const file = e.target.files?.length ? e.target.files[0] : null;
        const maxSize = 8 * 1024 * 1024
        if (file && file.size <= maxSize) {
            if (file && !isExcelFile(file)) { // Check if the file is not an Excel sheet
                setOptionalUpload(file);
                setIsFileUpload(file)
                const base64 = await convertToBase64(file);
                setUploadKyc({
                    ...uploadKyc,
                    document: {
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

    

    const createHandleMenuClick = (menuItem) => {
        return () => {
    
          if (menuItem === 'Log out') {
    
            // dispatch(logout());
            callAPI.get(`./api/v1/auth/logout`)
                .then((response) => {
                    if (response.status === 200) {
                      console.log('response', response?.message)
                    } else {
                      console.log('response', response?.message)
                    }
                })
    
            localStorage.clear()
            Navigate("/", { state: { isAuthenticated: false, isLogout: true } });
          };
        };
    
      }
     //toaster function
  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
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
        
        <Modal
            open={props.open}
            onClose={props.onClose}
            className='d-flex align-items-center justify-content-center confirm-modal-popup'
       
        >
            <div className="modal-paper">
                <div className='modal-header'>
                    <h4>Upload document for kyc approval</h4>
                </div>
               <div className=''>
                            <div className='input-field-wrapper position-relative'>
                                <FormControl fullWidth>
                                    <div className='upload-file-wrap'>
                                        <span className='upload-icon'><img src={InputFileIcon} /></span>
                                        <div className='upload-file-text'>
                                            <>
                                                <Typography>Upload Document</Typography>
                                                <small className='d-flex align-items-center'>
                                                    {(responseDoc && responseDoc?.document?.fileName) ? <small className='line-clamp-1'>{responseDoc?.document?.fileName}</small> : <small>JPG, PNG, XML, PDF <br />Max upload file size: 8MB</small>}
                                                    {
                                                        responseDoc?.document ?
                                                            <>
                                                                <CustomTooltip title="View" placement="right">
                                                                    <RemoveRedEyeIcon onClick={() => {handleDocClick(responseDoc?.document?.fileLink) }} className='ml-5px cursor-pointer view-doc' />
                                                            
                                                                </CustomTooltip>

                                                            </>

                                                            : ''

                                                    }

                                                </small>
                                            </>
                                        </div>
                                        {
                                            optionalUpload && optionalUpload?.name ?

                                                null:
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
                <div className='modal-actions align-right'>
                    <Button className='default-btn' onClick={createHandleMenuClick('Log out')} variant="contained" color="primary">Signout</Button>
                   
                </div>
            </div>
        </Modal>
        </>
    )
}

export default  UploadKycModel