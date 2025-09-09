import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Refresh,
  VpnKey
} from '@mui/icons-material';

const KeySetup = ({ keyValue, onKeyChange }) => {
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const generateRandomKey = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);

    const hexKey = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    onKeyChange(hexKey);
    setError('');
  };

  const handleKeyChange = (event) => {
    const value = event.target.value;
    onKeyChange(value);

    if (value) {
      if (value.length !== 64) {
        setError('Ключ должен быть 256 бит');
        return;
      }

      setError('');
    } else {
      setError('');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onKeyChange(text);
      }
    } catch (err) {
      console.error('Ошибка при чтении из буфера обмена:', err);
    }
  };

  const keyBytes = keyValue ? Math.ceil(keyValue.length / 2) : 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <VpnKey sx={{ mr: 1, verticalAlign: 'middle' }} />
        Настройка криптографического ключа
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ключу желательно быть 256 бит
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Криптографический ключ"
          value={keyValue}
          onChange={handleKeyChange}
          type={showKey ? 'text' : 'password'}
          error={!!error}
          helperText={error || `Длина ключа: ${keyBytes} байт${keyBytes === 32 ? ' (корректно)' : ' (рекомендуется 256 бит)'}`}
          placeholder="Введите ключ (0-9, a-f)"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowKey(!showKey)}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Refresh />}
            onClick={generateRandomKey}
          >
            Сгенерировать ключ
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePaste}
          >
            Вставить из буфера
          </Button>
        </Grid>
      </Grid>

      {keyValue && !error && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Ключ установлен успешно! Длина: {keyBytes} байт
        </Alert>
      )}
    </Paper>
  );
};

export default KeySetup;
