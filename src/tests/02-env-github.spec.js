require('dotenv').config();
const fs = require('fs');

const readEnvFile = () => {
  const fileContentBuffer = fs.readFileSync('.env-ci-sample', 'utf8');
  const fileContentString = fileContentBuffer.toString('utf8');
  const lines = fileContentString.split(/\r?\n/)
    .filter(line => line.trim() !== '' && !line.trim().startsWith('#'))
    .map(line => line.split('=')[0]);

  return lines;
};

describe('Testing GitHub .env file vars', () => {
  if (process.env.WORKSPACE != 'local') {
    const requiredEnvVariables = readEnvFile();

    test('All GitHub vars exists in file', () => {
      const missingVariables = requiredEnvVariables.filter(variable => !(variable in process.env));

      if (missingVariables.length > 0) {
        console.log(`This GitHub vars are missing: ${missingVariables.join(', ')}`);
      }

      expect(missingVariables.length).toBe(0);
    });

    test('GitHub vars types match', () => {
      requiredEnvVariables.filter(variable => {
        const element = process.env[variable];

        if (element == undefined || element.length == 0) {
          console.log(`Var ${variable} in GitHub has zero length.`);
        }
        
        expect(element).not.toBeNull();
        expect(element).toBeDefined();
        expect(element).not.toMatch(/#/);
        expect(element.length).toBeGreaterThan(0);
      });
    });
  } else {
    test('Workspace local does not have GitHub vars', () => { });
  }
});