import { exec } from 'child_process';
import { readdir, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const inputDirectory = './models';        // Directory containing the FBX files
const outputDirectory = './models/glb';   // Output directory for the GLB files



/*

Converts all FBX in  /models   to glb 


*/



// Ensure output directory exists
if (!existsSync(outputDirectory)) {
    mkdirSync(outputDirectory, { recursive: true });
}

// Read all files in the input directory
readdir(inputDirectory, (err, files) => {
    if (err) {
        console.error("Unable to scan directory: " + err);
        return;
    }

    // Filter and process only FBX files
    files.filter(file => file.endsWith('.fbx')).forEach(file => {
        const inputFilePath = join(inputDirectory, file);
        const outputFile = file.replace('.fbx', '.glb'); // Change the file extension to .glb
        const outputFilePath = join(outputDirectory, outputFile);

        // Construct the command to run FBX2glTF
        const command = `FBX2glTF --binary --input "${inputFilePath}" --output "${outputFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error converting ${file}: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`${file} conversion completed!`);
        });
    });
});
