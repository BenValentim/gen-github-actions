import fs from 'fs';
import path from 'path';

const basePath = `.github`;
const from = `${basePath}/models`;
const destiny = `${basePath}/workflows`;

const validateWorkspaces = (workspaces: { [key: string]: string }[]): boolean => {
  const allKeys = new Set<string>();

  for (const workspace of workspaces) {
    const keys = Object.keys(workspace);
    if (!keys.includes('<WORKSPACE>')) {
      return false;
    }

    for (const key of keys) {
      if (isValidParameter(key)) {
        allKeys.add(key);
      } else {
        return false;
      }
    }
  }

  for (const workspace of workspaces) {
    if (!Array.from(allKeys).every(key => Object.keys(workspace).includes(key))) {
      return false;
    }
  }

  return true;
}

const isValidParameter = (parameter: string): boolean => {
  return parameter.startsWith('<') && parameter.endsWith('>');
}

function processEnvFile(modifiedLines: string[], envFileName: string, envType: string): string[] {
  const envFileContent = fs.readFileSync(envFileName, 'utf-8');
  const envLines = envFileContent.split(/\r?\n/);

  let foundIndex = -1;

  modifiedLines.forEach((line, index) => {
    if (line.includes('rm .env')) {
      foundIndex = index;
    }

    if (foundIndex !== -1 && index === foundIndex + 2) {
      envLines.forEach(envLine => {
        if (envLine.includes('#')) {
          return;
        }

        const varPrefix = envLine.split('.');

        if (varPrefix.length > 1) {
          const varName = varPrefix[1].split('=')[0];
          modifiedLines.splice(index, 0, `          && echo ${varName}=\${{ ${varPrefix[0]}.${varName} }} >> .env-${envType}`);
        }
      });
      foundIndex = -1;
    }
  });

  return modifiedLines;
}

function fillLines(lines: string[], envType: string, values: any, useEnvSample: boolean, useCiSample: boolean): string[] {
  let modifiedLines = lines.map((line: string) => {
    let modLine = line;

    Object.keys(values).forEach((key: string) => {
      modLine = modLine.replace(new RegExp(`${key}`, 'g'), values[key]);
    });

    return modLine
  });

  if (useCiSample) {
    modifiedLines = processEnvFile(modifiedLines, '.env-ci-sample', envType);
  }

  if (useEnvSample) {
    modifiedLines = processEnvFile(modifiedLines, '.env-sample', envType);
  }

  return modifiedLines;
}

const genActions = {
  generate: (params: { [key: string]: string }[], useEnvSample: boolean, useCiSample: boolean) => {
    console.log('Starting generate...')
    try {
      if (!validateWorkspaces(params)) {
        console.error('Error: Invalid parameters in workspaces array');
        return;
      }

      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
      }

      if (!fs.existsSync(from)) {
        fs.mkdirSync(from);
      }

      const files = fs.readdirSync(from);

      files.forEach((modelName: string) => {
        const fileContent = fs.readFileSync(`${from}/${modelName}`, 'utf-8');
        const lines = fileContent.split(/\r?\n/);

        params.forEach((values: { [key: string]: string }) => {
          const envType = values['<WORKSPACE>'];
          const modifiedLines = fillLines(lines, envType, values, useEnvSample, useCiSample);
          const modifiedContent = modifiedLines.join('\n');

          if (!fs.existsSync(destiny)) {
            fs.mkdirSync(destiny);
          }

          const destinyFile = path.join(destiny, `${envType}-${modelName}`);
          fs.writeFileSync(destinyFile, modifiedContent);
          console.log(`Workflow file created at ${destinyFile}`);
        });
      });
    } catch (error) {
      console.error('Error creating workflow file:', error);
    }
    console.log('Generate ended')
  }
}

genActions.generate([
  {
    "<WORKSPACE>": "dev"
  },
  {
    "<WORKSPACE>": "main"
  }
], true, true);

export default genActions;