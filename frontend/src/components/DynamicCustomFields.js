// frontend/src/components/DynamicCustomFields.js
import React from 'react';
import { Box, TextField, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function DynamicCustomFields({ fields, setFields }) {
  const handleFieldChange = (index, fieldName, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [fieldName]: value };
    setFields(newFields);
  };

  const handleAddField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {fields.map((field, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TextField
            label="Field Name"
            value={field.key}
            onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
            size="small"
          />
          <TextField
            label="Field Value"
            value={field.value}
            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
            size="small"
          />
          <IconButton onClick={() => handleRemoveField(index)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button variant="outlined" onClick={handleAddField}>
        Add Custom Field
      </Button>
    </Box>
  );
}

export default DynamicCustomFields;
