import { NodeIO, Document } from '@gltf-transform/core';
import { prune , dedup } from '@gltf-transform/functions';
import fs from 'fs';
import path from 'path';

const directoryPath = './models'; // Adjust as necessary


/*

Loop through every GLTF in /models, centers the nodes, and re-saves 
 


*/
  

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

        


        root.listNodes().forEach(node => {

            const nodeName = node.getName();
                if (nodeName.includes("LOD0") || nodeName.includes("LOD2")) {
                    node.dispose();
                }

           
        
        });

          await document.transform(
            
                prune(),          // Remove unused nodes, textures, or other data
                
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


