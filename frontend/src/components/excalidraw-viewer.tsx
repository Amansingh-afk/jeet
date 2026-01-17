"use client"

import * as React from "react"
import { exportToSvg } from "@excalidraw/excalidraw"

// Using any for now since Excalidraw types are complex
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExcalidrawElement = any

interface ExcalidrawViewerProps {
  elements: ExcalidrawElement[]
  className?: string
}

/**
 * Normalize elements to start from origin with padding
 */
function normalizeElements(elements: ExcalidrawElement[]): ExcalidrawElement[] {
  if (!elements || elements.length === 0) return elements

  // Find bounding box
  let minX = Infinity, minY = Infinity
  for (const el of elements) {
    if (typeof el.x === 'number') minX = Math.min(minX, el.x)
    if (typeof el.y === 'number') minY = Math.min(minY, el.y)
  }

  if (!isFinite(minX) || !isFinite(minY)) return elements

  // Shift elements to start near origin with padding
  const offsetX = minX - 20
  const offsetY = minY - 20

  return elements.map(el => ({
    ...el,
    x: typeof el.x === 'number' ? el.x - offsetX : el.x,
    y: typeof el.y === 'number' ? el.y - offsetY : el.y,
  }))
}

/**
 * Static SVG viewer for Excalidraw diagrams
 * Uses exportToSvg instead of interactive canvas to avoid size limits
 */
export function ExcalidrawViewer({
  elements,
  className,
}: ExcalidrawViewerProps) {
  const [svgContent, setSvgContent] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!elements || elements.length === 0) {
      setSvgContent(null)
      return
    }

    const generateSvg = async () => {
      try {
        const normalizedElements = normalizeElements(elements)

        const svg = await exportToSvg({
          elements: normalizedElements,
          appState: {
            viewBackgroundColor: "transparent",
            exportWithDarkMode: false,
          },
          files: null,
        })

        // Excalidraw sets width/height, we need to make it responsive
        svg.removeAttribute('width')
        svg.removeAttribute('height')
        svg.style.width = '100%'
        svg.style.height = '100%'
        svg.style.maxWidth = '100%'
        svg.style.maxHeight = '100%'

        setSvgContent(svg.outerHTML)
        setError(null)
      } catch (err) {
        console.error('Failed to render diagram:', err)
        setError('Diagram could not be loaded')
      }
    }

    generateSvg()
  }, [elements])

  if (!elements || elements.length === 0) {
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
        {error}
      </div>
    )
  }

  if (!svgContent) {
    return (
      <div
        className={className}
        style={{ height: "180px", width: "100%", maxWidth: "450px" }}
      >
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Loading diagram...
        </div>
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        height: "180px",
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "12px",
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

// Sample diagram for successive profit/loss - A → B → C flow
export const sampleDiagram: ExcalidrawElement[] = [
  {
    id: "box1",
    type: "rectangle",
    x: 50,
    y: 100,
    width: 80,
    height: 50,
    strokeColor: "#1e1e1e",
    backgroundColor: "#a5d8ff",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    angle: 0,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
  },
  {
    id: "text1",
    type: "text",
    x: 75,
    y: 115,
    width: 30,
    height: 25,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: 1,
    opacity: 100,
    angle: 0,
    text: "A",
    fontSize: 20,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 2,
    version: 1,
    versionNonce: 2,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    containerId: null,
    originalText: "A",
    autoResize: true,
    lineHeight: 1.25,
  },
  {
    id: "arrow1",
    type: "arrow",
    x: 130,
    y: 125,
    width: 70,
    height: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    angle: 0,
    points: [[0, 0], [70, 0]],
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    seed: 3,
    version: 1,
    versionNonce: 3,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    startBinding: null,
    endBinding: null,
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: "arrow",
  },
  {
    id: "label1",
    type: "text",
    x: 145,
    y: 95,
    width: 40,
    height: 20,
    strokeColor: "#2f9e44",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: 1,
    opacity: 100,
    angle: 0,
    text: "+20%",
    fontSize: 14,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 4,
    version: 1,
    versionNonce: 4,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    containerId: null,
    originalText: "+20%",
    autoResize: true,
    lineHeight: 1.25,
  },
  {
    id: "box2",
    type: "rectangle",
    x: 200,
    y: 100,
    width: 80,
    height: 50,
    strokeColor: "#1e1e1e",
    backgroundColor: "#b2f2bb",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    angle: 0,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: 5,
    version: 1,
    versionNonce: 5,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
  },
  {
    id: "text2",
    type: "text",
    x: 225,
    y: 115,
    width: 30,
    height: 25,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: 1,
    opacity: 100,
    angle: 0,
    text: "B",
    fontSize: 20,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 6,
    version: 1,
    versionNonce: 6,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    containerId: null,
    originalText: "B",
    autoResize: true,
    lineHeight: 1.25,
  },
  {
    id: "arrow2",
    type: "arrow",
    x: 280,
    y: 125,
    width: 70,
    height: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    angle: 0,
    points: [[0, 0], [70, 0]],
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    seed: 7,
    version: 1,
    versionNonce: 7,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    startBinding: null,
    endBinding: null,
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: "arrow",
  },
  {
    id: "label2",
    type: "text",
    x: 295,
    y: 95,
    width: 40,
    height: 20,
    strokeColor: "#2f9e44",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: 1,
    opacity: 100,
    angle: 0,
    text: "+25%",
    fontSize: 14,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 8,
    version: 1,
    versionNonce: 8,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    containerId: null,
    originalText: "+25%",
    autoResize: true,
    lineHeight: 1.25,
  },
  {
    id: "box3",
    type: "rectangle",
    x: 350,
    y: 100,
    width: 80,
    height: 50,
    strokeColor: "#1e1e1e",
    backgroundColor: "#ffc9c9",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    angle: 0,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: 9,
    version: 1,
    versionNonce: 9,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
  },
  {
    id: "text3",
    type: "text",
    x: 375,
    y: 115,
    width: 30,
    height: 25,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: 1,
    opacity: 100,
    angle: 0,
    text: "C",
    fontSize: 20,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 10,
    version: 1,
    versionNonce: 10,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    containerId: null,
    originalText: "C",
    autoResize: true,
    lineHeight: 1.25,
  },
  {
    id: "price",
    type: "text",
    x: 365,
    y: 160,
    width: 50,
    height: 20,
    strokeColor: "#e03131",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: 1,
    opacity: 100,
    angle: 0,
    text: "₹600",
    fontSize: 16,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 11,
    version: 1,
    versionNonce: 11,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    containerId: null,
    originalText: "₹600",
    autoResize: true,
    lineHeight: 1.25,
  },
]
