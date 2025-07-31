import { NodeIO } from '@gltf-transform/core';
import { flatten } from '@gltf-transform/functions';
import fs from 'fs';
import path from 'path';

/*
Applies transforms (position, rotation, AND scale) for all models in the folder
Using gltf-transform's built-in flatten function
*/
const directoryPath = './models';

async function optimizeGLBFiles() {
    const io = new NodeIO();
    
    try {
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.glb'));
        
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            console.log(`Processing file: ${filePath}`);
            
            const document = await io.read(filePath);
            
            // Use gltf-transform's flatten function to bake all transforms into geometry
            await document.transform(flatten());
            
            // Save the modified GLB back to disk
            const outputFilePath = path.join(directoryPath, file);
            await io.write(outputFilePath, document);
            console.log(`Flattened transforms saved: ${outputFilePath}`);
        }
        
        console.log('All files processed successfully!');
        
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

optimizeGLBFiles();