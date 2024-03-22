import fs from 'fs';
import path from 'path';

const from = '.github/models';
const destiny = '.github/workflows';

function processEnvFile(modifiedLines: string[], envFileName: string, envType: string): string[] {
  const envFileContent = fs.readFileSync(envFileName, 'utf-8');
  const envLines = envFileContent.split(/\r?\n/);

  let foundIndex = -1;

  modifiedLines.forEach((line, index) => {
    if (line.includes('rm .env-')) {
      foundIndex = index;
    } else if (foundIndex !== -1 && index === foundIndex + 2) {
      envLines.forEach(envLine => {
        const varName = envLine.split('=')[0];
        modifiedLines.splice(index, 0, `          && echo ${varName}=\${{ vars.${varName} }} >> .env-${envType}`);
      });
      foundIndex = -1;
    }
  });

  return modifiedLines;
}

function fillLines(lines: string[], serverPath: string, envType: string, useEnvSample: boolean, useCiSample: boolean): string[] {
  let modifiedLines = lines.map((line: string) => {
    let modLines = line.replace(/<WORKSPACE>/g, envType);
    modLines = line.replace(/<PATH>/g, serverPath);

    return modLines
  });

  if (useCiSample) {
    modifiedLines = processEnvFile(modifiedLines, '.env-ci-sample', envType);
  }

  if (useEnvSample) {
    modifiedLines = processEnvFile(modifiedLines, '.env-sample', envType);
  }

  return modifiedLines;
}

const genActions: any = {
  generate: (workspaces: string[], serverPath: string, useEnvSample: boolean, useCiSample: boolean) => {
    try {
      const files = fs.readdirSync(from);

      files.forEach((modelName: string) => {
        const fileContent = fs.readFileSync(`${from}/${modelName}`, 'utf-8');
        const lines = fileContent.split(/\r?\n/);

        for (let index = 0; index < workspaces.length; index++) {
          const envType = workspaces[index];
          const modifiedLines = fillLines(lines, serverPath, envType, useEnvSample, useCiSample);
          const modifiedContent = modifiedLines.join('\n');
          const destinyFile = path.join(destiny, `${envType}-${modelName}`);
          fs.writeFileSync(destinyFile, modifiedContent);
          console.log(`Workflow file created at ${destinyFile}`);
        }
      });
    } catch (error) {
      console.error('Error creating workflow file:', error);
    }
  }
}
