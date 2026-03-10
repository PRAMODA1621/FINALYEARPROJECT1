import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ProductCustomization = ({ product, onSave, onClose }) => {
  const [customizations, setCustomizations] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleTextChange = (optionName, value) => {
    setCustomizations({
      ...customizations,
      [optionName]: value
    });
  };

  const handleColorSelect = (optionName, color) => {
    setCustomizations({
      ...customizations,
      [optionName]: color
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setCustomizations({
          ...customizations,
          logo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (optionName, value) => {
    setCustomizations({
      ...customizations,
      [optionName]: value
    });
  };

  const handleSave = () => {
    onSave(customizations);
  };

  // Sample customization options - in production, these would come from the backend
  const customizationOptions = [
    {
      type: 'text',
      name: 'engravedText',
      label: 'Engraved Text',
      placeholder: 'Enter text to engrave',
      maxLength: 20
    },
    {
      type: 'color',
      name: 'color',
      label: 'Color',
      options: ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gold']
    },
    {
      type: 'image',
      name: 'logo',
      label: 'Upload Logo',
      accept: 'image/*'
    },
    {
      type: 'select',
      name: 'size',
      label: 'Size',
      options: ['Small', 'Medium', 'Large', 'XL', 'XXL']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Customize Your Product</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Preview Section */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Preview</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={preview || product.image_url}
                  alt="Product preview"
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Your customizations:</p>
                  {Object.entries(customizations).map(([key, value]) => (
                    value && (
                      <p key={key} className="text-sm">
                        <span className="font-medium">{key}:</span> {value}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Customization Options */}
            {customizationOptions.map((option) => (
              <div key={option.name} className="border rounded-lg p-4">
                <label className="block font-semibold mb-2">{option.label}</label>
                
                {option.type === 'text' && (
                  <input
                    type="text"
                    maxLength={option.maxLength}
                    placeholder={option.placeholder}
                    onChange={(e) => handleTextChange(option.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                {option.type === 'color' && (
                  <div className="flex flex-wrap gap-2">
                    {option.options.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(option.name, color)}
                        className={`px-4 py-2 border rounded-lg ${
                          customizations[option.name] === color
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                )}

                {option.type === 'image' && (
                  <div>
                    <input
                      type="file"
                      accept={option.accept}
                      onChange={handleImageUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                    {uploadedImage && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {uploadedImage.name}
                      </p>
                    )}
                  </div>
                )}

                {option.type === 'select' && (
                  <select
                    onChange={(e) => handleSelectChange(option.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select {option.label}</option>
                    {option.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex-1 btn-primary"
              >
                Save Customizations
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomization;