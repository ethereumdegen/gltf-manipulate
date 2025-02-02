import { NodeIO } from '@gltf-transform/core';
import { resample, prune, dedup, draco, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const directoryPath = './models'; // Adjust as necessary



/*

Loop through every GLTF in /models, removes materials and textures, and re-saves
 


*/



// Custom transform: enable/disable backface culling.
function backfaceCulling(options) {
    return (document) => {
        for (const material of document.getRoot().listMaterials()) {
            material.setDoubleSided(!options.cull);
        }
    };
}

async function optimizeGLBFiles() {
    const io = new NodeIO();
    try {
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.glb'));

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            console.log(`Processing file: ${filePath}`);

            const document = await io.read(filePath);
            
            
              // Get the root of the document
        const root = document.getRoot();

        // Remove all materials
        root.listMaterials().forEach(material => {
          //material.dispose();
        });

        // Remove all textures
        root.listTextures().forEach(texture => {
          texture.dispose();
        });


            await document.transform(
             //   resample(),       // Losslessly resample animation frames
                prune(),          // Remove unused nodes, textures, or other data
               // dedup(),          // Remove duplicate vertex or texture data, if any
               // draco(),          // Compress mesh geometry with Draco
                
           //     backfaceCulling({cull: true}), // Custom transform for backface culling
            );

            // Save the modified GLB back to disk
            const outputFilePath = path.join(directoryPath, `${file}`);
            io.write(outputFilePath, document);
            console.log(`Optimized file saved: ${outputFilePath}`);
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

optimizeGLBFiles();

