import { Modal } from 'react-bootstrap';
import { useEffect } from 'react';

interface CustomModalProps {
  errors: { msg: string }[];
  title: string;
  show: boolean;
  onClose: () => void;
}

function usePreventScrollShift(isModalOpen: boolean) {
  useEffect(() => {
    if (isModalOpen) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Reserve space for the scrollbar
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      // Prevent body from scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Reset styles when the modal closes
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    }
  }, [isModalOpen]);
}

const CustomModal = ({ errors, title, show, onClose }: CustomModalProps) => {
  usePreventScrollShift(show);
  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      dialogClassName="modal-dialog-responsive"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="list-styled">
          {errors.map((error, index) => (
            <li key={index} className="mb-2">
              {error.msg}
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-primary" onClick={onClose}>
          閉じる
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomModal;
