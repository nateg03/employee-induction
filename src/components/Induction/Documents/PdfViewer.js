import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { fullScreenPlugin } from "@react-pdf-viewer/full-screen";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import "@react-pdf-viewer/full-screen/lib/styles/index.css";

export default function PdfViewer({ file }) {
  const pdfUrl = `/uploads/${file}`;

  // Initialize Plugins
  const toolbarPluginInstance = toolbarPlugin();
  const fullScreenPluginInstance = fullScreenPlugin();

  const { Toolbar } = toolbarPluginInstance;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md w-full h-[80vh] flex flex-col">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
        📑 {file.replace(".pdf", "").replace(/_/g, " ")}
      </h2>

      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <div className="flex flex-col h-full border rounded-lg shadow-lg overflow-hidden">
          {/* Built-in Toolbar (Includes Zoom & Full Screen) */}
          <Toolbar />

          {/* PDF Viewer */}
          <div className="flex-grow overflow-auto h-full">
            <Viewer fileUrl={pdfUrl} plugins={[toolbarPluginInstance, fullScreenPluginInstance]} />
          </div>
        </div>
      </Worker>
    </div>
  );
}
