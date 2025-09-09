import {
  Box,
  Button,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { Download } from '@mui/icons-material';

const CryptoOperations = ({ onEncrypt, onDecrypt, onDownload, result, file }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Криптографические операции
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={onEncrypt}
          disabled={!file}
        >
          Зашифровать
        </Button>
        <Button
          variant="outlined"
          onClick={onDecrypt}
          disabled={!file}
        >
          Расшифровать
        </Button>
      </Box>

      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Операция выполнена успешно!
        </Alert>
      )}

      {result && (
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={onDownload}
          fullWidth
        >
          Скачать результат
        </Button>
      )}
    </Paper>
  );
};

export default CryptoOperations;
