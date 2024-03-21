import fs from 'fs';
import path from 'path';

const workspaces = ['dev', 'staging', 'main'];
const from = '.github/models';
const destiny = '.github/workflows';

function generate() {
    try {
        const files = fs.readdirSync(from);

        files.forEach(modelName => {
            const fileContent = fs.readFileSync(`${from}/${modelName}`, 'utf-8');
            const lines = fileContent.split(/\r?\n/);

            for (let index = 0; index < workspaces.length; index++) {
                const envType = workspaces[index];

                const modifiedLines = lines.map(line => {
                    return line.replace(/<WORKSPACE>/g, envType);
                });

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

generate();
