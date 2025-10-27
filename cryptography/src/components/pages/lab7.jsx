import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Fade,
  Slide,
  Zoom,
  keyframes
} from '@mui/material';
import EG from '../../utils/eg';
import { styled } from '@mui/material/styles';
import EarthLoader from '../features/EarthLoader';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GradientCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 6s ease infinite`,
  color: 'white',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
}));

const AnimatedButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: '25px',
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 15px rgba(255,107,107,0.3)',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
    animation: 'none',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255,107,107,0.4)',
  },
  '&:disabled': {
    background: '#cccccc',
    animation: 'none',
  }
}));

const SecondaryButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
  border: 0,
  borderRadius: '25px',
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 15px rgba(78,205,196,0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #44A08D 30%, #4ECDC4 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(78,205,196,0.4)',
  },
}));

const GlassCard = styled(Card)(() => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const FloatingIcon = styled(Box)(() => ({
  animation: `${float} 3s ease-in-out infinite`,
  fontSize: '4rem',
  textAlign: 'center',
  marginBottom: '1rem',
}));

const CryptoLoader = ({ loading, message }) => {
  if (!loading) return null;

  return (
    <EarthLoader loading={loading} message={message} />
  );
};

const Lab7 = () => {
  const [message, setMessage] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [ciphertext, setCiphertext] = useState({ C1: '', C2: '' });
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const eg = new EG();

  const showLoader = (message, duration = 5000) => {
    setLoadingMessage(message);
    setLoading(true);
    setTimeout(() => setLoading(false), duration);
  };

  const handleGenerateKeys = () => {
    try {
      setError('');
      showLoader('Генерируем криптографические ключи...');

      setTimeout(() => {
        const keys = eg.generateKeys();
        setPrivateKey(keys.privateKey);
        setPublicKey(keys.publicKey);
        setActiveStep(1);
      }, 1500);
    } catch (err) {
      setError(`Ошибка при генерации ключей: ${err.message}`);
    }
  };

  const handleEncrypt = () => {
    if (!message.trim()) {
      setError('Введите сообщение для шифрования');
      return;
    }
    if (!publicKey) {
      setError('Сначала сгенерируйте ключи');
      return;
    }

    try {
      setError('');
      showLoader('Преобразуем сообщение в точку на кривой...');

      setTimeout(() => {
        const encrypted = eg.encrypt(publicKey, message);
        setCiphertext(encrypted);
        setDecryptedMessage('');
        setActiveStep(2);
      }, 1500);
    } catch (err) {
      setError(`Ошибка при шифровании: ${err.message}`);
    }
  };

  const handleDecrypt = () => {
    if (!ciphertext.C1 || !ciphertext.C2) {
      setError('Сначала зашифруйте сообщение');
      return;
    }
    if (!privateKey) {
      setError('Отсутствует приватный ключ');
      return;
    }

    try {
      setError('');
      showLoader('Выполняем обратное преобразование...');
        const decrypted = eg.decrypt(privateKey, ciphertext);
        console.log(decrypted);
        setDecryptedMessage(decrypted);
        setActiveStep(3);

    } catch (err) {
      setTimeout(() => {
        setDecryptedMessage("Точка не лежит на кривой");
      }, 1000);
      setError(`Ошибка при дешифровании: ${err.message}`);
    }
  };

  const handleClear = () => {
    setMessage('');
    setPrivateKey('');
    setPublicKey('');
    setCiphertext({ C1: '', C2: '' });
    setDecryptedMessage('');
    setError('');
    setActiveStep(0);
  };

  const handleC1Change = (event) => {
    setCiphertext(prev => ({ ...prev, C1: event.target.value }));
  };

  const handleC2Change = (event) => {
    setCiphertext(prev => ({ ...prev, C2: event.target.value }));
  };

  const StepIndicator = ({ step, current, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: step <= current ?
            'linear-gradient(45deg, #FF6B6B, #FF8E53)' :
            'rgba(255,255,255,0.2)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          marginRight: 2,
          boxShadow: step <= current ? '0 4px 15px rgba(255,107,107,0.4)' : 'none',
        }}
      >
        {step}
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: step <= current ? 'white' : 'rgba(255,255,255,0.7)',
          fontWeight: step <= current ? 'bold' : 'normal'
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
      }}
    >
      <CryptoLoader loading={loading} message={loadingMessage} />

      <Container maxWidth="lg">
        <Slide direction="down" in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <FloatingIcon>🔐</FloatingIcon>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 2
              }}
            >
              Схема Эль-Гамаля
            </Typography>
          </Box>
        </Slide>

        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              sx={{
                mb: 4,
                borderRadius: '15px',
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <GradientCard>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
                  Шаги процесса
                </Typography>

                <StepIndicator step={1} current={activeStep} title="Генерация ключей" />
                <StepIndicator step={2} current={activeStep} title="Шифрование сообщения" />
                <StepIndicator step={3} current={activeStep} title="Дешифрование" />
              </CardContent>
            </GradientCard>
          </Grid>

          <Grid item xs={12} md={8}>
            <GlassCard>
              <CardContent sx={{ p: 4 }}>
                <Fade in={activeStep >= 0} timeout={500}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                      Генерация ключей
                    </Typography>
                    <AnimatedButton
                      onClick={handleGenerateKeys}
                      fullWidth
                      disabled={!!privateKey}
                    >
                      {privateKey ? 'Ключи сгенерированы' : 'Сгенерировать ключи'}
                    </AnimatedButton>

                    {privateKey && (
                      <Fade in={!!privateKey}>
                        <Box sx={{ mt: 3 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Приватный ключ"
                                value={privateKey}
                                fullWidth
                                multiline
                                rows={2}
                                variant="outlined"
                                InputProps={{
                                  readOnly: true,
                                  sx: { borderRadius: '12px' }
                                }}
                                sx={{ mb: 2 }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Публичный ключ"
                                value={publicKey}
                                fullWidth
                                multiline
                                rows={2}
                                variant="outlined"
                                InputProps={{
                                  readOnly: true,
                                  sx: { borderRadius: '12px' }
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </Fade>


                <Fade in={activeStep >= 1} timeout={500}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                      Шифрование сообщения
                    </Typography>
                    <TextField
                      label="Введите сообщение для шифрования"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      sx={{ mb: 3 }}
                      InputProps={{
                        sx: { borderRadius: '12px' }
                      }}
                    />

                    <SecondaryButton
                      onClick={handleEncrypt}
                      fullWidth
                      disabled={!publicKey || !message}
                    >
                      Зашифровать сообщение
                    </SecondaryButton>

                    {(ciphertext.C1 || ciphertext.C2) && (
                      <Fade in={!!ciphertext.C1}>
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 'bold' }}>
                            Зашифрованное сообщение:
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF6B6B' }}>
                                C1:
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />
                            </Box>
                            <TextField
                              value={ciphertext.C1}
                              onChange={handleC1Change}
                              fullWidth
                              multiline
                              rows={2}
                              variant="outlined"
                              InputProps={{
                                sx: {
                                  borderRadius: '12px',
                                  border: '2px solid #FF6B6B',
                                  '&:focus': {
                                    borderColor: '#FF8E53'
                                  }
                                }
                              }}
                              placeholder="Введите или измените значение C1..."
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4ECDC4' }}>
                                C2:
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />


                            </Box>
                            <TextField
                              value={ciphertext.C2}
                              onChange={handleC2Change}
                              fullWidth
                              multiline
                              rows={2}
                              variant="outlined"
                              InputProps={{
                                sx: {
                                  borderRadius: '12px',
                                  border: '2px solid #4ECDC4',
                                  '&:focus': {
                                    borderColor: '#44A08D'
                                  }
                                }
                              }}
                              placeholder="Введите или измените значение C2..."
                            />
                          </Box>
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </Fade>


                <Fade in={activeStep >= 2} timeout={500}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                      Дешифрование
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <SecondaryButton
                        onClick={handleDecrypt}
                        disabled={!ciphertext.C1 || !ciphertext.C2 || !privateKey}
                        sx={{ flex: 1 }}
                      >
                        Дешифровать
                      </SecondaryButton>

                      <Button
                        onClick={handleClear}
                        variant="outlined"
                        sx={{
                          borderRadius: '25px',
                          borderColor: '#FF6B6B',
                          color: '#FF6B6B',
                          '&:hover': {
                            borderColor: '#FF8E53',
                            background: 'rgba(255,107,107,0.04)'
                          }
                        }}
                      >
                        Очистить всё
                      </Button>
                    </Box>

                    {decryptedMessage && (
                      <Fade in={!!decryptedMessage}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 'bold' }}>
                            Результат дешифрования:
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 3,
                              borderRadius: '15px',
                              background: message === decryptedMessage
                                ? 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
                                : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                              color: 'white'
                            }}
                          >
                            <Typography variant="body1" fontFamily="monospace" sx={{ fontWeight: 'bold' }}>
                              {decryptedMessage}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  background: 'white',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1
                                }}
                              >
                                <Typography variant="body2" sx={{
                                  color: message === decryptedMessage ? '#4ECDC4' : '#FF6B6B',
                                  fontWeight: 'bold',
                                  fontSize: '12px'
                                }}>
                                  {message === decryptedMessage ? '✓' : '!'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {message === decryptedMessage
                                  ? 'Сообщение успешно расшифровано'
                                  : 'Результат отличается от исходного сообщения'
                                }
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </Fade>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Lab7;
