import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  FaUndo, FaRedo, FaTrash, FaPaintBrush, FaFont, FaEraser,
  FaImage, FaSave
} from 'react-icons/fa';

const CustomOrderPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const textInputRef = useRef(null);
  const fileInputImageRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [baseImage, setBaseImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [imageElements, setImageElements] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [showTextInput, setShowTextInput] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState('pen');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingSize, setDrawingSize] = useState(5);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  
  const [customization, setCustomization] = useState({
    category: 'wooden',
    engravingText: '',
    font: 'Arial',
    color: '#000000',
    logo: null
  });

  const categories = {
    wooden: { name: 'Wooden', basePrice: 1999, icon: '🪵' },
    acrylic: { name: 'Acrylic', basePrice: 2499, icon: '✨' },
    metal: { name: 'Metal', basePrice: 2999, icon: '⚙️' },
    marble: { name: 'Marble', basePrice: 3999, icon: '🗿' }
  };

  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Impact', 'Tahoma'];

  // Camera functions
  const startCamera = () => {
    setShowCamera(true);
  };

  const startCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Unable to access camera');
      setShowCamera(false);
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current) {
      startCameraCapture();
    }
  }, [showCamera]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setBaseImage(imageData);
      setCustomization({ ...customization, logo: imageData });
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size too large. Max 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImage(reader.result);
        setCustomization({ ...customization, logo: reader.result });
        // Reset elements when new image is uploaded
        setTextElements([]);
        setImageElements([]);
        setPaths([]);
        saveToHistory();
      };
      reader.readAsDataURL(file);
    }
  };

  // Paste image from clipboard
  useEffect(() => {
    const handlePaste = (e) => {
      if (step !== 2 || !baseImage) return;
      
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const newImage = {
              id: Date.now(),
              type: 'image',
              src: event.target.result,
              x: 100,
              y: 100,
              width: 150,
              height: 150,
              rotation: 0
            };
            setImageElements([...imageElements, newImage]);
            saveToHistory();
            toast.success('Image pasted!');
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [step, baseImage, imageElements]);

  // Add image via file input
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = {
          id: Date.now(),
          type: 'image',
          src: event.target.result,
          x: 100,
          y: 100,
          width: 150,
          height: 150,
          rotation: 0
        };
        setImageElements([...imageElements, newImage]);
        saveToHistory();
        toast.success('Image added!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Text editing functions
  const addTextElement = () => {
    if (!currentText.trim()) {
      toast.error('Please enter some text');
      return;
    }

    const newElement = {
      id: Date.now(),
      type: 'text',
      text: currentText,
      x: 100,
      y: 100,
      fontSize: fontSize,
      fontFamily: fontFamily,
      color: textColor,
      rotation: 0,
      scale: 1
    };

    setTextElements([...textElements, newElement]);
    setCurrentText('');
    setShowTextInput(false);
    saveToHistory();
  };

  const updateTextElement = (id, updates) => {
    setTextElements(textElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const updateImageElement = (id, updates) => {
    setImageElements(imageElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id, type) => {
    if (type === 'text') {
      setTextElements(textElements.filter(el => el.id !== id));
    } else if (type === 'image') {
      setImageElements(imageElements.filter(el => el.id !== id));
    }
    if (selectedElement === id) setSelectedElement(null);
    saveToHistory();
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (!baseImage) return;
    
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    const newPath = {
      points: [{ x, y }],
      color: drawingColor,
      size: drawingSize,
      mode: drawingMode
    };
    setCurrentPath(newPath);
  };

  const draw = (e) => {
    if (!isDrawing || !baseImage || !currentPath) return;
    
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const updatedPath = {
      ...currentPath,
      points: [...currentPath.points, { x, y }]
    };
    setCurrentPath(updatedPath);

    // Draw on canvas
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.strokeStyle = drawingMode === 'eraser' ? '#F5F0E8' : drawingColor;
    ctx.lineWidth = drawingSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (currentPath.points.length > 0) {
      const lastPoint = currentPath.points[currentPath.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (currentPath && currentPath.points.length > 1) {
      setPaths([...paths, currentPath]);
    }
    setIsDrawing(false);
    setCurrentPath(null);
    saveToHistory();
  };

  const clearCanvas = () => {
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    setPaths([]);
    saveToHistory();
  };

  // Redraw all paths
  useEffect(() => {
    if (!drawingCanvasRef.current) return;
    
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = path.mode === 'eraser' ? '#F5F0E8' : path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });
  }, [paths]);

  // Mouse event handlers for dragging elements
  const handleMouseDown = (e, id, type) => {
    e.preventDefault();
    setSelectedElement(id);
    
    const elements = type === 'text' ? textElements : imageElements;
    const element = elements.find(el => el.id === id);
    const startX = e.clientX - element.x;
    const startY = e.clientY - element.y;

    const handleMouseMove = (e) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      
      if (type === 'text') {
        updateTextElement(id, { x: newX, y: newY });
      } else {
        updateImageElement(id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      saveToHistory();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // History functions
  const saveToHistory = () => {
    const state = {
      textElements: [...textElements],
      imageElements: [...imageElements],
      paths: [...paths]
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTextElements(prevState.textElements);
      setImageElements(prevState.imageElements);
      setPaths(prevState.paths);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTextElements(nextState.textElements);
      setImageElements(nextState.imageElements);
      setPaths(nextState.paths);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Transform functions
  const rotateElement = (id, type, direction) => {
    const elements = type === 'text' ? textElements : imageElements;
    const element = elements.find(el => el.id === id);
    const newRotation = (element.rotation || 0) + (direction === 'left' ? -15 : 15);
    
    if (type === 'text') {
      updateTextElement(id, { rotation: newRotation });
    } else {
      updateImageElement(id, { rotation: newRotation });
    }
    saveToHistory();
  };

  const scaleElement = (id, type, increase) => {
    const elements = type === 'text' ? textElements : imageElements;
    const element = elements.find(el => el.id === id);
    
    if (type === 'text') {
      const newScale = (element.scale || 1) + (increase ? 0.1 : -0.1);
      if (newScale >= 0.5 && newScale <= 3) {
        updateTextElement(id, { scale: newScale });
      }
    } else {
      const newWidth = element.width + (increase ? 20 : -20);
      const newHeight = element.height + (increase ? 20 : -20);
      if (newWidth >= 50 && newWidth <= 400) {
        updateImageElement(id, { width: newWidth, height: newHeight });
      }
    }
    saveToHistory();
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add custom items to cart');
      navigate('/login', { state: { from: '/custom-order' } });
      return;
    }

    // Generate final image with all elements
    const finalImage = await generateFinalImage();
    
    const customProductName = `Custom ${categories[customization.category].name} Gift - ${Date.now()}`;

    try {
      await addToCart({
        productName: customProductName,
        quantity: 1,
        customization: {
          textElements,
          imageElements,
          paths,
          finalImage
        }
      });
      
      toast.success('Custom item added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding custom item:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  // Generate final image with all overlays
  const generateFinalImage = () => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Scale coordinates to match canvas size
        const scaleX = img.width / 800;
        const scaleY = img.height / 600;
        
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Draw paths (drawings)
        paths.forEach(path => {
          if (path.points.length < 2) return;
          
          ctx.beginPath();
          ctx.strokeStyle = path.mode === 'eraser' ? '#F5F0E8' : path.color;
          ctx.lineWidth = path.size * scaleX;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.moveTo(path.points[0].x * scaleX, path.points[0].y * scaleY);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x * scaleX, path.points[i].y * scaleY);
          }
          ctx.stroke();
        });
        
        // Draw text elements
        textElements.forEach(el => {
          ctx.save();
          ctx.translate(el.x * scaleX, el.y * scaleY);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.scale(el.scale || 1, el.scale || 1);
          ctx.font = `${el.fontSize * scaleX}px ${el.fontFamily}`;
          ctx.fillStyle = el.color;
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4 * scaleX;
          ctx.shadowOffsetX = 2 * scaleX;
          ctx.shadowOffsetY = 2 * scaleY;
          ctx.fillText(el.text, 0, 0);
          ctx.restore();
        });
        
        // Draw image elements
        imageElements.forEach(el => {
          const imgEl = new Image();
          imgEl.src = el.src;
          ctx.save();
          ctx.translate(el.x * scaleX, el.y * scaleY);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.drawImage(imgEl, 0, 0, el.width * scaleX, el.height * scaleY);
          ctx.restore();
        });
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = baseImage;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#8B5A2B] mb-8">Create Custom Gift</h1>
      
      {/* Progress Steps */}
      <div className="flex justify-between mb-12">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 text-center pb-2 border-b-2 ${
              step >= s ? 'border-[#8B5A2B] text-[#8B5A2B]' : 'border-gray-300 text-gray-400'
            }`}
          >
            Step {s}: {s === 1 ? 'Upload' : s === 2 ? 'Design' : 'Review'}
          </div>
        ))}
      </div>

      {/* Step 1: Image Upload */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Image or Logo</h2>
          
          {/* Camera Popup */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#8B5A2B]">Take Photo</h3>
                  <button
                    onClick={stopCamera}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="p-4 border-t flex gap-4">
                  <button
                    onClick={captureImage}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                    Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex-1 bg-[#9CAF88] text-white py-3 rounded-lg hover:bg-[#8B5A2B]"
              >
                📁 Upload Image
              </button>
              <button
                onClick={startCamera}
                className="flex-1 bg-[#8B5A2B] text-white py-3 rounded-lg hover:bg-[#9CAF88]"
              >
                📸 Use Camera
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {baseImage && (
            <div className="mt-4 relative">
              <img src={baseImage} alt="Preview" className="max-h-64 rounded-lg mx-auto" />
              <button
                onClick={() => {
                  setBaseImage(null);
                  setCustomization({ ...customization, logo: null });
                  setTextElements([]);
                  setImageElements([]);
                  setPaths([]);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
              >
                ×
              </button>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!baseImage}
            className="w-full mt-6 bg-[#8B5A2B] text-white py-3 rounded-lg disabled:bg-gray-400"
          >
            Next: Design
          </button>
        </div>
      )}

      {/* Step 2: Design Studio */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Design Studio</h2>
          
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Tools Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Material Selection */}
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <h3 className="font-medium text-[#8B5A2B] mb-3">Material</h3>
                <select
                  value={customization.category}
                  onChange={(e) => setCustomization({ ...customization, category: e.target.value })}
                  className="w-full p-2 border border-[#9CAF88] rounded-lg"
                >
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.icon} {cat.name} - ₹{cat.basePrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drawing Tools */}
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <h3 className="font-medium text-[#8B5A2B] mb-3">Drawing Tools</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => setDrawingMode('pen')}
                    className={`p-2 rounded flex items-center justify-center space-x-1 ${
                      drawingMode === 'pen' ? 'bg-[#8B5A2B] text-white' : 'bg-white text-[#8B5A2B]'
                    }`}
                  >
                    <FaPaintBrush />
                    <span>Pen</span>
                  </button>
                  <button
                    onClick={() => setDrawingMode('eraser')}
                    className={`p-2 rounded flex items-center justify-center space-x-1 ${
                      drawingMode === 'eraser' ? 'bg-[#8B5A2B] text-white' : 'bg-white text-[#8B5A2B]'
                    }`}
                  >
                    <FaEraser />
                    <span>Eraser</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={drawingColor}
                      onChange={(e) => setDrawingColor(e.target.value)}
                      className="w-full h-8"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Size: {drawingSize}px</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={drawingSize}
                      onChange={(e) => setDrawingSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Image Tools */}
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <h3 className="font-medium text-[#8B5A2B] mb-3">Add Images</h3>
                <button
                  onClick={() => fileInputImageRef.current.click()}
                  className="w-full bg-[#9CAF88] text-white py-2 rounded-lg hover:bg-[#8B5A2B] flex items-center justify-center space-x-2 mb-2"
                >
                  <FaImage />
                  <span>Upload Image</span>
                </button>
                <input
                  type="file"
                  ref={fileInputImageRef}
                  onChange={handleAddImage}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: You can also paste images (Ctrl+V)
                </p>
              </div>

              {/* Text Tools */}
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <h3 className="font-medium text-[#8B5A2B] mb-3">Text Tools</h3>
                {!showTextInput ? (
                  <button
                    onClick={() => setShowTextInput(true)}
                    className="w-full bg-[#9CAF88] text-white py-2 rounded-lg hover:bg-[#8B5A2B] flex items-center justify-center space-x-2"
                  >
                    <FaFont />
                    <span>Add Text</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      ref={textInputRef}
                      type="text"
                      value={currentText}
                      onChange={(e) => setCurrentText(e.target.value)}
                      placeholder="Enter text"
                      className="w-full px-3 py-2 border border-[#9CAF88] rounded-lg"
                      autoFocus
                    />
                    
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {fonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        min="8"
                        max="72"
                        className="p-2 border rounded"
                        placeholder="Size"
                      />
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={addTextElement}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowTextInput(false)}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Tools */}
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <h3 className="font-medium text-[#8B5A2B] mb-3">Edit Tools</h3>
                <div className="flex space-x-2 mb-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    <FaUndo className="inline mr-1" /> Undo
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    <FaRedo className="inline mr-1" /> Redo
                  </button>
                </div>
                <button
                  onClick={clearCanvas}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  <FaTrash className="inline mr-1" /> Clear All
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <div className="border-2 border-[#9CAF88] rounded-lg p-4 bg-[#F5F0E8]">
                <div className="relative" style={{ minHeight: '500px' }}>
                  {baseImage ? (
                    <>
                      {/* Base Image */}
                      <img 
                        src={baseImage} 
                        alt="Design Canvas" 
                        className="w-full h-auto rounded-lg"
                      />
                      
                      {/* Drawing Canvas Overlay */}
                      <canvas
                        ref={drawingCanvasRef}
                        width={800}
                        height={600}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ pointerEvents: 'auto' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                      
                      {/* Image Elements */}
                      {imageElements.map((el) => (
                        <div
                          key={el.id}
                          className={`absolute cursor-move ${
                            selectedElement === el.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                          }`}
                          style={{
                            left: el.x,
                            top: el.y,
                            transform: `rotate(${el.rotation}deg)`,
                            transformOrigin: '0 0',
                            zIndex: 10
                          }}
                          onMouseDown={(e) => {
                            setSelectedElement(el.id);
                            handleMouseDown(e, el.id, 'image');
                          }}
                        >
                          <img 
                            src={el.src} 
                            alt="Overlay"
                            style={{
                              width: el.width,
                              height: el.height,
                              objectFit: 'contain'
                            }}
                          />
                          
                          {/* Selection Controls */}
                          {selectedElement === el.id && (
                            <div className="absolute -top-10 left-0 flex space-x-1 bg-white rounded shadow-lg p-1 z-20">
                              <button
                                onClick={() => rotateElement(el.id, 'image', 'left')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Rotate Left"
                              >
                                ↺
                              </button>
                              <button
                                onClick={() => rotateElement(el.id, 'image', 'right')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Rotate Right"
                              >
                                ↻
                              </button>
                              <button
                                onClick={() => scaleElement(el.id, 'image', false)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Smaller"
                              >
                                -
                              </button>
                              <button
                                onClick={() => scaleElement(el.id, 'image', true)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Larger"
                              >
                                +
                              </button>
                              <button
                                onClick={() => deleteElement(el.id, 'image')}
                                className="p-1 hover:bg-red-100 text-red-600 rounded"
                                title="Delete"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Text Elements */}
                      {textElements.map((el) => (
                        <div
                          key={el.id}
                          className={`absolute cursor-move ${
                            selectedElement === el.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                          }`}
                          style={{
                            left: el.x,
                            top: el.y,
                            transform: `rotate(${el.rotation}deg) scale(${el.scale || 1})`,
                            transformOrigin: '0 0',
                            fontFamily: el.fontFamily,
                            fontSize: `${el.fontSize}px`,
                            color: el.color,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            zIndex: 10
                          }}
                          onMouseDown={(e) => {
                            setSelectedElement(el.id);
                            handleMouseDown(e, el.id, 'text');
                          }}
                        >
                          {el.text}
                          
                          {/* Selection Controls */}
                          {selectedElement === el.id && (
                            <div className="absolute -top-10 left-0 flex space-x-1 bg-white rounded shadow-lg p-1 z-20">
                              <button
                                onClick={() => rotateElement(el.id, 'text', 'left')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Rotate Left"
                              >
                                ↺
                              </button>
                              <button
                                onClick={() => rotateElement(el.id, 'text', 'right')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Rotate Right"
                              >
                                ↻
                              </button>
                              <button
                                onClick={() => scaleElement(el.id, 'text', false)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Smaller"
                              >
                                -
                              </button>
                              <button
                                onClick={() => scaleElement(el.id, 'text', true)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Larger"
                              >
                                +
                              </button>
                              <button
                                onClick={() => deleteElement(el.id, 'text')}
                                className="p-1 hover:bg-red-100 text-red-600 rounded"
                                title="Delete"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-400">Please upload an image first</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {drawingMode === 'pen' && '✏️ Draw freehand - Click and drag to draw'}
                  {drawingMode === 'eraser' && '🧹 Eraser - Click and drag to erase'}
                </p>
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#8B5A2B] text-white px-6 py-2 rounded-lg hover:bg-[#9CAF88]"
                >
                  Next: Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Add to Cart - FIXED: Now shows all elements */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Review Your Design</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left side - Final Preview with ALL elements */}
            <div className="space-y-4">
              <h3 className="font-medium text-[#8B5A2B]">Final Preview</h3>
              <div className="relative border rounded-lg overflow-hidden bg-[#F5F0E8]">
                <img 
                  src={baseImage} 
                  alt="Final" 
                  className="w-full h-auto"
                />
                
                {/* Preview drawings - FIXED: Now showing */}
                {paths.map((path, index) => (
                  <svg
                    key={index}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <path
                      d={`M ${path.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                      stroke={path.mode === 'eraser' ? '#F5F0E8' : path.color}
                      strokeWidth={path.size}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
                
                {/* Preview text elements - FIXED: Now showing */}
                {textElements.map((el) => (
                  <div
                    key={el.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: el.x,
                      top: el.y,
                      transform: `rotate(${el.rotation}deg) scale(${el.scale || 1})`,
                      transformOrigin: '0 0',
                      fontFamily: el.fontFamily,
                      fontSize: `${el.fontSize}px`,
                      color: el.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {el.text}
                  </div>
                ))}
                
                {/* Preview image elements - FIXED: Now showing */}
                {imageElements.map((el) => (
                  <img
                    key={el.id}
                    src={el.src}
                    alt="Overlay"
                    className="absolute pointer-events-none"
                    style={{
                      left: el.x,
                      top: el.y,
                      transform: `rotate(${el.rotation}deg)`,
                      width: el.width,
                      height: el.height,
                      objectFit: 'contain'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-[#8B5A2B]">Details</h3>
              
              <div className="border rounded-lg p-4 space-y-3 bg-[#F5F0E8]">
                <div>
                  <span className="text-sm text-gray-600">Material:</span>
                  <p className="font-medium text-[#8B5A2B]">{categories[customization.category].name}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Text Elements:</span>
                  <p className="font-medium">{textElements.length}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Image Elements:</span>
                  <p className="font-medium">{imageElements.length}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Drawings:</span>
                  <p className="font-medium">{paths.length}</p>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-sm text-gray-600">Price:</span>
                  <p className="text-2xl font-bold text-[#8B5A2B]">
                    ₹{categories[customization.category].basePrice}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  Back to Design
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOrderPage;