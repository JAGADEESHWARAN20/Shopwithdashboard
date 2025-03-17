import React from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    return (
        <div className={`fixed inset-0 z-50 transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative w-64 h-full bg-white shadow-lg">
                <button onClick={onClose} className="absolute top-4 right-4">Close</button>
                {/* Add your sidebar content here */}
            </div>
        </div>
    );
};

export default Sidebar;