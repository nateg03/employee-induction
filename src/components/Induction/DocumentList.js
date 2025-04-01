import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DocumentList({ toggleReadStatus, readDocuments, onSelect }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/documents")
      .then((res) => setDocuments(res.data))
      .catch((err) => console.error("❌ Failed to load documents:", err));
  }, []);

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="cursor-pointer bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition flex justify-between items-center"
          onClick={() => onSelect(doc)}
        >
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">{doc.title}</h3>
            <p className="text-sm text-gray-500">
              {readDocuments[doc.filename] ? "✅ Read" : "📄 Unread"}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent opening viewer on toggle
              toggleReadStatus(doc.filename);
            }}
            className={`px-3 py-1 rounded text-white ${
              readDocuments[doc.filename] ? "bg-green-500" : "bg-blue-500"
            } hover:opacity-90`}
          >
            {readDocuments[doc.filename] ? "Mark Unread" : "Mark Read"}
          </button>
        </div>
      ))}
    </div>
  );
}
