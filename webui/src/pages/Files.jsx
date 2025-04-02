import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { GlobalContext } from "../App";
const Files = () => {
  const { endpointUrl } = React.useContext(GlobalContext);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = [...e.dataTransfer.files];
    await uploadFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = [...e.target.files];
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${endpointUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        console.log(`Successfully uploaded ${file.name}`);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
  };

  return (
    <div className="flex flex-grow flex-col p-6">
      <h1 className="text-2xl font-semibold text-blue-900 mb-6">File Upload</h1>
      <div
        className={`
          flex flex-col items-center justify-center
          p-8 border-2 border-dashed rounded-lg cursor-pointer
          transition-colors duration-300
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-blue-200 hover:border-blue-300 bg-white"
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
        <Upload className="w-12 h-12 text-blue-500 mb-4" />
        <h2 className="text-lg font-medium text-blue-900 mb-2">
          Drag and drop files here
        </h2>
        <p className="text-sm text-blue-600">or click to select files</p>
      </div>
    </div>
  );
};

export default Files;
