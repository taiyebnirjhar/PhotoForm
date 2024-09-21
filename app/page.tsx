"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Background, Effect } from "@/types"
import axios from "axios"
import { saveAs } from "file-saver"
import { motion } from "framer-motion"
import html2canvas from "html2canvas"
import { Download, MousePointerClick, PlusIcon, X } from "lucide-react"
import Slider from "rc-slider"
import { useDropzone } from "react-dropzone"

import { Button } from "@/components/ui/button"

import "rc-slider/assets/index.css"
import { SketchPicker } from "react-color"

// List of free-to-use background image URLs
const backgroundUrls = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1501696461415-6bd6660c6742?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682260-96773eb01377?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1600&h=900&fit=crop",
]

const backgrounds = backgroundUrls.map((url, i) => ({
  id: i,
  name: `Background ${i + 1}`,
  url,
}))

const effects = [...Array(100)].map((_, i) => ({
  id: i,
  name: `Effect ${i + 1}`,
  filter: `blur(${i % 10}px)`,
}))

const availableSizes = [
  "mobile",
  "tablet",
  "desktop",
  "profile",
  "postcard",
  "passport",
]

const ScreenshotEditor = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null)
  const [backgroundColor, setBackgroundColor] = useState<string>("")
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null)
  const [screenSize, setScreenSize] = useState<string>("desktop")
  const [zoom, setZoom] = useState<number>(0.9)
  const [transparency, setTransparency] = useState<number>(1)
  const [borderRadius, setBorderRadius] = useState<number>(0)
  const [shadow, setShadow] = useState<number>(0)
  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultImageUrl, setResultImageUrl] = useState<any>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        setScreenshot(event.target.result.toString())
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleBackgroundSelect = (background: {
    id: number
    name: string
    url: string | null
  }) => {
    setSelectedBackground(background)
    setBackgroundColor("") // Reset color picker when a background is selected
  }

  const handleColorChange = (color: { hex: string }) => {
    setBackgroundColor(color.hex)
    setSelectedBackground(null) // Reset background selection when color is picked
  }

  const handleEffectSelect = (effect: {
    id: number
    name: string
    filter: string
  }) => {
    setSelectedEffect(effect)
  }

  const handleScreenSizeChange = (size: string) => {
    setScreenSize(size)
  }

  const handleRemoveBackground = async () => {
    if (!screenshot) return

    setLoading(true) // Set loading state

    // Strip the prefix from the base64 image data
    const base64Image = screenshot.split(",")[1] // Get the actual base64 data

    const data = new FormData()
    data.append("image_base64", base64Image) // Send the base64 encoded image
    data.append("output_format", "base64") // Request base64 response format

    const options = {
      method: "POST",
      url: "https://background-removal.p.rapidapi.com/remove",
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_API_RAPID_API_KEY,
        "x-rapidapi-host": "background-removal.p.rapidapi.com",
      },
      data: data,
    }

    try {
      const response = await axios.request(options)

      if (response.data.error === false) {
        let base64Result = response.data.response.image_base64 // The base64 string

        // Check if the base64 string has the 'data:image/png;base64,' prefix and remove it
        if (base64Result.startsWith("data:image")) {
          base64Result = base64Result.split(",")[1]
        }

        // Ensure proper base64 string with padding
        const padding = "=".repeat((4 - (base64Result.length % 4)) % 4) // Add padding if needed
        const base64ImageClean = base64Result + padding

        // Convert base64 to Blob
        const byteString = atob(base64ImageClean)
        const arrayBuffer = new ArrayBuffer(byteString.length)
        const uint8Array = new Uint8Array(arrayBuffer)
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([uint8Array], { type: "image/png" })

        // Create URL for Blob
        const imageUrl = URL.createObjectURL(blob)
        setResultImageUrl(imageUrl) // Set the result as a Blob URL
      } else {
        console.error("Error removing background:", response.data)
        alert("Failed to remove background. Please try again.")
      }
    } catch (error) {
      console.error("Failed to remove background:", error)
      alert(
        "An error occurred. Please check your network connection and try again."
      )
    } finally {
      setLoading(false) // Reset loading state
    }
  }

  const handleDownload = () => {
    setIsDownloading(true)
    html2canvas(previewRef.current as HTMLElement, { useCORS: true }).then(
      (canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, "screenshot.png")
            setIsDownloading(false)
          }
        })
      }
    )
  }

  useEffect(() => {
    if (!previewRef.current) return

    const styles = previewRef.current.style
    styles.backgroundImage = selectedBackground?.url
      ? `url(${selectedBackground.url})`
      : ""
    styles.backgroundColor = backgroundColor || ""
    styles.backgroundSize = "cover"
    styles.backgroundRepeat = "no-repeat"
    styles.filter = selectedEffect?.filter || "none"
  }, [selectedBackground, selectedEffect, backgroundColor])

  const getPreviewDimensions = (type = screenSize) => {
    switch (type) {
      case "mobile":
        return { width: 375, height: 667, border: "8px" }
      case "tablet":
        return { width: 768, height: 1024, border: "12px" }
      case "desktop":
        return { width: 1024, height: 768, border: "16px" }
      case "passport":
        return { width: 35, height: 45, border: "1px" } // Passport size photo (in mm)
      case "postcard":
        return { width: 148, height: 105, border: "2px" } // Postcard size (in mm)
      case "profile":
        return { width: 180, height: 180, border: "2px" } // Example profile photo size (in pixels)
      default:
        return { width: 1024, height: 768, border: "16px" } // Default to desktop
    }
  }

  useEffect(() => {
    const updatePreviewScale = () => {
      if (containerRef.current && previewRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight
        const { width, height } = getPreviewDimensions()
        const scaleX = containerWidth / width
        const scaleY = containerHeight / height
        const scale = Math.min(scaleX, scaleY, 1)
        setPreviewScale(scale)
      }
    }

    updatePreviewScale()
    window.addEventListener("resize", updatePreviewScale)
    return () => window.removeEventListener("resize", updatePreviewScale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenSize])

  const previewDimensions = getPreviewDimensions()

  return (
    <motion.div
      className="flex h-screen bg-gray-100 text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Sidebar */}
      <motion.div
        className="w-64 overflow-y-auto bg-white p-4 shadow-md"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4 text-xl font-bold">Backgrounds</h2>
        <div className="grid grid-cols-4 gap-4">
          {backgrounds.map((bg) => (
            <div
              key={bg.id}
              className="cursor-pointer"
              onClick={() => handleBackgroundSelect(bg)}
            >
              <div
                className={`border-2 ${
                  selectedBackground === bg
                    ? "border-black"
                    : "border-transparent"
                } hover:border-gray-700`}
              >
                <Image
                  src={bg.url}
                  alt={bg.name}
                  className="h-10 w-full object-cover"
                  height={40}
                  width={40}
                />
              </div>
            </div>
          ))}
          <div
            className="flex h-10 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-400"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            {showColorPicker ? (
              <X className="text-gray-400" />
            ) : (
              <PlusIcon className="text-gray-400" />
            )}
          </div>
        </div>
        {showColorPicker && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <SketchPicker
              color={backgroundColor}
              onChangeComplete={handleColorChange}
            />
          </div>
        )}
        <h2 className="mb-4 mt-6 text-xl font-bold">Screen Size</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {availableSizes.map((size) => (
            <Button
              key={size}
              onClick={() => handleScreenSizeChange(size)}
              // @ts-ignore
              variant={screenSize === size ? "solid" : "outline"}
              className={`px-2 py-1 text-xs capitalize ${
                screenSize === size
                  ? "bg-black text-white"
                  : "border border-gray-300 text-black"
              } hover:bg-gray-700 hover:text-white`}
            >
              {size}
            </Button>
          ))}
        </div>
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-bold">Image Adjustments</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block">Zoom</label>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={zoom}
                onChange={(value) => setZoom(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Transparency</label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={transparency}
                onChange={(value) => setTransparency(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Border Radius</label>
              <Slider
                min={0}
                max={50}
                step={1}
                value={borderRadius}
                onChange={(value) => setBorderRadius(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Shadow</label>
              <Slider
                min={0}
                max={20}
                step={1}
                value={shadow}
                onChange={(value) => setShadow(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <Button
                onClick={handleRemoveBackground} // Update handler
                disabled={!screenshot}
                className="bg-black text-white hover:bg-gray-700"
              >
                <MousePointerClick className="mr-2 size-4 text-white" />
                Remove Background
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 overflow-y-auto p-8"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div
          {...getRootProps()}
          className="flex h-[650px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
        >
          <input {...getInputProps()} />
          <div
            ref={previewRef}
            className="flex items-center justify-center"
            style={{
              width: `${previewDimensions.width}px`,
              height: `${previewDimensions.height}px`,
              transform: `scale(${previewScale})`,
              transformOrigin: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              overflow: "hidden",
            }}
          >
            {loading && screenshot ? (
              <Image
                src={screenshot}
                alt="Uploaded screenshot"
                className="max-h-full max-w-full animate-pulse" // Add animation class
                width={500}
                height={500}
                style={{
                  transform: `scale(${zoom})`,
                  opacity: transparency,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 0 ${shadow}px rgba(0, 0, 0, 0.5)`,
                }}
              />
            ) : resultImageUrl ? (
              <Image
                src={resultImageUrl} // Use the processed image URL
                alt="Processed screenshot"
                className="max-h-full max-w-full"
                width={500}
                height={500}
                style={{
                  transform: `scale(${zoom})`,
                  opacity: transparency,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 0 ${shadow}px rgba(0, 0, 0, 0.5)`,
                }}
              />
            ) : screenshot ? (
              <Image
                src={screenshot} // Use the original screenshot
                alt="Uploaded screenshot"
                className="max-h-full max-w-full"
                width={500}
                height={500}
                style={{
                  transform: `scale(${zoom})`,
                  opacity: transparency,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 0 ${shadow}px rgba(0, 0, 0, 0.5)`,
                }}
              />
            ) : isDragActive ? (
              <p>Drop the screenshot here ...</p>
            ) : (
              <p className="text-gray-600">
                Drag &apos;n&apos; drop a screenshot here, or click to select
                one
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 space-x-2">
          <Button
            onClick={handleDownload}
            disabled={!screenshot}
            className="bg-black text-white hover:bg-gray-700"
          >
            <Download className="mr-2 size-4 text-white" /> Download
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ScreenshotEditor
