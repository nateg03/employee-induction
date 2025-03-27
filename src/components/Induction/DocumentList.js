import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DocumentList({ toggleReadStatus, readDocuments }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5001/documents").then((res) => {
      setDocuments(res.data);
    });
  }, []);

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="border p-4 rounded shadow bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{doc.title}</h3>
            <button
              onClick={() => toggleReadStatus(doc.title)}
              className={`px-3 py-1 rounded text-sm ${readDocuments[doc.title] ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}
            >
              {readDocuments[doc.title] ? "Mark as Unread" : "Mark as Read"}
            </button>
          </div>
          <iframe
            src={`http://localhost:5001/uploads/${doc.filename}`}
            title={doc.title}
            className="w-full h-64 mt-3 border"
          ></iframe>
        </div>
      ))}
    </div>
  );
}
