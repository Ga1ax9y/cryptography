import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Fingerprint, LockOpen, Lock, Key, Refresh } from '@mui/icons-material';
import {
  generateKeys,
  encrypt,
  decrypt,
  stringToBigInt
} from '../../utils/RabinCrypto'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [n, setN] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [originalNumber, setOriginalNumber] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState([]);
  const [selectedDecrypted, setSelectedDecrypted] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const keys = await generateKeys(512);
      setP(keys.p);
      setQ(keys.q);
      setN(keys.n);
      setSnackbarMessage('Сгенерированы 512-битные ключи!');
      setOpenSnackbar(true);
    } catch (err) {
      setError('Ошибка генерации: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

const handleEncrypt = () => {
  try {
    if (!n) {
      setError('Сначала сгенерируйте ключи.');
      return;
    }

    if (!plaintext) {
      setError('Введите текст для шифрования.');
      return;
    }

    const numN = BigInt(n);
    const m = stringToBigInt(plaintext);

    if (m >= numN) {
      setError(`Текст слишком длинный! m=${m} >= n=${numN}. Сгенерируйте большие ключи.`);
      return;
    }

    setOriginalNumber(m.toString());

    const c = encrypt(plaintext, n);
    setCiphertext(c);
    setError('');
    setSnackbarMessage('Текст успешно зашифрован!');
    setOpenSnackbar(true);
  } catch (err) {
    setError('Ошибка при шифровании: ' + err.message);
  }
};

  const handleDecrypt = () => {
    try {
      if (!p || !q) {
        setError('Для дешифрования требуется закрытый ключ (p и q).');
        return;
      }

      if (!ciphertext) {
        setError('Введите шифротекст для дешифрования.');
        return;
      }

      const variants = decrypt(ciphertext, p, q);
      setDecrypted(variants);
      setSelectedDecrypted('');
      setError('');
      setSnackbarMessage('Дешифрование завершено! Выберите правильный вариант.');
      setOpenSnackbar(true);
    } catch (err) {
      setError('Ошибка при дешифровании: ' + err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            <Fingerprint sx={{ mr: 1, mt: 5, fontSize: 35 }} />
            Криптосистема Рабина
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Key sx={{ mr: 1, verticalAlign: 'middle' }} />
              Управление ключами
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Закрытый ключ p"
                  variant="outlined"
                  fullWidth
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  helperText="Простое число вида 4k+3"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Закрытый ключ q"
                  variant="outlined"
                  fullWidth
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  helperText="Простое число вида 4k+3"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Открытый ключ n (p×q)"
                  variant="outlined"
                  fullWidth
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateKeys}
              startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
              disabled={isGenerating}
            >
              {isGenerating ? 'Генерация...' : 'Сгенерировать ключи'}
            </Button>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 2 }}>
              <Tab icon={<Lock />} label="Шифрование" />
              <Tab icon={<LockOpen />} label="Дешифрование" />
            </Tabs>

            <Divider sx={{ mb: 3 }} />

            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Шифрование
                </Typography>

                <TextField
                  label="Исходный текст"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEncrypt}
                  startIcon={<Lock />}
                  sx={{ mb: 2 }}
                >
                  Зашифровать
                </Button>

                {ciphertext && (
                <TextField
                    label="Зашифрованный текст"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={ciphertext}
                    InputProps={{
                    readOnly: true,
                    }}
                    sx={{ mb: 2 }}
                />
                )}

                {originalNumber && (
                <TextField
                    label="Число до шифрования (m)"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    value={originalNumber}
                    InputProps={{
                    readOnly: true,
                    }}
                    sx={{ mb: 2 }}
                />
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Дешифрование
                </Typography>

                <TextField
                  label="Зашифрованный текст"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={ciphertext}
                  onChange={(e) => setCiphertext(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDecrypt}
                  startIcon={<LockOpen />}
                  sx={{ mb: 3 }}
                >
                  Дешифровать
                </Button>

                {decrypted.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Выберите правильный вариант:
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>4 варианта дешифрования</InputLabel>
                      <Select
                        value={selectedDecrypted}
                        onChange={(e) => setSelectedDecrypted(e.target.value)}
                        label="Выберите правильный вариант"
                      >
                        {decrypted.map((item, index) => (
                          <MenuItem key={index} value={item.value}>
                            {item.label}: "{item.text}" {item.isValid ? '✅' : '⚠️'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ mb: 3 }}>
                      {decrypted.map((item, index) => (
                        <Alert
                          key={index}
                          severity={item.isValid ? "success" : "warning"}
                          sx={{ mb: 1 }}
                        >
                          <strong>{item.label}:</strong> "{item.text}"<br />
                          <Typography variant="caption" component="div">
                            Число: {item.value}
                          </Typography>
                        </Alert>
                      ))}
                    </Box>

                    {selectedDecrypted && (
                      <Alert severity="success">
                        <strong>Выбрано:</strong> "{decrypted.find(item => item.value === selectedDecrypted)?.text}"
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          message={snackbarMessage}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
