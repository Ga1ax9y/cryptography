import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Upload,
  Description,
  Delete,
} from '@mui/icons-material';

const FileUpload = ({ file, onFileChange }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'text/xml'
    ];

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(txt|text|html|css|js|json|xml)$/i)) {
      alert('Пожалуйста, выберите текстовый файл (TXT, HTML, CSS, JS, JSON, XML)');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('Текстовый файл слишком большой. Максимальный размер: 5MB');
      return;
    }

    onFileChange(selectedFile);
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

const readFilePreview = async (file) => {
  try {
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });

    const preview = text.slice(0, 200);
    if (preview.includes('�')) {
      return 'Файл содержит битые Unicode символы. Возможно, неверная кодировка.';
    }

    return preview + (text.length > 200 ? '...' : '');
  } catch (error) {
    return 'Не удалось прочитать содержимое файла: ' + error.message;
  }
};

  const [filePreview, setFilePreview] = useState('');

  React.useEffect(() => {
    if (file) {
      readFilePreview(file).then(setFilePreview);
    } else {
      setFilePreview('');
    }
  }, [file]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Загрузка текстового файла
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Выберите текстовый файл для шифрования или дешифрования
      </Typography>

      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          backgroundColor: dragOver ? 'primary.light' : 'grey.50',
          transition: 'all 0.2s ease',
          mb: 2
        }}
      >
        <Upload sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          Перетащите текстовый файл сюда или
        </Typography>

        <Button
          variant="contained"
          component="label"
          sx={{ mt: 1 }}
        >
          Выбрать файл
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleInputChange}
            accept=".txt,.text,.html,.css,.js,.json,.xml,text/*"
          />
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <br />Максимальный размер: 5MB
        </Typography>
      </Box>

      {file && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Текстовый файл успешно загружен!
        </Alert>
      )}

      {file && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <List dense>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={handleRemoveFile}>
                  <Delete />
                </IconButton>
              }
            >
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={
                  <>
                    Размер: {formatFileSize(file.size)}
                    <br />
                    Тип: {file.type || 'text/plain'}
                  </>
                }
              />
            </ListItem>
          </List>
        </Paper>
      )}

      {filePreview && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Предпросмотр содержимого:
          </Typography>
          <Box
            sx={{
              maxHeight: '100px',
              overflow: 'auto',
              bgcolor: 'grey.50',
              p: 1,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            {filePreview}
          </Box>
        </Paper>
      )}

      {!file && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Выберите текстовый файл для продолжения.
        </Alert>
      )}
    </Paper>
  );
};

export default FileUpload;
