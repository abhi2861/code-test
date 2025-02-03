// App.js
import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Tab, Box, Typography, Grid, FormControl, Button, Modal, TextField, Accordion, AccordionSummary, AccordionDetails, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PdfIcon from '../../../assets/Icons/adode-pdf.svg';
import Header from '../../Header/Header';
import './Documents.scss'
import File from '../../../assets/Icons/Files.svg';
import Folder from '../../../assets/Icons/Folder.svg';
import whiteRightArrow from '../../../assets/Icons/white-right-arrow.svg'
import callAPI from '../../../commonFunctions/ApiRequests';
import Toaster from '../../shared/components/Toaster/Toaster';
import { splitDate, convertToBaseFormatDate } from '../../../commonFunctions/CommonMethod';
import Loader from '../../shared/components/Loader/Loader'
import Footer from '../../Footer/Footer';
import closeIcon from '../../../assets/Icons/crossIcon.svg';
import ConfirmPopUp from '../../shared/components/ConfirmPopUp/ConfirmPopUp';
import Arrow from '../../../assets/Icons/Arrow.svg';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, } from "@mui/material";
import CustomizedMenus from '../../shared/components/DropdownMenu/CustomizedMenus';
import MoveIcon from '../../../assets/Icons/MoveIcon.svg';

import crossIcon from '../../../assets/Icons/crossIcon.svg';
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';




