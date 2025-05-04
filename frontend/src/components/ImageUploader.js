import React, { useState } from 'react';
import { Button, Box } from '@mui/material';

function ImageUploader({ onImageSelect, inputId = "upload-image" }) {
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <input
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        id={inputId}
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor={inputId}>
        <Button variant="contained" component="span">
          Upload Image
        </Button>
      </label>
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          style={{ width: 100, height: 100, borderRadius: '8px' }}
        />
      )}
    </Box>
  );
}

export default ImageUploader;
