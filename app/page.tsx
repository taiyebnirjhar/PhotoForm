"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import availableSizes from "@/data/availableSizes/availableSizes"
import backgrounds from "@/data/backgrounds/backgrounds"
import mappedElements from "@/data/elements/elements"
import { Background, Effect } from "@/types"
import axios from "axios"
import { saveAs } from "file-saver"
import { motion } from "framer-motion"
import html2canvas from "html2canvas"
import { Download, MousePointerClick, PlusIcon, X } from "lucide-react"
import Slider from "rc-slider"
import { useDropzone } from "react-dropzone"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import "rc-slider/assets/index.css"
import { SketchPicker } from "react-color"

const ScreenshotEditor = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null)

  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null)
  const [backgroundColor, setBackgroundColor] = useState<string>("")
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [screenSize, setScreenSize] = useState<string>("desktop")

  const [imageZoom, setImageZoom] = useState<number>(0.9)
  const [imageTransparency, setImageTransparency] = useState<number>(1)
  const [imageBorderRadius, setImageBorderRadius] = useState<number>(0)
  const [imageShadow, setImageShadow] = useState<number>(0)
  const [imageInnerShadow, setImageInnerShadow] = useState<number>(0)
  const [imageSize, setImageSize] = useState<number>(0.5)
  const [imageXPosition, setImageXPosition] = useState(0)
  const [imageYPosition, setImageYPosition] = useState(0)

  const [elementZoom, setElementZoom] = useState<number>(0.9)
  const [elementTransparency, setElementTransparency] = useState<number>(1)
  const [elementBorderRadius, setElementBorderRadius] = useState<number>(0)
  const [elementShadow, setElementShadow] = useState<number>(0)
  const [elementInnerShadow, setElementInnerShadow] = useState<number>(0)
  const [elementSize, setElementSize] = useState<number>(0.5)
  const [elementXPosition, setElementXPosition] = useState(0)
  const [elementYPosition, setElementYPosition] = useState(0)

  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultImageUrl, setResultImageUrl] = useState<any>(null)
  const [elementPosition, setElementPosition] = useState({
    top: 0,
    left: 0,
  }) // For positioning the overlay
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

  const sizeLimits = {
    mobile: 1, // Slider max value for mobile
    tablet: 1.5, // Slider max value for tablet
    desktop: 2, // Slider max value for desktop
    passport: 0.5, // Slider max value for passport size
    postcard: 0.75, // Slider max value for postcard size
    profile: 1, // Slider max value for profile size
    // Add more sizes as needed
  }
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
  const handleImageSizeChange = (value) => {
    const maxLimit = sizeLimits[screenSize] || 2 // Default to 2 if screenSize is not defined
    // Set imageSize only if the new value is less than or equal to maxLimit
    if (value <= maxLimit) {
      setImageSize(value as number)
    } else {
      setImageSize(maxLimit) // Cap the value at maxLimit
    }
  }

  const handleElementSizeChange = (value) => {
    const maxLimit = sizeLimits[screenSize] || 2 // Default to 2 if screenSize is not defined
    // Set imageSize only if the new value is less than or equal to maxLimit
    if (value <= maxLimit) {
      setElementSize(value as number)
    } else {
      setElementSize(maxLimit) // Cap the value at maxLimit
    }
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
            saveAs(blob, "generated-by-photo-form.png")
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
        className="custom-scrollbar w-80 space-y-6 overflow-y-auto bg-white p-4 shadow-md"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {" "}
        {/* image adjustments */}
        <div className="space-y-2">
          <h2 className="mb-4 text-xl font-bold">Image Adjustments</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block">Move Left/Right</label>
              <Slider
                min={-100} // Adjust as needed
                max={1000} // Adjust as needed
                value={imageXPosition}
                onChange={(value) => setImageXPosition(value as number)}
                step={0.1}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Move Up/Down</label>
              <Slider
                min={-100} // Adjust as needed
                max={1000} // Adjust as needed
                value={imageYPosition}
                onChange={(value) => setImageYPosition(value as number)}
                step={0.1}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Size</label>
              <Slider
                min={0.5}
                max={sizeLimits[screenSize] || 2}
                step={0.1}
                value={imageSize}
                onChange={handleImageSizeChange}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Zoom</label>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={imageZoom}
                onChange={(value) => setImageZoom(value as number)}
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
                value={imageTransparency}
                onChange={(value) => setImageTransparency(value as number)}
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
                value={imageBorderRadius}
                onChange={(value) => setImageBorderRadius(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>

            {/* <div>
            <label className="mb-2 block">Inner Shadow</label>
            <Slider
              min={0}
              max={20}
              step={1}
              value={imageInnerShadow}
              onChange={(value) => setImageInnerShadow(value as number)}
              railStyle={{ backgroundColor: "gray" }}
              trackStyle={[{ backgroundColor: "black" }]}
              handleStyle={[
                { borderColor: "black", backgroundColor: "black" },
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block">Box Shadow</label>
            <Slider
              min={0}
              max={20}
              step={1}
              value={imageShadow}
              onChange={(value) => setImageShadow(value as number)}
              railStyle={{ backgroundColor: "gray" }}
              trackStyle={[{ backgroundColor: "black" }]}
              handleStyle={[
                { borderColor: "black", backgroundColor: "black" },
              ]}
            />
          </div> */}

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
        {/* elements */}
        <div className="space-y-2">
          <h2 className=" text-xl font-bold">Elements</h2>
          <div className="grid grid-cols-4 gap-4">
            {mappedElements.map((item, index) => (
              <div
                key={index}
                className={cn(`cursor-pointer`)}
                onClick={() => {
                  setSelectedElement(item.element)
                }}
              >
                <div
                  className={cn(`border-2 `, {
                    "border-black": selectedElement === item.element,
                    "border-transparent hover:border-gray-700":
                      selectedElement !== item.element,
                  })}
                >
                  <Image
                    src={item.element}
                    alt={item.name}
                    className="h-10 w-full object-cover"
                    height={40}
                    width={40}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block">Move Left/Right</label>
              <Slider
                min={-100} // Adjust as needed
                max={1000} // Adjust as needed
                value={elementXPosition}
                onChange={(value) => setElementXPosition(value as number)}
                step={0.1}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Move Up/Down</label>
              <Slider
                min={-100} // Adjust as needed
                max={1000} // Adjust as needed
                value={elementYPosition}
                onChange={(value) => setElementYPosition(value as number)}
                step={0.1}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Size</label>
              <Slider
                min={0.5}
                max={sizeLimits[screenSize] || 2}
                step={0.1}
                value={elementSize}
                onChange={handleElementSizeChange}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Zoom</label>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={elementZoom}
                onChange={(value) => setElementZoom(value as number)}
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
                value={elementTransparency}
                onChange={(value) => setElementTransparency(value as number)}
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
                value={elementBorderRadius}
                onChange={(value) => setElementBorderRadius(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            {/* <div>
              <label className="mb-2 block">Inner Shadow</label>
              <Slider
                min={0}
                max={20}
                step={1}
                value={elementInnerShadow}
                onChange={(value) => setElementInnerShadow(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block">Box Shadow</label>
              <Slider
                min={0}
                max={20}
                step={1}
                value={elementShadow}
                onChange={(value) => setElementShadow(value as number)}
                railStyle={{ backgroundColor: "gray" }}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { borderColor: "black", backgroundColor: "black" },
                ]}
              />
            </div> */}
          </div>
        </div>
        {/* backgrounds */}
        <div className="space-y-2">
          <h2 className=" text-xl font-bold">Backgrounds</h2>
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
        </div>
        {/* screen size */}
        <div className="space-y-2">
          <h2 className=" text-xl font-bold">Screen Size</h2>
          <div className="flex flex-wrap items-center justify-start gap-3">
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
                className="max-h-full max-w-full animate-pulse"
                width={500 * imageSize} // Dynamically set width
                height={500 * imageSize} // Dynamically set height
                style={{
                  transform: `translate(${imageXPosition}px, ${imageYPosition}px) scale(${imageZoom})`,
                  opacity: imageTransparency,
                  borderRadius: `${imageBorderRadius}px`,
                  //boxShadow: `0 0 ${imageShadow}px rgba(0, 0, 0, 0.5), inset 0 0 ${imageInnerShadow}px rgba(0, 0, 0, 0.5)`,
                }}
              />
            ) : resultImageUrl ? (
              <Image
                src={resultImageUrl}
                alt="Processed screenshot"
                className="max-h-full max-w-full"
                width={500 * imageSize}
                height={500 * imageSize}
                style={{
                  transform: `translate(${imageXPosition}px, ${imageYPosition}px) scale(${imageZoom})`,
                  opacity: imageTransparency,
                  borderRadius: `${imageBorderRadius}px`,
                  //boxShadow: `0 0 ${imageShadow}px rgba(0, 0, 0, 0.5), inset 0 0 ${imageInnerShadow}px rgba(0, 0, 0, 0.5)`,
                }}
              />
            ) : screenshot ? (
              <Image
                src={screenshot}
                alt="Uploaded screenshot"
                className="max-h-full max-w-full"
                width={500 * imageSize}
                height={500 * imageSize}
                style={{
                  transform: `translate(${imageXPosition}px, ${imageYPosition}px) scale(${imageZoom})`,
                  opacity: imageTransparency,
                  borderRadius: `${imageBorderRadius}px`,
                  //boxShadow: `0 0 ${imageShadow}px rgba(0, 0, 0, 0.5), inset 0 0 ${imageInnerShadow}px rgba(0, 0, 0, 0.5)`,
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

            {selectedElement && (
              <Image
                src={selectedElement}
                alt="Selected Element"
                className="absolute"
                width={500 * elementSize} // Dynamically set width
                height={500 * elementSize} // Dynamically set height
                style={{
                  transform: `translate(${elementXPosition}px, ${elementYPosition}px) scale(${elementZoom})`,
                  opacity: elementTransparency,
                  borderRadius: `${elementBorderRadius}px`,
                  //boxShadow: `0 0 ${imageShadow}px rgba(0, 0, 0, 0.5), inset 0 0 ${elementInnerShadow}px rgba(0, 0, 0, 0.5)`,
                }}
              />
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
