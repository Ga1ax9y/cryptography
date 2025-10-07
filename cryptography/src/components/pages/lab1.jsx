import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert
} from '@mui/material';
import KeySetup from '../shared/KeySetup';
import FileUpload from '../shared/FileUpload';
import CryptoOperations from '../features/CryptoOperations';
import { GostCrypto } from '../../utils/GostCrypto';

const steps = ['Настройка ключа', 'Загрузка файла', 'Операции'];

function Lab1() {
  const [activeStep, setActiveStep] = useState(0);
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (activeStep === 0 && !key) {
      setError('Пожалуйста, установите ключ');
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
      const crypto = new GostCrypto(key);
      const encryptedBlob = await crypto.encryptFile(file);
      setResult(encryptedBlob);
      setError('');
    } catch (err) {
      setError(`Ошибка шифрования: ${err.message}`);
    }
  };

  const handleDecrypt = async () => {
    try {
      const crypto = new GostCrypto(key);
      const decryptedBlob = await crypto.decryptFile(file);
      setResult(decryptedBlob);
      setError('');
    } catch (err) {
      setError(`Ошибка дешифрования: ${err.message}`);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    let extension;

    if (file.name.includes('.enc.')) {
      extension = 'dec.txt';
    } else {
      extension = 'enc.txt';
    }

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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ГОСТ 28147-89 - Режим гаммирования
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel >{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {activeStep === 0 && (
            <KeySetup keyValue={key} onKeyChange={setKey} />
          )}
          {activeStep === 1 && (
            <FileUpload file={file} onFileChange={setFile} />
          )}
          {activeStep === 2 && (
            <CryptoOperations
              onEncrypt={handleEncrypt}
              onDecrypt={handleDecrypt}
              onDownload={handleDownload}
              result={result}
              file={file}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Назад
          </Button>

          {activeStep < steps.length - 1 && (
            <Button variant="contained" onClick={handleNext}>
              Далее
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Lab1;
