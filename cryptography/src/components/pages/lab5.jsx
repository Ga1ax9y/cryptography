import React, { useState } from 'react';
import {
    Container,
    TextField,
    Select,
    MenuItem,
    Button,
    Typography,
    Paper,
    Box,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Chip,
    Card,
    CardContent,
    Fade,
    Zoom
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { gost3411 } from '../../utils/Gost3411';
import { sha1 } from '../../utils/Sha1';

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionBox = motion(Box);

const Lab5 = () => {
    const [input, setInput] = useState('');
    const [algorithm, setAlgorithm] = useState('gost512');
    const [hash, setHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);

    const calculateHash = async () => {

        setLoading(true);
        setError('');

        try {
            let result;
            switch (algorithm) {
                case 'gost256':
                    result = gost3411(input, 256);
                    break;
                case 'gost512':
                    result = gost3411(input, 512);
                    break;
                case 'sha1':
                    result = sha1(input);
                    break;
                default:
                    result = '';
            }
            setHash(result);

            setHistory(prev => [
                {
                    id: Date.now(),
                    algorithm,
                    input: input.length > 50 ? input.substring(0, 50) + '...' : input,
                    hash: result.substring(0, 32) + '...',
                    timestamp: new Date().toLocaleTimeString()
                },
                ...prev.slice(0, 4)
            ]);
        } catch (err) {
            setError('Ошибка при вычислении хеша: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAlgorithmChange = (event) => {
        setAlgorithm(event.target.value);
    };

    const handleInputChange = (event) => {
        setInput(event.target.value);
        setError('');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const hashVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 },
        loading: { scale: 0.98 }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <MotionPaper
                elevation={3}
                sx={{ p: 4, position: 'relative', overflow: 'hidden' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >

                <MotionTypography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    align="center"
                    color="primary"
                    variants={itemVariants}
                    sx={{
                        background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        fontWeight: 'bold',
                        mb: 2
                    }}
                >
                    Контроль целостности сообщений
                </MotionTypography>

                <MotionTypography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                    align="center"
                    variants={itemVariants}
                >
                    Вычисление хеш-функций по алгоритмам ГОСТ 34.11 и SHA-1
                </MotionTypography>

                <MotionBox variants={itemVariants}>
                    <TextField
                        label="Введите сообщение"
                        multiline
                        rows={4}
                        value={input}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                        placeholder="Введите текст для вычисления хеш-функции..."
                        error={!!error}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }
                            }
                        }}
                    />
                </MotionBox>

                <MotionBox
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 3,
                        mb: 3
                    }}
                    variants={itemVariants}
                >
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="algorithm-select-label">Алгоритм хеширования</InputLabel>
                        <Select
                            labelId="algorithm-select-label"
                            value={algorithm}
                            onChange={handleAlgorithmChange}
                            label="Алгоритм хеширования"
                        >
                            <MenuItem value="gost512">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>ГОСТ 34.11-512</Typography>
                                    <Chip label="512 бит" size="small" color="primary" variant="outlined" />
                                </Box>
                            </MenuItem>
                            <MenuItem value="gost256">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>ГОСТ 34.11-256</Typography>
                                    <Chip label="256 бит" size="small" color="secondary" variant="outlined" />
                                </Box>
                            </MenuItem>
                            <MenuItem value="sha1">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>SHA-1</Typography>
                                    <Chip label="160 бит" size="small" color="warning" variant="outlined" />
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <MotionBox
                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <MotionButton
                            variants={buttonVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            animate={loading ? "loading" : "initial"}
                            variant="contained"
                            onClick={calculateHash}
                            disabled={loading}
                            size="large"
                            sx={{
                                minWidth: '200px',
                                height: '56px',
                                background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
                                fontSize: '1.1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={20} sx={{ color: 'white' }} />
                                    <span>Вычисление...</span>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>Вычислить хеш</span>
                                </Box>
                            )}
                        </MotionButton>
                    </MotionBox>
                </MotionBox>

                <AnimatePresence>
                    {error && (
                        <MotionBox
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        </MotionBox>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {hash && (
                        <MotionBox
                            variants={hashVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <MotionCard
                                sx={{
                                    mb: 3,
                                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                    border: '2px solid',
                                    borderColor: 'success.main',
                                    position: 'relative'
                                }}
                                whileHover={{
                                    scale: 1.01,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Результат вычисления хеш-функции
                                    </Typography>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            borderColor: '#e9ecef',
                                            wordBreak: 'break-all',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            maxHeight: '200px',
                                            overflow: 'auto',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigator.clipboard.writeText(hash)}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,1)' }}
                                    >
                                        {hash}
                                    </Paper>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Длина хеша: {hash.length / 2} байт ({hash.length * 4} бит)
                                    </Typography>
                                </CardContent>
                            </MotionCard>
                        </MotionBox>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {history.length > 0 && (
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                                История вычислений
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                                {history.map((item, index) => (
                                    <MotionCard
                                        key={item.id}
                                        sx={{ minWidth: 280, flexShrink: 0 }}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                <Chip
                                                    label={
                                                        item.algorithm === 'gost512' ? 'ГОСТ-512' :
                                                        item.algorithm === 'gost256' ? 'ГОСТ-256' : 'SHA-1'
                                                    }
                                                    size="small"
                                                    color={
                                                        item.algorithm === 'gost512' ? 'primary' :
                                                        item.algorithm === 'gost256' ? 'secondary' : 'warning'
                                                    }
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.timestamp}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                                                "{item.input}"
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                                {item.hash}
                                            </Typography>
                                        </CardContent>
                                    </MotionCard>
                                ))}
                            </Box>
                        </MotionBox>
                    )}
                </AnimatePresence>

                <MotionBox
                    sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}
                    variants={itemVariants}
                >
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Информация об алгоритмах
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <MotionCard
                            whileHover={{ y: -5 }}
                            sx={{ p: 2, textAlign: 'center' }}
                        >
                            <Typography variant="h6" color="primary">ГОСТ 34.11-512</Typography>
                            <Typography variant="body2">
                                Российский стандарт хеширования с длиной выхода 512 бит
                            </Typography>
                        </MotionCard>

                        <MotionCard
                            whileHover={{ y: -5 }}
                            sx={{ p: 2, textAlign: 'center' }}
                        >
                            <Typography variant="h6" color="secondary">ГОСТ 34.11-256</Typography>
                            <Typography variant="body2">
                                Российский стандарт хеширования с длиной выхода 256 бит
                            </Typography>
                        </MotionCard>

                        <MotionCard
                            whileHover={{ y: -5 }}
                            sx={{ p: 2, textAlign: 'center' }}
                        >
                            <Typography variant="h6" color="warning.main">SHA-1</Typography>
                            <Typography variant="body2">
                                Алгоритм хеширования с длиной выхода 160 бит
                            </Typography>
                        </MotionCard>
                    </Box>
                </MotionBox>

                <AnimatePresence>
                    {loading && (
                        <MotionBox
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, scaleX: 0 }}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #4caf50, #2196f3, #ff9800)',
                                transformOrigin: 'left'
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    )}
                </AnimatePresence>
            </MotionPaper>
        </Container>
    );
};

export default Lab5;
