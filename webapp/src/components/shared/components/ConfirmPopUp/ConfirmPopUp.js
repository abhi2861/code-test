import { Button, Modal } from '@mui/material'
import React from 'react'

const ConfirmPopUp = (props) => {
    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            className='d-flex align-items-center justify-content-center confirm-modal-popup'
        // aria-labelledby="create-survey-modal-title"
        // aria-describedby="create-survey-modal-description"
        >
            <div className="modal-paper">
                <div className='modal-header'>
                    <h4>Confirmation</h4>
                </div>
                <div className='modal-body'><p>Are you sure want to {`${props.message}`} ?</p></div>
                <div className='modal-actions'>
                    <Button className='default-btn' onClick={props.agreeOnClick} variant="contained" color="primary">{props.primaryAction}</Button>
                    <Button className='default-btn' onClick={props.denyOnClick} variant='contained' color='secondary'>{props.secondaryAction}</Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmPopUp