import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  Download,
  FileIcon,
  Loader,
  FileText,
  FileCode,
  FileCog,
  FileImage,
} from "lucide-react";
import { GlobalContext } from "../App";

const Files = () => {
  const { endpointUrl } = React.useContext(GlobalContext);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${endpointUrl}/api/files`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [endpointUrl]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
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
    if (!isUploading) {
      const files = [...e.dataTransfer.files];
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    if (!isUploading) {
      const files = [...e.target.files];
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);
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

    // Wait a bit before refreshing the list
    setTimeout(() => {
      fetchFiles();
      setIsUploading(false);
    }, 1000);
  };

  const handleDelete = async (filename) => {
    try {
      const response = await fetch(`${endpointUrl}/api/files/${filename}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete file");

      await fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDownload = (filename) => {
    window.open(`${endpointUrl}/api/files/${filename}`, "_blank");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();

    // Image files
    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(extension)
    ) {
      return <FileImage className="w-8 h-8 text-green-500" />;
    }

    // Script/code files
    if (
      ["js", "jsx", "ts", "tsx", "json", "html", "css", "py", "php"].includes(
        extension
      )
    ) {
      return <FileCode className="w-8 h-8 text-yellow-500" />;
    }

    // Executable files
    if (["exe", "msi", "bat", "cmd", "sh"].includes(extension)) {
      return <FileCog className="w-8 h-8 text-red-500" />;
    }

    // Text files
    if (["txt", "md", "csv", "log", "xml"].includes(extension)) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }

    // Default file icon
    return <FileIcon className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="flex flex-grow flex-col p-6">
      <h1 className="text-2xl font-semibold text-blue-900 mb-6">Files</h1>

      {/* Upload Area */}
      <div
        className={`
          relative flex flex-col items-center justify-center
          p-8 border-2 border-dashed rounded-lg cursor-pointer
          transition-colors duration-300 mb-8
          ${isUploading ? "pointer-events-none opacity-50" : ""}
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
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
        {isUploading ? (
          <Loader className="w-12 h-12 text-blue-500 mb-4 animate-spin" />
        ) : (
          <Upload className="w-12 h-12 text-blue-500 mb-4" />
        )}
        <h2 className="text-lg font-medium text-blue-900 mb-2">
          {isUploading ? "Uploading..." : "Drag and drop files here"}
        </h2>
        <p className="text-sm text-blue-600">
          {isUploading ? "Please wait" : "or click to select files"}
        </p>
      </div>

      {/* File List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file.name)}
              <div>
                <p
                  className="font-medium text-blue-900 truncate max-w-[200px]"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-sm text-blue-600">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload(file.name)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(file.name)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Files;
