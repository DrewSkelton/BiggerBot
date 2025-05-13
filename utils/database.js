const fs = require('fs');
const path = require('path');

const dataFile = "data/database.json";
const dataDir = "data"
let data = {};

function load(properties) {
    try {
        if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
        }
        
        if (fs.existsSync(this.dataFile)) {
            this.data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
            if (properties !== undefined) {
                let current = this.data
                for (property of properties) {
                    current = current[property]
                }
                return current;
            }
        }
        else {
            fs.writeFileSync(dataFile, '{}');
        }
        return this.data;

    } catch (error) {
        console.error('Error loading data:', error);
        return {};
    }
}

function save(properties, data) {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        if (properties !== undefined) {
            for (let i = 0; i < properties.length - 1; i++) {
                current = current[property];
            }
            current[properties.length - 1] = data;
        }

        else {
            this.data = data;
        }
        
        fs.writeFileSync(dataFile, JSON.stringify(this.data), 'utf8');
        return true;
    } catch (error) {
        console.log(this.data)
        console.error('Error saving data:', error);
        return false;
    }
}

module.exports = {
    data,
    load,
    save
}