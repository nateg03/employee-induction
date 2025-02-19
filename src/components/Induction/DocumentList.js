import React, { useState } from "react";
import PdfViewer from "./Documents/PdfViewer";

const documents = [
    { id: 1, title: "COMS Induction - Employees (QOP011-3)", file: "COMS_QOP011_3.pdf" },
    { id: 2, title: "Windows 10 Settings for COMS IT Equipment (S008-7)", file: "COMS_S008_7.pdf" },
    { id: 3, title: "Modern Slavery Act 2015, COMS Statement (S009-7)", file: "COMS_S009_7.pdf" },
    { id: 4, title: "Incident Investigation & Learning Procedure (S014-4)", file: "COMS_S014_4.pdf" },
    { id: 5, title: "PPE Management Process (S015-3)", file: "COMS_S015_3.pdf" },
];

export default function DocumentList({ toggleReadStatus, readDocuments }) {
    const [selectedDoc, setSelectedDoc] = useState(null);

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[85vh]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full lg:w-1/4 h-fit">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-4">📂 Induction Documents</h2>
                {documents.map(doc => (
                    <div key={doc.id} className="mb-3">
                        <button onClick={() => setSelectedDoc(doc)} className="block w-full text-left p-3 rounded-md hover:bg-gray-200">
                            {doc.title}
                        </button>
                        <button onClick={() => toggleReadStatus(doc.id)} className="mt-2 px-3 py-1 text-white rounded-md bg-blue-500">
                            {readDocuments[doc.id] ? "Mark as Unread" : "Mark as Read"}
                        </button>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full lg:w-3/4 min-h-[85vh]">
                {selectedDoc ? <PdfViewer file={selectedDoc.file} /> : <p className="text-gray-500 text-center">Select a document to view.</p>}
            </div>
        </div>
    );
}
