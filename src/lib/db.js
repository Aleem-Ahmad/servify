import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/lib/data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    return [];
  }
};

const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${collection}:`, error);
    return false;
  }
};

export const db = {
  collection: (name) => ({
    find: async (query = {}) => {
      const data = readData(name);
      return data.filter(item => {
        return Object.entries(query).every(([key, value]) => item[key] === value);
      });
    },
    findOne: async (query = {}) => {
      const data = readData(name);
      return data.find(item => {
        return Object.entries(query).every(([key, value]) => item[key] === value);
      });
    },
    insertOne: async (doc) => {
      const data = readData(name);
      const newDoc = { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        createdAt: new Date().toISOString(),
        ...doc 
      };
      data.push(newDoc);
      writeData(name, data);
      return newDoc;
    },
    update: async (query, update) => {
      let data = readData(name);
      let updatedCount = 0;
      data = data.map(item => {
        const matches = Object.entries(query).every(([key, value]) => item[key] === value);
        if (matches) {
          updatedCount++;
          return { ...item, ...update, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      writeData(name, data);
      return { updatedCount };
    },
    delete: async (query) => {
      let data = readData(name);
      const initialLength = data.length;
      data = data.filter(item => {
        return !Object.entries(query).every(([key, value]) => item[key] === value);
      });
      writeData(name, data);
      return { deletedCount: initialLength - data.length };
    }
  })
};
