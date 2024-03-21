/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const readFiles = () => {
  const directoryPath = '.github/workflows';
  const files = fs.readdirSync(directoryPath);
  const linesFinal = {};

  files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    const fileName = path.basename(file, path.extname(file));
    const fileContentBuffer = fs.readFileSync(filePath, 'utf8');
    const fileContentString = fileContentBuffer.toString('utf8');
    const lines = fileContentString.split(/\r?\n/)
      .filter(line => line.trim() !== '' && (line.includes('&& echo') || line.includes('${{')))
      .map(line => {
        let extractedValues = [];

        if (line.includes('&& echo')) {
          const endIndex = line.indexOf('=');
          if (endIndex !== -1) {
            const value = line.substring(line.indexOf('&& echo') + 8, endIndex).trim();
            extractedValues.push(value);
          }
        }

        if (line.includes('${{')) {
          const matches = line.match(/\${{\s*([^}\s]+)\s*}}/g);

          if (matches) {
            matches.forEach(match => {
              const startIndex = line.indexOf(match) + match.indexOf('.') + 1;
              const endIndex = line.indexOf('}}', startIndex);
              if (startIndex !== -1 && endIndex !== -1) {
                const value = line.substring(startIndex, endIndex).trim();
                extractedValues.push(value);
              }
            });
          }
        }

        return extractedValues;
      }).flat();

    linesFinal[fileName] = lines;
  });

  return linesFinal;
};

describe('Testing .env file vars', () => {
  const requiredEnvVariables = readFiles();

  test('All vars exists in file', () => {
    if (process.env.WORKSPACE != 'local') {
      let allMissingVariables = [];

      Object.keys(requiredEnvVariables).forEach(fileName => {
        const variablesArray = requiredEnvVariables[fileName];
        const missingVariables = variablesArray.filter(variable => !(variable in process.env));

        if (missingVariables.length > 0) {
          console.log(`Variables missing in file ${fileName}: ${missingVariables.join(', ')}`);
          allMissingVariables = allMissingVariables.concat(missingVariables);
        }
      });

      expect(allMissingVariables.length).toBe(0);
    }
  });

  test('Vars types match', () => {
    if (process.env.WORKSPACE != 'local') {
      Object.keys(requiredEnvVariables).forEach(fileName => {
        const variablesArray = requiredEnvVariables[fileName];

        variablesArray.forEach(variable => {
          const element = process.env[variable];

          if (element == undefined || element.length == 0) {
            console.log(`Var ${variable} in file ${fileName} has zero length.`);
          }

          expect(element).not.toBeNull();
          expect(element).toBeDefined();
          expect(element).not.toMatch(/#/);
          expect(element.length).toBeGreaterThan(0);
        });
      });
    }
  });
});