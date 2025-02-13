import { NodeIO, Document } from '@gltf-transform/core';
import { prune , dedup } from '@gltf-transform/functions';
import fs from 'fs';
import path from 'path';

const directoryPath = './models'; // Adjust as necessary


/*

Loop through every GLTF in /models, renames bones, and re-saves 
 


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

        

          // Rename animations by removing 'rig|' prefix and '_rig' suffix
            const animations = root.listAnimations();
            animations.forEach(animation => {
                let animationName = animation.getName();
                if (animationName.startsWith('rig|')) {
                    animationName = animationName.substring(4); // Remove 'rig|' prefix
                }
                if (animationName.endsWith('_rig')) {
                    animationName = animationName.slice(0, -4); // Remove '_rig' suffix
                }
                animation.setName(animationName);
            });

       

          await document.transform(
            
              //  prune(),          // Remove unused nodes, textures, or other data
                
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

 