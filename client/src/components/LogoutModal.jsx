import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="modal-content glass-card"
                    >
                        <div className="modal-header">
                            <div className="modal-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3>Are you sure?</h3>
                        </div>
                        <p className="modal-text">You really want to logout?</p>
                        <div className="modal-actions">
                            <button onClick={onCancel} className="btn-cancel">
                                No, stay
                            </button>
                            <button onClick={onConfirm} className="btn-confirm">
                                Yes, Logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LogoutModal;
