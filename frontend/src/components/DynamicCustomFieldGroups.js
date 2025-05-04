// frontend/src/components/DynamicCustomFieldGroups.js
import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function DynamicCustomFieldGroups({ groups, setGroups }) {
  // تغییر عنوان گروه
  const handleGroupTitleChange = (groupIndex, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex].groupTitle = value;
    setGroups(newGroups);
  };

  // تغییر یک فیلد در گروه
  const handleFieldChange = (groupIndex, fieldIndex, key, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex].fields[fieldIndex][key] = value;
    setGroups(newGroups);
  };

  // افزودن یک گروه جدید
  const addGroup = () => {
    setGroups([...groups, { groupTitle: '', fields: [] }]);
  };

  // حذف یک گروه
  const removeGroup = (groupIndex) => {
    const newGroups = groups.filter((_, i) => i !== groupIndex);
    setGroups(newGroups);
  };

  // افزودن فیلد جدید به یک گروه
  const addFieldToGroup = (groupIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].fields.push({ label: '', value: '' });
    setGroups(newGroups);
  };

  // حذف فیلد از یک گروه
  const removeFieldFromGroup = (groupIndex, fieldIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].fields = newGroups[groupIndex].fields.filter((_, i) => i !== fieldIndex);
    setGroups(newGroups);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {groups.map((group, groupIndex) => (
        <Card key={groupIndex} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}
            >
              <TextField
                label="Group Title"
                value={group.groupTitle}
                onChange={(e) => handleGroupTitleChange(groupIndex, e.target.value)}
                fullWidth
              />
              <IconButton onClick={() => removeGroup(groupIndex)}>
                <DeleteIcon />
              </IconButton>
            </Box>
            {group.fields.map((field, fieldIndex) => (
              <Box key={fieldIndex} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <TextField
                  label="Field Label"
                  value={field.label}
                  onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'label', e.target.value)}
                />
                <TextField
                  label="Field Value"
                  value={field.value}
                  onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'value', e.target.value)}
                />
                <IconButton onClick={() => removeFieldFromGroup(groupIndex, fieldIndex)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button variant="outlined" onClick={() => addFieldToGroup(groupIndex)}>
              Add Field to Group
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button variant="contained" onClick={addGroup}>
        Add New Group
      </Button>
    </Box>
  );
}

export default DynamicCustomFieldGroups;
