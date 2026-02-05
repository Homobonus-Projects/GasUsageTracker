import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'readings.json');

console.log(`[Server] Starting...`);
console.log(`[Server] Data Directory: ${DATA_DIR}`);
console.log(`[Server] Data File: ${DATA_FILE}`);

// Upewnij się, że katalog na dane istnieje
try {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('[Server] Creating data directory...');
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('[Server] Data directory created.');
  } else {
    console.log('[Server] Data directory exists.');
  }
} catch (err) {
  console.error('[Server] CRITICAL: Failed to create data directory:', err);
}

// Upewnij się, że plik bazy danych istnieje
try {
  if (!fs.existsSync(DATA_FILE)) {
    console.log('[Server] Creating data file...');
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    console.log('[Server] Data file created.');
  }
} catch (err) {
  console.error('[Server] CRITICAL: Failed to create data file:', err);
}

// Zwiększamy limit payloadu, bo przesyłamy zdjęcia w base64
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// API: Pobierz odczyty
app.get('/api/readings', (req, res) => {
  console.log('[API] GET /api/readings');
  try {
    // Re-check if file exists (in case it was deleted manually)
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('[API] Error reading data:', err);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API: Zapisz odczyty
app.post('/api/readings', (req, res) => {
  console.log('[API] POST /api/readings');
  try {
    const newReadings = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(newReadings, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error saving data:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Obsługa routingu SPA (React Router) - zawsze zwracaj index.html dla nieznanych ścieżek
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});