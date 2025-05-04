// frontend/src/components/PermissionTree.js
import React, { useEffect, useState } from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import { Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';

function PermissionTree({ onSelect }) {
  const [tree, setTree] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5000/api/permissions/tree')
      .then(res => setTree(res.data))
      .catch(err => console.error(err));
  }, []);

  const renderTree = (group, permissions) => (
    <TreeItem key={group} nodeId={group} label={<Typography variant="subtitle1">{group}</Typography>}>
      {permissions.map(p => (
        <TreeItem key={p.id} nodeId={`${p.id}`} label={p.name} onLabelClick={() => onSelect && onSelect(p)}/>
      ))}
    </TreeItem>
  );

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {Object.keys(tree).map(group => renderTree(group, tree[group]))}
    </TreeView>
  );
}

export default PermissionTree;