const Documents = () => {

  const userData = JSON.parse(localStorage.getItem('userDetails'))

  const userName = (`${userData.firstName} ${userData.lastName}`)


  const navigate = useNavigate()
  const [usersData, setUsersData] = useState([]);
  const [uploads, setUploads] = useState(null)
  const [isFileUpload, setIsFileUpload] = useState(null)
  const [path, setPath] = useState([`${userData?.firstName} ${userData?.lastName}`]);
  const [createFolderModel, setCreateFolderModel] = useState(false)
  const [folderName, setFolderName] = useState(null)
  const [loading, setLoading] = useState(false);
  const [toasterData, setToasterData] = useState({
    show: false,
    type: '',
    message: ''
  })

  const [userdocuments, setDocuments] = useState({})
  const [mainFolders, setMainFolder] = useState({})
  const [subfolderData, setSubFolderData] = useState({})
  const [allFolders, setAllFolders] = useState([])
  const [showFolder, setShowFolder] = useState(false)
  const [getFolder, setGetFolder] = useState('')
  const [getUserName, setUserName] = useState('')
  const [showSubFolder, setShowSubFolder] = useState(false)
  const [subFolderName, setSubFolderName] = useState('')
  const [stringSubFolder, setStringSubFolder] = useState('')
  const [selectedUser, setSelectedUser] = useState(null);
  const [msgErr, setMsgErr] = useState("")
  const [listShow, setListShow] = useState(false)


  const [subFolderPath, setSubFolderPath] = useState(null)
  const [buttonloading, setButtonLoder] = useState(false)

  const [isOpen, setIsOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [activeMoveFileId, setActiveMoveFileId] = useState(null);
  const [selectedFileToMove, setSelectedFileToMove] = useState(null);

  const fileInputRef = useRef(null);


  const getDocuments = () => {
    // setLoading(true)
    callAPI.get(`./api/v1/document/getDocuments?role=user`)
      .then((response) => {
        if (response.status === 200) {
          setUsersData(response?.data?.data)
          // setSelectedUser(response?.data?.data[0].userId)
          setLoading(false)


        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  //get documents by userId
  const documentByUserId = (id) => {
    setLoading(true)
    callAPI.get(`./api/v1/document/getFilesByFolderName?userId=${id}`)
      .then((response) => {
        if (response.status === 200) {
          setDocuments(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  //get data by folderName
  const documentByFolderName = (folderName) => {
    setLoading(true)
    callAPI.get(`./api/v1/document/getFilesByFolderName?userId=${selectedUser}&folderName=${folderName}`)
      .then((response) => {
        if (response?.status === 200) {

          setMainFolder(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })

  }


  //get data by sub-folder-name
  const getFilesBySubFolder = (folderName) => {
    setLoading(true)
    callAPI.get(`./api/v1/document/getFilesByFolderName?userId=${selectedUser}&folderName=${folderName}`)
      .then((response) => {
        if (response?.status === 200) {
          setSubFolderData(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  // get all folders
  const getAllFolderName = () => {



    setLoading(true)
    callAPI.get(`./api/v1/document/getAllFolderName?userId=${selectedUser}`)
      .then((response) => {
        if (response?.status === 200) {
          setAllFolders(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }


  useEffect(() => {
    getDocuments()
    documentByUserId(userData?.id)
    setSelectedUser(userData?.id)
  }, [])

  useEffect(() => {
    if (selectedUser) {
      getAllFolderName();
    }
  }, [selectedUser]);


  // let subfolderstring = (folder?.folderName).slice(0, -1).split('/');
  // let lastsubfolder = subfolderstring[subfolderstring.length - 1];

  const foldersList = userdocuments?.folder?.map((item) => item.folderName.replace('/', ''))
  // const outerFolderList = userdocuments?.folder?.map((item) => item.folderName.replace('/', ''))
  // const innerFolderList = mainFolders?.folder?.map((item) => {
  //   let subfolderstring = (item?.folderName).slice(0, -1).split('/');
  //   let lastsubfolder = subfolderstring[subfolderstring.length - 1];
  //   return lastsubfolder
  // })

  //for uploading optional file
  const uploadoptionalFile = async (e) => {
    const file = e.target.files[0];
    const maxSize = 8 * 1024 * 1024
    if (file && file.size <= maxSize) {
      if (file && !isExcelFile(file)) {
        setIsFileUpload(file);
        const base64 = await convertToBase64(file);
        setUploads({
          ...uploads,
          documents: {
            fileType: file.type,
            base64Data: base64,
            fileName: file.name
          }
        });
        fileInputRef.current.value = null;
      }


    }
    else if (file && file.size > maxSize) {
      setToasterData({
        show: true,
        type: "error",
        message: 'File size exceeds 8MB limit.'
      });
    }
    else {
      setToasterData({
        show: true,
        type: "error",
        message: 'File type not supported. Please select a different file.'
      });
    }
  }



  // Function to check if the file is an Excel sheete
  const isExcelFile = (file) => {
    const acceptedExcelTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    return file && acceptedExcelTypes.includes(file.type);
  };

  // convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result)
      }
      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }


  //for remove
  const removeFile = () => {
    setIsFileUpload(null)
    setUploads(
      {
        ...uploads,
        documents: null
      }
    )
  }

  const handleClickAddFolder = () => {
    setCreateFolderModel(true)
    setMsgErr("")
  }
  const handleFolderCreate = () => {
    if (folderName && folderName.trim() !== '') {

      // const newPath = [...path, folderName];
      let req
      const newPath = [folderName.trim()];
      const folderPath = path
      const folder_0 = newPath.join('/') + '/';

      //this is for mainfolder
      // if (folderPath[0] === getFolder) {
      //   req = {
      //     userId: selectedUser,
      //     folder_0: getFolder,
      //     folder_1: folder_0
      //   }
      // } else {
      //   // this is for directory
      //   req = {
      //     userId: selectedUser,
      //     folder_0: folder_0,
      //   }
      // }

      if (showFolder) {
        if (showFolder && showSubFolder) {
          return;
        } else {
          req = {
            userId: selectedUser,
            folder_0: getFolder,
            folder_1: folder_0,
            action: "action"
          }
        }
      } else {
        req = {
          userId: selectedUser,
          folder_0: folder_0,
          action: "action"
        }
      }

      setButtonLoder(true)
      callAPI.post('./api/v1/document/documentUpload', req)
        .then((response) => {
          if (response.status === 200) {
            setToasterData({
              show: true,
              type: "success",
              message: "Folder created successfully",
            });
            setButtonLoder(false)
            setCreateFolderModel(false);
            getAllFolderName()
            if (showFolder) {
              if (showFolder && showSubFolder) {
                getFilesBySubFolder(folderPath)
              } else {
                documentByFolderName(getFolder)
              }
            } else {
              documentByUserId(selectedUser)
            }
          }
          else {
            setButtonLoder(false)
            setToasterData({
              show: true,
              type: "error",
              message: response?.message,
            });

          }
        })

      setPath(newPath);
      setFolderName(null)

    } else {
      setMsgErr("Folder name cannot be empty")
    }

  }

  const handleSetFolderName = (e) => {
    setFolderName(e.target.value)
    setMsgErr("")
  }

  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handleSubmit = () => {

    let req
    if (!uploads || !uploads.documents) {
      setToasterData({
        show: true,
        type: "error",
        message: 'Please select a file to upload.',
      });
      return;
    }

    const newpath = path
    const folder_0 = path.join('/') + '/';
    // const folderPath = path.join('/') + '/';
    //getFilesBySubFolder(newpath)
    //this is for sub-folder
    // if (subFolderName) {
    //   let newstring = newpath[0]
    //   let slicedString = newstring.slice(0, -1).split('/');
    //   let lastIndexValue = slicedString[slicedString.length - 1];
    //   req = {
    //     userId: selectedUser,
    //     folder_0: getFolder,
    //     folder_1: lastIndexValue + '/',
    //     document: uploads?.documents
    //   }
    // } else if (newpath[0] === getFolder) {
    //   //this is for main folder
    //   //documentByFolderName(getFolder)
    //   req = {
    //     userId: selectedUser,
    //     document: uploads?.documents,
    //     folder_0: getFolder,
    //     folder_1: null

    //   }

    // } else {
    //   //this is for directory
    //   //documentByUserId(selectedUser)
    //   req = {
    //     userId: selectedUser,
    //     document: uploads?.documents,
    //     folder_0: null,
    //     folder_1: null

    //   }
    // }


    if (showFolder) {
      if (showFolder && showSubFolder) {
        let newstring = newpath[0]
        let slicedString = newstring.slice(0, -1).split('/');
        let lastIndexValue = slicedString[slicedString.length - 1];
        req = {
          userId: selectedUser,
          folder_0: getFolder,
          folder_1: lastIndexValue + '/',
          document: uploads?.documents,
          action: "action"
        }
      } else {
        req = {
          userId: selectedUser,
          document: uploads?.documents,
          folder_0: getFolder,
          folder_1: null,
          action: "action"
        }
      }

    } else {
      req = {
        userId: selectedUser,
        document: uploads?.documents,
        folder_0: null,
        folder_1: null,
        action: "action"

      }
    }

    setButtonLoder(true)
    callAPI.post('./api/v1/document/documentUpload', req)
      .then((response) => {
        if (response.status === 200) {
          setToasterData({
            show: true,
            type: "success",
            message: "File uploaded successfully",
          });
          setUploads({})
          setIsFileUpload(null)
          if (showFolder) {
            if (showFolder && showSubFolder) {
              getFilesBySubFolder(newpath)
            } else {
              documentByFolderName(getFolder)
            }
          } else {
            documentByUserId(selectedUser)
          }
          setButtonLoder(false)
        }

        else {
          setButtonLoder(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
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



  //open folder
  const handleOpenFolder = (foldertype, folderName) => {
    setShowFolder(true)
    setGetFolder(folderName)
    setShowSubFolder(false)
    setPath([folderName])
    documentByFolderName(folderName)
    //api-call
  }

  //open sub folder
  const handleOpenSubFolder = (foldertype, folderName) => {
    let slicedString = folderName.slice(0, -1).split('/');

    // Get the last index value
    let lastIndexValue = slicedString[slicedString.length - 1];
    setStringSubFolder(lastIndexValue)
    setSubFolderPath(folderName)
    setShowSubFolder(true)
    setSubFolderName(folderName)
    getFilesBySubFolder(folderName)
    setPath([folderName])

    //api-call
  }


  //back to Mainfolder
  const backToFolder = () => {
    setSubFolderName('')
    setShowFolder(false)
    setGetFolder('')
    setStringSubFolder('')
    setSubFolderPath(null)

  }

  //back to subfolder
  const backToSubFolder = () => {
    setShowSubFolder(false)
    setStringSubFolder('')
    setSubFolderName('')
    setSubFolderPath(null)
  }

  const handleFileDelete = (fileId,) => {
    const folderPath = path
    callAPI.del(`./api/v1/document/deleteDocument?id=${fileId}`)
      .then((response) => {
        if (response.status === 200) {
          setToasterData({
            show: true,
            type: "success",
            message: response?.data?.message,
          });
          setIsOpen(false);
          if (showFolder) {
            if (showFolder && showSubFolder) {
              getFilesBySubFolder(folderPath)
            } else {
              documentByFolderName(getFolder)
            }
          } else {
            documentByUserId(selectedUser)
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

  const toogleOpen = (id) => {

    setIsOpen(true);
    setStoreId(id);
  };

  const settingObjs = () => {
    setButtonLoder(false)
    setCreateFolderModel(false);
    setFolderName("")
    setMsgErr("");
  }

  useEffect(() => {
    if (uploads && uploads.documents) {
      handleSubmit();
    }
  }, [uploads]);


  const handleSubmitMove = (folderZero, folderOne) => {


    // const addSlash = (value) => {
    //   return value ? (value.endsWith('/') ? value : `${value}/`) : value;
    // };

    // const optionWithSlash = addSlash(option);
    // const folder0WithSlash = addSlash(files.folder_0);
    const folderPath = path


    let req = {
      userId: selectedUser,
      docLink: selectedFileToMove.docLink,
      fileName: selectedFileToMove.fileName,
      id: selectedFileToMove.id,
      uploadedBy: selectedFileToMove.uploadedBy,
      uploadedDate: selectedFileToMove.uploadedDate,
      action: 'move',
      folder_0: folderZero,
      folder_1: folderOne,
    };

    callAPI.post('./api/v1/document/documentUpload', req)
      .then((response) => {
        if (response.status === 200) {
          // documentByUserId(userData?.id)
          setToasterData({
            show: true,
            type: "success",
            message: "File moved successfully",
          });

          documentByUserId(selectedUser);

          if (showFolder) {
            if (showFolder && showSubFolder) {
              getFilesBySubFolder(folderPath);
              documentByFolderName(folderZero);
              documentByUserId(selectedUser);
            } else {
              documentByFolderName(getFolder)
            }
          } else {
            documentByUserId(selectedUser)
          }

          // if (showFolder && showSubFolder) {
          //   getFilesBySubFolder(folderPath)
          //   // getFilesBySubFolder(selectedUser)
          //   // getFilesBySubFolder(path[0])
          //   console.log(selectedUser, "if", path[0]);
          // } else if (showFolder) {
          //   console.log(selectedUser, "else if", path[0]);
          //   getFilesBySubFolder(path[0])
          //   getFilesBySubFolder(selectedUser)
          // } else {
          //   console.log(selectedUser, "else", path[0]);
          //   getFilesBySubFolder(selectedUser)
          // }

        }
        else {
          setButtonLoder(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });

        }
      })

    closeListShow()

  }

  // const handleOnlyMove()

  const handleOptionSelect = (option, files) => {

    if (option === 'Delete') {

      toogleOpen(files?.id)

    } else if (option === 'Move') {
      handleFileListPopup()
      setSelectedFileToMove(files)
      // setActiveMoveFileId(files?.id);
    }
  };

  const handleFileListPopup = (fileList) => {
    setListShow(true);
  }


  // const data = props.folders;


  const handleFolderSelect = (folderZero, folderOne) => {
    handleSubmitMove(folderZero, folderOne)
  };


  const closeListShow = () => {
    setListShow(false)
  }

  return (
    <div className='pageWrapperFix user-documents-wrapper'>
      <Header />
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
      <div className='flex-100 d-flex documents-header-section'>
        <Box className='user-list-tabs'>
          <h4 className='container-padding'>Documents</h4>
        </Box>
        <ConfirmPopUp
          open={isOpen}
          onClose={() => { setIsOpen(false) }}
          message='delete this file'
          agreeOnClick={() => handleFileDelete(storeId)}
          denyOnClick={() => { setIsOpen(false) }}
          primaryAction='Yes'
          secondaryAction='No'
        />
        <Box sx={{ marginLeft: '30px', cursor: "pointer" }} className='d-flex align-items-center flex-grow-1 folder-Path-View'>

          {/* <div className='path-names'>
          <b>
            {userData ?
            <span>{userData.firstName + " " + userData.lastName}</span> :
            getFolder ?
            <span>{getFolder.replace("/", "")}</span> :
            stringSubFolder ?
            <span>{stringSubFolder}</span> :
            ""
            }
          </b>
        </div> */}

          <div className='path-position'>
            <div className='breadcrumb-container'>
              {/* {path.map((item, index) => (
              <div key={index}>
                <span onClick={() => { backToFolder() }}>{item}</span>
                {index !== path.length - 1 && <img src={whiteRightArrow} alt="right arrow" />}
              </div>
            ))} */}

              <p className='selected-user-name' onClick={() => { backToFolder() }}>{userData?.firstName + userData?.lastName}</p>
            </div>
            {
              getFolder ?
                <>
                  <img src={Arrow} className='arrowSign' />
                  <span className='ml-5px folderNamePath' onClick={() => { backToSubFolder() }}>{getFolder?.replace("/", "")}</span>
                </> : ""
            }
            {
              stringSubFolder ? <><img src={Arrow} className='arrowSign' /><span className='ml-5px subFolderNamePath'>{stringSubFolder}</span></> : ''
            }
          </div>
          {
            subFolderName === "" ? <Button variant='contained' onClick={handleClickAddFolder}
              sx={{
                marginLeft: '20px',
                borderRadius: '32px',
                fontSize: '16px',
                padding: '0px 10px 5px 10px',
                zIndex: '98'
              }}
            >+ Folder </Button> : ''
          }

        </Box>

        <Modal
          open={createFolderModel}
          onClose={settingObjs}
          className='d-flex align-items-center justify-content-center confirm-modal-popup'
        >
          <div className="modal-paper">
            <div className='modal-header'>
              <h3>Create a folder</h3>
            </div>
            <div className='modal-body'><TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              label="Enter folder name"
              type="text"
              value={folderName || ""}
              onChange={(e) => {
                handleSetFolderName(e)
              }}
            /></div>
            <p className='msgErrCSS'>{msgErr}</p>
            <div className='modal-actions'>
              <Button className='default-btn' variant="contained" color="primary" onClick={handleFolderCreate}>
                {/* Create Folder  */}
                {buttonloading ? <CircularProgress size={24} /> : " Create Folder"}
              </Button>
              <Button className='default-btn' variant='contained' color='secondary' onClick={() => { settingObjs() }}>Cancel</Button>
            </div>
          </div>
        </Modal>

        {/* Folder list for move files */}
        <Modal
          open={listShow}
          onClose={closeListShow}
          className='d-flex align-items-center justify-content-center confirm-modal-popup'
        >
          <div className="modal-paper folderMove-popup">
            <div className='modal-header folderMove-BigHead'>
              <h3>Move File</h3>
              <span onClick={closeListShow}><img className='documentCross' src={crossIcon} /></span>
            </div>
            <div className='modal-body folderMove-body'>
              <h5 className='folderMove-caption'>Folder List</h5>
              <div className='folderMove-MainList'>
                <div>
                  <Accordion defaultExpanded sx={{ backgroundColor: "ededed", boxShadow: "none" }}>
                    <div className='moveOnClickOuter'>
                      <div className='moveOnClickInner' onClick={() => handleFolderSelect(null, null)}>
                        {allFolders.filter(x => x.type == "root").map(x => (<p
                          key={x.folderName}
                          className='userName-folderMove'>
                          <img src={Folder} alt="PDF Icon" className='folderList-Icon' />
                          {x.folderName}
                        </p>))}
                      </div>
                      {/* <AccordionSummary
                        defaultExpanded 
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        className='folderMove-pannel'
                      >
                      </AccordionSummary> */}
                    </div>
                    <div className='folderViewStructure'>
                      {allFolders.filter(mainfolder => mainfolder.type == "main_folder").map(mainfolder => (
                        <Accordion defaultExpanded className='rootAccodion' sx={{ cursor: "pointer", width: "97%", background: "f5f5f5", boxShadow: "none", borderRadius: "0px !important", paddingLeft: "20px", borderLeft: "1px solid black" }}>
                          <div className='moveOnClickOuter'>
                            <div className='moveOnClickInner' onClick={() => handleFolderSelect(mainfolder.folder_0, mainfolder.folder_1)}>
                              <img src={Folder} alt="PDF Icon" className='folderList-Icon' />
                              {mainfolder.folderName.replace("/", "")}
                            </div>
                            {/* {allFolders.some(x => x.type === "sub_folder" && mainfolder.folderName === x.folder_0) && (
                              <AccordionSummary
                                defaultExpanded 
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                className='folderMove-pannel'
                              >
                              </AccordionSummary>
                            )} */}
                          </div>
                          <Accordion
                            defaultExpanded
                            sx={{ display: "flex", flexDirection: "column", alignItems: "end", background: "f5f5f5", boxShadow: "none" }}>
                            <Typography sx={{ width: "97%", backgroundColor: "d0d0d0", borderRadius: "none", paddingLeft: "15px", borderLeft: "1px solid black" }}>
                              {allFolders.filter(x => x.type === "sub_folder" && mainfolder.folderName === x.folder_0).map(x => (
                                <div key={x.folderName} onClick={() => handleFolderSelect(x.folder_0, x.folder_1)} className='folderMove-subFolders'>
                                  <img src={Folder} alt="PDF Icon" className='folderList-Icon' />
                                  {x.folderName.replace("/", "")}
                                </div>
                              ))}
                            </Typography>
                          </Accordion>
                        </Accordion>
                      ))}
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </Modal>


        <Box className="upload-doc-btn">
          <Grid lg={3.8} item>
            <div className='d-flex upload-company-profile'>
              <FormControl fullWidth>
                <div className='upload-file-wrap'>
                  <Button variant='outlined' className='upload-action-btn'>
                    UPLOAD FILE
                    <input
                      type="file"
                      ref={fileInputRef}
                      name='companyprofile'
                      onChange={(e) => { uploadoptionalFile(e) }}
                    />
                  </Button>
                  {/* {isFileUpload && isFileUpload?.name ?
                    <Button variant='contained' color='secondary' onClick={() => { removeFile('documents') }} className='upload-action-btn' >REMOVE FILE</Button> :
                    <Button variant='outlined' className='upload-action-btn'>
                      UPLOAD FILE
                      <input
                        type="file"
                        name='companyprofile'
                        onChange={(e) => { uploadoptionalFile(e) }}
                      />
                    </Button>
                  } */}
                  {/* <Button variant='contained' className='upload-submit-btn' disabled={buttonloading ? true : false} onClick={handleSubmit}>
                    {buttonloading ? <CircularProgress size={24} /> : "Upload"}
                  </Button> */}
                </div>
              </FormControl>
            </div>

          </Grid>
        </Box>
      </div>

      <Box className='flex-column documents-storage-wrapper d-flex flex-grow-1'>

        {
          showFolder ? <>

            {/* open-sub-folder */}
            {
              showFolder && showSubFolder ?

                <>
                  {
                    (subfolderData?.files && subfolderData?.files?.length > 0) &&
                    <>
                      <div className='indicatorLine'><p>Files</p></div>
                      <Box className='user-documents' sx={{ marginLeft: '35px', padding: '20px 0px' }}>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {subfolderData?.files?.map(files => (
                            <>
                              <Box className="folder-grid-upper">
                                <Box className='folder-grids' key={files.docLink} onClick={() => handleDocClick(files.docLink)} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                                  <img src={File} alt="PDF Icon" className='styleIcons' />
                                  <div className='fileDetails'>
                                    <p className='line-clamp-1'>{files?.fileName}</p>
                                    <p className='line-clamp-2'><span>By : </span>{files?.uploadedBy}</p>
                                    <p className='line-clamp-3'><span>Date : </span>{convertToBaseFormatDate(files?.uploadedDate, false, true, 'MMMM', false)}</p>
                                  </div>
                                </Box>
                                {/* <div className="CustomizedMenus">
                                  <CustomizedMenus className="CustomizedMenus" options={files?.uploadedBy === userName ? ['Delete', 'Move'] : ['Move']} onSelect={(option) => handleOptionSelect(option, files)} />
                                </div> */}
                                {
                                  files?.uploadedBy == userName ?
                                    <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                      <span onClick={() => handleOptionSelect("Move", files)} className='fileMoveIcon'><img src={MoveIcon} /></span>
                                    </Tooltip>
                                    :
                                    <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                      <span onClick={() => handleOptionSelect("Move", files)} className='fileMoveIconSide'><img src={MoveIcon} /></span>
                                    </Tooltip>
                                }

                                {
                                  files?.uploadedBy == userName ?
                                    <Tooltip title={<p className="m-5">Delete</p>} placement="bottom">
                                      <span onClick={() => toogleOpen(files?.id)} className='fileDelteIcon'><img src={closeIcon} /></span>
                                    </Tooltip>
                                    : ''
                                }

                              </Box>
                            </>
                          ))}
                        </Box>
                      </Box>
                    </>
                  }
                </> :


                <>
                  {
                    mainFolders?.folder && mainFolders?.folder?.length > 0 ?

                      <div className='folderViewBox'>
                        <div className='indicatorLine'><p className='theFolderFileName'>Folders</p></div>
                        <Box className='user-documents' sx={{ marginLeft: '35px', padding: '20px 0px' }}>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                            {mainFolders?.folder?.map(folder => {
                              let subfolderstring = (folder?.folderName).slice(0, -1).split('/');
                              let lastsubfolder = subfolderstring[subfolderstring.length - 1];
                              return (
                                <>
                                  <Box className='folder-grids' key={folder?.type} onClick={() => { handleOpenSubFolder(folder?.type, folder?.folderName) }} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                                    <img src={Folder} alt="PDF Icon" className='styleIcons' />
                                    <p onClick={() => { handleOpenSubFolder(folder?.type, folder?.folderName) }} className='line-clamp-1'>{
                                      lastsubfolder
                                    }</p>
                                  </Box>
                                </>
                              )
                            })}
                          </Box>
                        </Box>
                      </div>
                      : ''
                  }

                </>
            }

            <>
              {
                !showSubFolder && mainFolders?.files && mainFolders?.files?.length > 0 ?
                  <>
                    <div className='indicatorLine'><p className='theFolderFileName'>Files</p></div>
                    <Box className='user-documents' sx={{ marginLeft: '35px', padding: '20px 0px' }}>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {mainFolders?.files?.map(files => (
                          <>
                            <Box className="folder-grid-upper">
                              <Box className='folder-grids' key={files?.docLink} onClick={() => handleDocClick(files?.docLink)} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                                <img src={File} alt="PDF Icon" className='styleIcons' />
                                <div className='fileDetails'>
                                  <p className='line-clamp-1'>{files?.fileName}</p>
                                  <p className='line-clamp-2'><span>By : </span>{files?.uploadedBy}</p>
                                  <p className='line-clamp-3'><span>Date : </span>{convertToBaseFormatDate(files?.uploadedDate, false, true, 'MMMM', false)}</p>
                                </div>
                              </Box>
                              {/* <div className="CustomizedMenus">
                                <CustomizedMenus className="CustomizedMenus" options={files?.uploadedBy === userName ? ['Delete', 'Move'] : ['Move']} onSelect={(option) => handleOptionSelect(option, files)} />
                              </div> */}
                              {
                                files?.uploadedBy == userName ?
                                  <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                    <span onClick={() => handleOptionSelect("Move", files)} className='fileMoveIcon'><img src={MoveIcon} /></span>
                                  </Tooltip>
                                  :
                                  <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                    <span onClick={() => handleOptionSelect("Move", files)} className='fileMoveIconSide'><img src={MoveIcon} /></span>
                                  </Tooltip>
                              }

                              {
                                files?.uploadedBy == userName ?
                                  <Tooltip title={<p className="m-5">Delete</p>} placement="bottom">
                                    <span onClick={() => toogleOpen(files?.id)} className='fileDelteIcon'><img src={closeIcon} /></span>
                                  </Tooltip>
                                  : ''
                              }
                            </Box>
                          </>
                        ))}
                      </Box>
                    </Box>
                  </>
                  : ''
              }
            </>


          </> :

            <>
              {
                userdocuments?.folder && userdocuments?.folder?.length > 0 ?

                  <div className='folderViewBox'>
                    <div className='indicatorLine'><span className='theFolderFileName'>Folders</span></div>
                    <Box className='user-documents' sx={{ marginLeft: '35px', padding: '20px 0px' }}>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {userdocuments?.folder?.map(folder => (
                          <>
                            <Box className='folder-grids' key={folder?.docLink} onClick={() => { handleOpenFolder(folder?.type, folder?.folderName) }} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                              <img src={Folder} alt="PDF Icon" className='styleIcons' />
                              <p onClick={() => { handleOpenFolder(folder?.type, folder?.folderName) }} className='line-clamp-1'>{folder?.folderName?.replace("/", '')}</p>
                            </Box>
                          </>
                        ))}
                      </Box>
                    </Box>
                  </div>
                  : ''
              }
            </>
        }



        {/* root file */}
        <div className='fileViewBox'>
          {
            !showFolder && userdocuments?.files && userdocuments?.files?.length > 0 ?
              <>
                <div className='indicatorLine'><span className='theFolderFileName'>Files</span></div>
                <Box className='user-documents' sx={{ marginLeft: '35px', padding: '20px 0px' }}>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {userdocuments?.files.map(files => (
                      <>
                        <Box className="folder-grid-upper">
                          <Box className='folder-grids' key={files?.docLink} onClick={() => handleDocClick(files?.docLink)} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                            <img src={File} alt="PDF Icon" className='styleIcons' />
                            <div className='fileDetails'>
                              <p className='line-clamp-1'>{files?.fileName}</p>
                              <p className='line-clamp-2'><span>By : </span>{files?.uploadedBy}</p>
                              <p className='line-clamp-3'><span>Date : </span>{convertToBaseFormatDate(files?.uploadedDate, false, true, 'MMMM', false)}</p>
                            </div>
                          </Box>
                          {/* <div className="CustomizedMenus">
                            <CustomizedMenus className="CustomizedMenus" options={files?.uploadedBy === userName ? ['Delete', 'Move'] : ['Move']} onSelect={(option) => handleOptionSelect(option, files)} />
                          </div> */}
                          {
                            files?.uploadedBy == userName ?
                              <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                <span onClick={() => handleOptionSelect("Move", files)} className='fileMoveIcon'><img src={MoveIcon} />
                                </span>
                              </Tooltip>
                              :
                              <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                <span onClick={() => handleOptionSelect("Move", files)} className='fileMoveIconSide'><img src={MoveIcon} /></span>
                              </Tooltip>

                          }
                          {
                            files?.uploadedBy == userName ?
                              <Tooltip title={<p className="m-5">Delete</p>} placement="bottom">
                                <span onClick={() => toogleOpen(files?.id)} className='fileDelteIcon'><img src={closeIcon} /></span>
                              </Tooltip>
                              : ''
                          }
                        </Box>
                      </>
                    ))}
                  </Box>
                </Box>
              </> : ''
          }

        </div>
      </Box>
      <Footer />
    </div >
  );
};

export default Documents;


