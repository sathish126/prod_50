"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileImage, CheckCircle } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number
}

export default function FileUpload({
  onFileSelect,
  accept = ".jpg,.jpeg,.png",
  maxSize = 5 * 1024 * 1024,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    }

    const allowedTypes = accept.split(",").map((type) => type.trim())
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      return `File type must be one of: ${allowedTypes.join(", ")}`
    }

    return null
  }

  const handleFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    setUploading(true)

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSelectedFile(file)
    setUploading(false)
    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError("")
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
          dragActive
            ? "border-purple-400 bg-purple-500/10"
            : selectedFile
              ? "border-green-400 bg-green-500/10"
              : "border-purple-500/30 bg-slate-800/30 hover:border-purple-400 hover:bg-purple-500/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

        {uploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-gray-300">Uploading...</p>
          </div>
        ) : selectedFile ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-300 font-medium mb-2">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm mb-4">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeFile}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10 bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300 font-medium mb-2">Upload your student ID card</p>
            <p className="text-gray-400 text-sm mb-4">Drag & drop your file here, or click to browse</p>
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
            >
              <FileImage className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <p className="text-gray-500 text-xs mt-2">
              Accepted formats: JPG, JPEG, PNG • Max size: {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>
      )}
    </div>
  )
}
