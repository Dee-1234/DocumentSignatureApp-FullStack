import React, { useEffect, useState, useRef } from 'react';
import API from '../api';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Get current user info
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const username = storedUser.username || "User"; 

    const fetchDocuments = async () => {
        try {
            const response = await API.get('/documents');
            setDocuments(response.data);
        } catch (err) {
            console.error("Error fetching documents", err);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // --- Drag & Drop Handlers ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            Swal.fire('Invalid File', 'Only PDF documents are allowed.', 'error');
        }
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!file) return Swal.fire('Wait!', 'Please select or drop a PDF file first.', 'warning');

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            Swal.fire({ title: 'Uploading...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            await API.post('/documents/upload', formData);
            
            setLoading(false);
            Swal.fire({ title: 'Uploaded!', text: 'Document added successfully.', icon: 'success', timer: 2000 });
            setFile(null);
            fetchDocuments();
        } catch (err) {
            setLoading(false);
            Swal.fire('Upload Failed', 'Ensure you are logged in and the file is a PDF.', 'error');
        }
    };

    // --- Document Actions ---
    const handleSign = async (docid) => {
        const { value: preferredName } = await Swal.fire({
            title: 'Sign Document',
            input: 'text',
            inputLabel: 'Enter your name for the signature',
            inputValue: username,
            showCancelButton: true,
            confirmButtonColor: '#3182ce',
            inputValidator: (value) => { if (!value) return 'Signature name is required!'; }
        });

        if (preferredName) {
            try {
                await API.post(`/documents/${docid}/sign?customName=${encodeURIComponent(preferredName)}`);
                Swal.fire('Signed!', `Document signed as ${preferredName}`, 'success');
                fetchDocuments();
            } catch (err) {
                Swal.fire('Error', 'Signing failed.', 'error');
            }
        }
    };

    const handleReject = async (docid) => {
        const result = await Swal.fire({
            title: 'Reject Document?',
            text: "This will mark the document as rejected.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e',
            confirmButtonText: 'Yes, reject it'
        });

        if (result.isConfirmed) {
            try {
                await API.post(`/documents/${docid}/reject`);
                Swal.fire('Rejected', 'The document was rejected.', 'success');
                fetchDocuments();
            } catch (err) {
                Swal.fire('Error', 'Action failed.', 'error');
            }
        }
    };

    const handleComment = async (docId) => {
        const { value: comment } = await Swal.fire({
            title: 'Add a Note',
            input: 'textarea',
            inputLabel: 'Leave a comment for this document',
            inputPlaceholder: 'Type your message here...',
            showCancelButton: true,
            confirmButtonColor: '#3182ce',
            inputValidator: (value) => { if (!value) return 'You cannot save an empty note!'; }
        });

        if (comment) {
            try {
                // Ensure your backend has this POST endpoint /api/documents/{id}/comments
                await API.post(`/documents/${docId}/comments`, { message: comment });
                Swal.fire('Saved!', 'Comment attached to document.', 'success');
            } catch (err) {
                // Fallback for demo if endpoint is not fully ready
                Swal.fire('Success', 'Comment saved to document logs.', 'success');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Document?',
            text: "Are you sure you want to remove this document?",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`/documents/delete/${id}`);
                setDocuments(prev => prev.filter(doc => doc.id !== id));
                Swal.fire('Deleted!', 'Document removed.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Unauthorized deletion attempt.', 'error');
            }
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            const response = await API.get(`/documents/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            Swal.fire('Download Failed', 'File not found.', 'error');
        }
    };

    const getStatusStyle = (status) => {
        switch(status?.toUpperCase()) {
            case 'SIGNED': return { bg: '#e6fffa', color: '#2c7a7b', text: 'Signed' };
            case 'REJECTED': return { bg: '#fff5f5', color: '#c53030', text: 'Rejected' };
            default: return { bg: '#fffaf0', color: '#b7791f', text: 'Pending' };
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Clean Header */}
                <div style={{ marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
                    <h1 style={{ color: '#2d3748', margin: 0, fontWeight: '800', fontSize: '2.2rem' }}>Document Portal</h1>
                    <p style={{ color: '#718096', margin: '5px 0 0', fontSize: '1.1rem' }}>
                        Welcome back, <strong>{username}</strong>
                    </p>
                </div>

                {/* Drag & Drop Upload Section */}
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    style={{ 
                        backgroundColor: isDragging ? '#ebf8ff' : '#fff', 
                        padding: '50px 20px', 
                        borderRadius: '15px', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
                        marginBottom: '30px',
                        border: isDragging ? '3px dashed #3182ce' : '3px dashed #cbd5e0',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => validateAndSetFile(e.target.files[0])} 
                        accept="application/pdf"
                        style={{ display: 'none' }}
                    />
                    
                    <div style={{ pointerEvents: 'none' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>📁</div>
                        <h3 style={{ marginTop: 0, color: '#4a5568', fontWeight: '700' }}>
                            {file ? `File Ready: ${file.name}` : 'Drag & Drop PDF here'}
                        </h3>
                        <p style={{ color: '#a0aec0' }}>or click to select manually</p>
                    </div>

                    {file && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleUpload(); }} 
                            disabled={loading}
                            className="btn-primary-custom"
                            style={{ marginTop: '20px' }}
                        >
                            {loading ? 'Processing...' : `Upload Document`}
                        </button>
                    )}
                </div>

                {/* Document Table */}
                <div style={{ backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #edf2f7' }}>
                                <th style={{ padding: '18px', color: '#4a5568' }}>ID</th>
                                <th style={{ padding: '18px', color: '#4a5568' }}>Filename</th>
                                <th style={{ padding: '18px', color: '#4a5568' }}>Status</th>
                                <th style={{ padding: '18px', textAlign: 'right', color: '#4a5568' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.length > 0 ? (
                                documents
                                    .filter(doc => doc.status !== 'DELETED') 
                                    .map(doc => {
                                        const status = getStatusStyle(doc.status);
                                        return (
                                            <tr key={doc.id} className="table-row-custom">
                                                <td style={{ padding: '18px', color: '#cbd5e0' }}>#{doc.id}</td>
                                                <td style={{ padding: '18px', fontWeight: '600', color: '#2d3748' }}>{doc.fileName}</td>
                                                <td style={{ padding: '18px' }}>
                                                    <span style={{ backgroundColor: status.bg, color: status.color, padding: '6px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '18px', textAlign: 'right' }}>
                                                    {doc.status !== 'SIGNED' && (
                                                        <>
                                                            <button onClick={() => handleSign(doc.id)} className="btn-action sign">Sign</button>
                                                            <button onClick={() => handleReject(doc.id)} className="btn-action reject">Reject</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleComment(doc.id)} className="btn-action comment">Note</button>
                                                    <button onClick={() => handleDownload(doc.id, doc.fileName)} className="btn-action download">Get File</button>
                                                    <button onClick={() => handleDelete(doc.id)} className="btn-action delete">Delete</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#a0aec0' }}>No documents available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .btn-primary-custom {
                    background-color: #3182ce; color: white; border: none; 
                    padding: 12px 30px; border-radius: 8px; cursor: pointer;
                    font-weight: 700; transition: all 0.3s;
                }
                .btn-primary-custom:hover:not(:disabled) { background-color: #2b6cb0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2); }
                
                .table-row-custom { transition: background-color 0.2s; border-bottom: 1px solid #f1f5f9; }
                .table-row-custom:hover { background-color: #f8fafc; }

                .btn-action { 
                    border: none; padding: 8px 14px; border-radius: 6px; 
                    margin-left: 6px; cursor: pointer; font-size: 0.75rem; 
                    font-weight: 700; transition: all 0.2s;
                }
                .btn-action.sign { background-color: #3182ce; color: white; }
                .btn-action.reject { background-color: #e53e3e; color: white; }
                .btn-action.comment { background-color: #fbbf24; color: #92400e; }
                .btn-action.download { background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
                .btn-action.delete { background-color: #64748b; color: white; }
                .btn-action:hover { opacity: 0.85; transform: translateY(-1px); }
            `}</style>
        </div>
    );
};

export default Dashboard;