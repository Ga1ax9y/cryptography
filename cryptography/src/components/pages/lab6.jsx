import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Alert,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Chip,
    IconButton,
    Tooltip,
    Fade,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    ContentCopy,
    CheckCircle,
    Error,
    VpnKey,
    Fingerprint,
    VerifiedUser,
    ExpandMore,
    Shield,
    Lock,
    LockOpen
} from '@mui/icons-material';
import { generateKeyPair, sign, verify } from '../../utils/Gost3410';
import { gost3411 } from '../../utils/Gost3411';
export default function DigitalSignatureApp() {
    const [activeStep, setActiveStep] = useState(0);
    const [message, setMessage] = useState('');
    const [hash, setHash] = useState('');
    const [keys, setKeys] = useState(null);
    const [signature, setSignature] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);
    const [privateKeyInput, setPrivateKeyInput] = useState('');
    const [publicKeyInput, setPublicKeyInput] = useState({ x: '', y: '' });
    const [copiedField, setCopiedField] = useState('');

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setMessage('');
        setHash('');
        setKeys(null);
        setSignature(null);
        setVerificationResult(null);
        setPrivateKeyInput('');
        setPublicKeyInput({ x: '', y: '' });
    };

    const generateHash = () => {
        if (message.trim()) {
            const hashResult = gost3411(message, 512);
            setHash(hashResult);
        }
    };

    const generateKeys = () => {
        const keyPair = generateKeyPair();
        setKeys(keyPair);
        setPrivateKeyInput(keyPair.privateKey);
        setPublicKeyInput(keyPair.publicKey);
    };

    const createSignature = () => {
        if (!message.trim() || !privateKeyInput.trim()) {
            alert('Введите сообщение и приватный ключ');
            return;
        }

        try {
            const sig = sign(message, privateKeyInput);
            setSignature(sig);
            setVerificationResult(null);
        } catch (error) {
            alert('Ошибка при создании подписи: ' + error.message);
        }
    };

    const verifySignature = () => {
        if (!message.trim() || !signature || !publicKeyInput.x || !publicKeyInput.y) {
            alert('Введите сообщение, подпись и публичный ключ');
            return;
        }

        try {
            const isValid = verify(message, signature, publicKeyInput);
            setVerificationResult(isValid);
        } catch (error) {
            alert('Ошибка при проверке подписи: ' + error.message);
        }
    };

    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(''), 2000);
        });
    };

    const formatKey = (key) => {
        if (!key) return '';
        return key.match(/.{1,64}/g)?.join('\n') || key;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: 3, mb: 3, mt: 10 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    <Step>
                        <StepLabel
                            StepIconComponent={VpnKey}
                            sx={{ '& .MuiStepLabel-label': { fontWeight: 'bold' } }}
                        >
                            Генерация ключевой пары
                        </StepLabel>
                        <StepContent>
                            <Typography variant="body1" paragraph>
                                Сгенерируйте пару ключей: приватный для создания подписи и публичный для проверки.
                            </Typography>

                            <Box mb={3}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={generateKeys}
                                    size="medium"
                                >
                                    Сгенерировать ключи
                                </Button>
                            </Box>

                            {keys && (
                                <Fade in={true}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <Lock sx={{ mr: 1, color: 'error.main' }} />
                                                        <Typography variant="h6">Приватный ключ</Typography>
                                                        <Tooltip title={copiedField === 'private' ? "Скопировано!" : "Копировать"}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => copyToClipboard(keys.privateKey, 'private')}
                                                                sx={{ ml: 'auto' }}
                                                            >
                                                                <ContentCopy fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                    <TextField
                                                        value={formatKey(keys.privateKey)}
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        variant="outlined"
                                                        size="small"
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined" sx={{ borderColor: 'success.main' }}>
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <LockOpen sx={{ mr: 1, color: 'success.main' }} />
                                                        <Typography variant="h6">Публичный ключ</Typography>
                                                    </Box>
                                                    <TextField
                                                        label="X координата"
                                                        value={formatKey(keys.publicKey.x)}
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 1 }}
                                                        InputProps={{
                                                            readOnly: true,
                                                            endAdornment: (
                                                                <Tooltip title={copiedField === 'pubX' ? "Скопировано!" : "Копировать"}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => copyToClipboard(keys.publicKey.x, 'pubX')}
                                                                    >
                                                                        <ContentCopy fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            ),
                                                        }}
                                                    />
                                                    <TextField
                                                        label="Y координата"
                                                        value={formatKey(keys.publicKey.y)}
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        variant="outlined"
                                                        size="small"
                                                        InputProps={{
                                                            readOnly: true,
                                                            endAdornment: (
                                                                <Tooltip title={copiedField === 'pubY' ? "Скопировано!" : "Копировать"}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => copyToClipboard(keys.publicKey.y, 'pubY')}
                                                                    >
                                                                        <ContentCopy fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            ),
                                                        }}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </Fade>
                            )}

                            <Box sx={{ mb: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ mt: 1, mr: 1 }}
                                    disabled={!keys}
                                    color='success'
                                >
                                    Перейти к подписи
                                </Button>
                            </Box>
                        </StepContent>
                    </Step>

                    <Step>
                        <StepLabel
                            StepIconComponent={Fingerprint}
                            sx={{ '& .MuiStepLabel-label': { fontWeight: 'bold' } }}
                        >
                            Создание цифровой подписи
                        </StepLabel>
                        <StepContent>
                            <Typography variant="body1" paragraph>
                                Введите сообщение и создайте цифровую подпись с помощью приватного ключа.
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Сообщение для подписи"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                        placeholder="Введите текст сообщения, которое нужно подписать..."
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        onClick={generateHash}
                                        color='success'
                                        sx={{ mr: 2 }}
                                    >
                                        Вычислить хеш
                                    </Button>
                                    {hash && (
                                        <Box mt={1}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Хеш (GOST 34.11-512):
                                            </Typography>
                                            <Paper variant="outlined" sx={{ p: 1, backgroundColor: 'grey.50' }}>
                                                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                                                    {hash}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    )}
                                </Grid>

                                <Grid item xs={12}>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography>Настройки подписи</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TextField
                                                label="Приватный ключ"
                                                value={privateKeyInput}
                                                onChange={(e) => setPrivateKeyInput(e.target.value)}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                variant="outlined"
                                                placeholder="Введите приватный ключ в hex-формате или сгенерируйте новый на предыдущем шаге"
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color='success'
                                        onClick={createSignature}
                                        size="large"
                                        disabled={!message || !privateKeyInput}
                                    >
                                        Создать цифровую подпись
                                    </Button>
                                </Grid>

                                {signature && (
                                    <Grid item xs={12} sx={{ width: '100%' }}>
                                        <Fade in={true}>
                                            <Card variant="outlined" >
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom color="success">
                                                        Цифровая подпись создана
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={6}>
                                                            <TextField
                                                                label="Компонент R"
                                                                value={formatKey(signature.r)}
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                variant="outlined"
                                                                size="small"
                                                                InputProps={{
                                                                    readOnly: true,
                                                                    endAdornment: (
                                                                        <Tooltip title={copiedField === 'r' ? "Скопировано!" : "Копировать"}>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => copyToClipboard(signature.r, 'r')}
                                                                            >
                                                                                <ContentCopy fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    ),
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <TextField
                                                                label="Компонент S"
                                                                value={formatKey(signature.s)}
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                variant="outlined"
                                                                size="small"
                                                                InputProps={{
                                                                    readOnly: true,
                                                                    endAdornment: (
                                                                        <Tooltip title={copiedField === 's' ? "Скопировано!" : "Копировать"}>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => copyToClipboard(signature.s, 's')}
                                                                            >
                                                                                <ContentCopy fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    ),
                                                                }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    </Grid>
                                )}
                            </Grid>

                            <Box sx={{ mb: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ mt: 1, mr: 1 }}
                                    disabled={!signature}
                                    color='success'
                                >
                                    Перейти к проверке
                                </Button>
                                <Button
                                    onClick={handleBack}
                                    sx={{ mt: 1, mr: 1 }}
                                    color='success'
                                >
                                    Назад
                                </Button>
                            </Box>
                        </StepContent>
                    </Step>

                    <Step>
                        <StepLabel
                            StepIconComponent={VerifiedUser}
                            sx={{ '& .MuiStepLabel-label': { fontWeight: 'bold' } }}
                        >
                            Проверка цифровой подписи
                        </StepLabel>
                        <StepContent>
                            <Typography variant="body1" paragraph>
                                Проверьте подлинность цифровой подписи с помощью публичного ключа.
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Сообщение для проверки"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography>Публичный ключ для проверки</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="X координата публичного ключа"
                                                        value={publicKeyInput.x}
                                                        onChange={(e) => setPublicKeyInput({
                                                            ...publicKeyInput,
                                                            x: e.target.value
                                                        })}
                                                        fullWidth
                                                        multiline
                                                        rows={2}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Y координата публичного ключа"
                                                        value={publicKeyInput.y}
                                                        onChange={(e) => setPublicKeyInput({
                                                            ...publicKeyInput,
                                                            y: e.target.value
                                                        })}
                                                        fullWidth
                                                        multiline
                                                        rows={2}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>

                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>


                                {signature && (
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Подпись для проверки:
                                            </Typography>
                                            <Grid container spacing={1}>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="body2" fontFamily="monospace">
                                                        R: {signature.r.substring(0, 32)}...
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="body2" fontFamily="monospace">
                                                        S: {signature.s.substring(0, 32)}...
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={verifySignature}
                                        size="large"
                                        disabled={!message || !signature || !publicKeyInput.x || !publicKeyInput.y}
                                    >
                                        Проверить цифровую подпись
                                    </Button>
                                </Grid>

                                {verificationResult !== null && (
                                    <Grid item xs={12}>
                                        <Fade in={true}>
                                            <Alert
                                                severity={verificationResult ? "success" : "error"}
                                                variant="filled"
                                                icon={verificationResult ? <CheckCircle /> : <Error />}
                                            >
                                                <Typography variant="h6">
                                                    {verificationResult
                                                        ? "Подпись верна!"
                                                        : "Подпись недействительна!"}
                                                </Typography>
                                                <Typography>
                                                    {verificationResult
                                                        ? "Цифровая подпись успешно подтверждена. Сообщение подлинное и не было изменено."
                                                        : "Цифровая подпись не подтверждена. Сообщение могло быть изменено или ключи неверны."}
                                                </Typography>
                                            </Alert>
                                        </Fade>
                                    </Grid>
                                )}
                            </Grid>

                            <Box sx={{ mb: 2, mt: 3 }}>
                                <Button
                                    onClick={handleBack}
                                    sx={{ mt: 1, mr: 1 }}
                                    color='success'
                                >
                                    Назад
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    sx={{ mt: 1 }}
                                    color='success'
                                >
                                    Начать заново
                                </Button>
                            </Box>
                        </StepContent>
                    </Step>
                </Stepper>
            </Paper>
        </Container>
    );
}
