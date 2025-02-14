import React from 'react';
import Modal from './Modal';
import '../styles/Chat.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="delete-confirm-modal">
        <h3>永久删除对话</h3>
        <p>删除后，该对话将不可恢复。确认删除吗？</p>
        <div className="delete-confirm-actions">
          <button className="cancel-button" onClick={onClose}>取消</button>
          <button className="delete-button" onClick={onConfirm}>删除</button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal; 