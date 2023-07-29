const express = require('express');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const cors = require('cors'); 
const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const mongoURI = 'mongodb://0.0.0.0:27017';
const dbName = 'eCommerce';
const collectionName = 'upload';
app.use(cors());
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db(dbName);

    const fileData = {
      name: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    };
    await db.collection(collectionName).insertOne(fileData);

    client.close();

    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/files', async (req, res) => {
  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db(dbName);

    const files = await db.collection(collectionName).find({}).toArray();

    client.close();

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
