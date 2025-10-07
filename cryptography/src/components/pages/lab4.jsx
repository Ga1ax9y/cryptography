import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  VpnKey,
  Lock,
  LockOpen,
  Download,
  ContentCopy,
  Refresh,
  Delete,
  Upload,
  Code,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { McElieceCrypto } from '../../utils/McElieceCrypto';

const steps = ['Генерация ключей', 'Загрузка файла', 'Операции'];

const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Lab4 = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [crypto] = useState(new McElieceCrypto());
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState({ public: false, private: false });

  useEffect(() => {
    if (copied.public || copied.private) {
      const timer = setTimeout(() => setCopied({ public: false, private: false }), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const generateKeys = () => {
    setIsGenerating(true);
    setError('');

    setTimeout(() => {
      try {
        const keys = crypto.generateKeys();

        const publicKeyStr = JSON.stringify({
          G1: crypto.serializeMatrix(keys.publicKey.G1),
          t: keys.publicKey.t,
          n: keys.publicKey.n,
          k: keys.publicKey.k
        }, null, 2);

        const privateKeyStr = JSON.stringify({
          S: crypto.serializeMatrix(keys.privateKey.S),
          G: crypto.serializeMatrix(keys.privateKey.G),
          P: crypto.serializeMatrix(keys.privateKey.P),
          H: crypto.serializeMatrix(keys.privateKey.H)
        }, null, 2);

        setPublicKey(publicKeyStr);
        setPrivateKey(privateKeyStr);
        setError('');
      } catch (err) {
        setError(`Ошибка генерации ключей: ${err.message}`);
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setResult(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleNext = () => {
    setError('');

    if (activeStep === 0 && (!publicKey || !privateKey)) {
      setError('Пожалуйста, сгенерируйте ключи');
      return;
    }

    if (activeStep === 1 && !file) {
      setError('Пожалуйста, загрузите файл');
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleEncrypt = async () => {
    try {
      const publicKeyObj = JSON.parse(publicKey);
      publicKeyObj.G1 = crypto.deserializeMatrix(publicKeyObj.G1, crypto.k, crypto.n);

      const encryptedBlob = await crypto.encryptFile(file, publicKeyObj);
      setResult(encryptedBlob);
      setError('');
    } catch (err) {
      setError(`Ошибка шифрования: ${err.message}`);
    }
  };

  const handleDecrypt = async () => {
    try {
      const privateKeyObj = JSON.parse(privateKey);
      privateKeyObj.S = crypto.deserializeMatrix(privateKeyObj.S, crypto.k, crypto.k);
      privateKeyObj.G = crypto.deserializeMatrix(privateKeyObj.G, crypto.k, crypto.n);
      privateKeyObj.P = crypto.deserializeMatrix(privateKeyObj.P, crypto.n, crypto.n);
      privateKeyObj.H = crypto.deserializeMatrix(privateKeyObj.H, crypto.n - crypto.k, crypto.n);

      const decryptedBlob = await crypto.decryptFile(file, privateKeyObj);
      setResult(decryptedBlob);
      setError('');
    } catch (err) {
      setError(`Ошибка дешифрования: ${err.message}`);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const extension = file.name.includes('.enc.') ? 'dec.txt' : 'enc.txt';
    const fileName = `${file.name.replace(/\.[^/.]+$/, '')}.${extension}`;

    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(106,90,205,0.2) 0%, transparent 70%)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
            zIndex: 0
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
            <Code sx={{ mr: 1, verticalAlign: 'middle', color: '#4fc3f7' }} />
            Криптосистема Мак-Элиса
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4, background: 'transparent' }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    icon: (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: activeStep >= index ? '#4fc3f7' : 'rgba(255,255,255,0.2)',
                          color: activeStep >= index ? 'white' : '#fff'
                        }}
                      >
                        {index + 1}
                      </Box>
                    )
                  }}
                    sx={{
                        '& .MuiStepLabel-label': {
                          color: 'white !important',
                        },
                        '& .Mui-active': {
                          color: 'white !important',
                        },
                      }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <AnimatePresence mode="wait">
            <MotionBox
              key={activeStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              sx={{ mb: 3 }}
            >
              {activeStep === 0 && (
                <Box>
                  <MotionButton
                    variant="contained"
                    startIcon={isGenerating ? <Refresh /> : <Refresh />}
                    onClick={generateKeys}
                    disabled={isGenerating}
                    sx={{
                      mb: 3,
                      background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1e88e5, #00bcd4)',
                        transform: 'scale(1.03)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGenerating ? 'Генерация ключей...' : 'Сгенерировать ключи'}
                  </MotionButton>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <MotionCard
                        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                        sx={{
                          background: 'rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color='white'>
                              <VpnKey sx={{ mr: 1, color: '#4fc3f7', position: 'relative', top: '5px' }} />
                              Открытый ключ (G1, t)
                            </Typography>
                            <IconButton
                              onClick={() => copyToClipboard(publicKey, 'public')}
                              size="small"
                              sx={{ color: copied.public ? '#66bb6a' : '#4fc3f7', position: 'relative', top: '2px' }}
                            >
                              {copied.public ? <CheckCircle /> : <ContentCopy />}
                            </IconButton>
                          </Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            value={publicKey}
                            InputProps={{
                              readOnly: true,
                              sx: {
                                color: 'white',
                                '& .MuiInputBase-input': {
                                  color: 'white',
                                  fontFamily: 'monospace'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.3)'
                                }
                              }
                            }}
                            placeholder="Открытый ключ будет сгенерирован..."
                          />
                        </CardContent>
                      </MotionCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <MotionCard
                        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                        sx={{
                          background: 'rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color='white'>
                              <Lock sx={{ mr: 1, color: '#ff7043', position: 'relative', top: '5px' }} />
                              Закрытый ключ (S, G, P, H)
                            </Typography>
                            <IconButton
                              onClick={() => copyToClipboard(privateKey, 'private')}
                              size="small"
                              sx={{ color: copied.private ? '#66bb6a' : '#ff7043',position: 'relative', top: '2px' }}
                            >
                              {copied.private ? <CheckCircle /> : <ContentCopy />}
                            </IconButton>
                          </Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            value={privateKey}
                            InputProps={{
                              readOnly: true,
                              sx: {
                                color: 'white',
                                '& .MuiInputBase-input': {
                                  color: 'white',
                                  fontFamily: 'monospace'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.3)'
                                }
                              }
                            }}
                            placeholder="Закрытый ключ будет сгенерирован..."
                          />
                        </CardContent>
                      </MotionCard>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4fc3f7' }}>
                      Принцип работы системы Мак-Элиса:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>1. Генерация ключей:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }} paragraph>
                      • G - порождающая матрица кода Хэмминга (4×7)<br/>
                      • S - случайная невырожденная матрица (4×4)<br/>
                      • P - случайная перестановочная матрица (7×7)<br/>
                      • G1 = S·G·P - открытый ключ<br/>
                      • (S, G, P) - закрытый ключ
                    </Typography>

                    <Typography variant="body2" paragraph>
                      <strong>2. Шифрование:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }} paragraph>
                      • C = M·G1 + Z, где Z - вектор с 1 ошибкой
                    </Typography>

                    <Typography variant="body2" paragraph>
                      <strong>3. Дешифрование:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>
                      • C1 = C·P⁻¹<br/>
                      • Декодирование C1 с исправлением ошибки<br/>
                      • M = M1·S⁻¹
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Загрузка файла для шифрования/дешифрования
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <MotionButton
                      variant="contained"
                      component="label"
                      startIcon={<Upload />}
                      sx={{
                        mr: 2,
                        background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1e88e5, #00bcd4)'
                        }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Выбрать файл
                      <input
                        id="file-input"
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        hidden
                      />
                    </MotionButton>

                    {file && (
                      <MotionButton
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleFileRemove}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Удалить файл
                      </MotionButton>
                    )}
                  </Box>

                  {file && (
                    <MotionCard
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      sx={{
                        background: 'rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px'
                      }}
                    >
                      <CardContent>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Upload sx={{ color: '#4fc3f7' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={`Размер: ${formatFileSize(file.size)} | Тип: ${file.type || 'text/plain'}`}
                              primaryTypographyProps={{ style: { color: 'white' } }}
                              secondaryTypographyProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </MotionCard>
                  )}
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Криптографические операции
                  </Typography>

                  {file && (
                    <Alert severity="info" sx={{ mb: 2, background: 'rgba(33,150,243,0.2)', color: 'white', border: '1px solid rgba(33,150,243,0.4)' }}>
                      Выбран файл: {file.name}
                    </Alert>
                  )}

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <MotionButton
                        variant="contained"
                        fullWidth
                        startIcon={<Lock />}
                        onClick={handleEncrypt}
                        disabled={!file}
                        sx={{
                          background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                          color: 'white',
                          '&:disabled': { background: 'rgba(255,255,255,0.1)' }
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Зашифровать
                      </MotionButton>
                    </Grid>
                    <Grid item xs={6}>
                      <MotionButton
                        variant="outlined"
                        fullWidth
                        startIcon={<LockOpen />}
                        onClick={handleDecrypt}
                        disabled={!file}
                        sx={{
                          color: '#ff7043',
                          borderColor: '#ff7043',
                          '&:disabled': { borderColor: 'rgba(255,255,255,0.3)' }
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Расшифровать
                      </MotionButton>
                    </Grid>
                  </Grid>


                  <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

                  {result && (
                    <>
                      <Alert severity="success" sx={{ mb: 2, background: 'rgba(76,175,80,0.2)', color: 'white', border: '1px solid rgba(76,175,80,0.4)' }}>
                        Операция выполнена успешно!
                      </Alert>

                      <MotionButton
                        variant="contained"
                        fullWidth
                        startIcon={<Download />}
                        onClick={handleDownload}
                        sx={{
                          mb: 2,
                          background: 'linear-gradient(45deg, #009688, #00bcd4)',
                          color: 'white'
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Скачать результат
                      </MotionButton>

                      <MotionButton
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          setFile(null);
                          setResult(null);
                          setActiveStep(1);
                        }}
                        sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Выбрать другой файл
                      </MotionButton>
                    </>
                  )}
                </Box>
              )}
            </MotionBox>
          </AnimatePresence>

          {error && (
            <Alert
              severity="error"
              icon={<ErrorOutline />}
              sx={{
                mb: 2,
                background: 'rgba(244,67,54,0.2)',
                color: 'white',
                border: '1px solid rgba(244,67,54,0.4)'
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <MotionButton
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:disabled': { color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.2)' }
              }}
              whileHover={{ scale: activeStep === 0 ? 1 : 1.05 }}
              whileTap={{ scale: activeStep === 0 ? 1 : 0.98 }}
            >
              Назад
            </MotionButton>

            {activeStep < steps.length - 1 && (
              <MotionButton
                variant="contained"
                onClick={handleNext}
                sx={{
                  background: 'linear-gradient(45deg, #5c6bc0, #3f51b5)',
                  color: 'white'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Далее
              </MotionButton>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Lab4;
