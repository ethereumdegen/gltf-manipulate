import { NodeIO, Document } from '@gltf-transform/core';
import { prune , dedup } from '@gltf-transform/functions';
import fs from 'fs';
import path from 'path';

const directoryPath = './models'; // Adjust as necessary


/*

Loop through every GLTF in /models, exports a new GLB for each node 
 


*/



async function optimizeAndExportMeshes() {
    const io = new NodeIO();
    
    try {
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.glb'));

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            console.log(`Processing file: ${filePath}`);

            const document = await io.read(filePath);
            const root = document.getRoot();

            const nodes = root.listNodes();

        //    const meshes = root.listMeshes();

            // Process each mesh separately
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];

                let mesh = node.getMesh();

                // Create a new document for each mesh
                const newDocument = new Document();
              //  const newRoot = newDocument.getRoot();
                const newIo = new NodeIO(); // New IO instance for writing

                // Create a single buffer for the new document
                const newBuffer = newDocument.createBuffer('buffer.glb');

                // Create a new Mesh in the new document
                const newMesh = newDocument.createMesh(mesh.getName() || `Mesh_${i}`);

                // Recreate primitives from scratch
                mesh.listPrimitives().forEach(primitive => {
                    const newPrimitive = clonePrimitive(newDocument, primitive, newBuffer);
                 

                     if (newPrimitive) {
                        newMesh.addPrimitive(newPrimitive);
                    }

                });

                 if (newMesh.listPrimitives().length === 0) {
                    console.warn(`Skipping empty mesh: ${mesh.getName()}`);
                    continue; // Skip if there's no valid mesh data
                }



                // Create a node and attach the new Mesh
                const newNode = newDocument.createNode(newMesh.getName());
                 newNode.setMesh(newMesh);
               //   newNode.setTranslation([0, 0, 0]); // Reset position
               // newNode.setScale([1, 1, 1]); // Ensure proper scale
               // newNode.setRotation([0, 0, 0, 1]); // Reset rotation

                // Create a new scene and attach the node
                const newScene = newDocument.createScene();
                newScene.addChild(newNode); 
               // newDocument.getRoot().setDefaultScene(newScene); // Set it as the default scene

               //  await newDocument.transform(prune(), dedup());

                // Apply pruning to remove unnecessary data
               // await newDocument.transform(prune());

                let output_name = node.getName() || `Mesh_${i}`;

                // Save as a single binary GLB file
                const outputFilePath = path.join(directoryPath, `${file.replace('.glb', '')}_${output_name}.glb`);
                await newIo.write(outputFilePath, newDocument); // Use write() for GLB
                console.log(`Exported: ${outputFilePath}`);
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

optimizeAndExportMeshes();



function clonePrimitive(newDocument, primitive, buffer) {
    const newPrimitive = newDocument.createPrimitive();

    if (!primitive.getAttribute('POSITION')) {
        console.warn('Skipping primitive with no POSITION attribute.');
        return null;
    }


    console.log( primitive.listSemantics() );

   primitive.listSemantics() .forEach(semantic => {

        let oldAttr = primitive.getAttribute(semantic);

        const newAccessor = newDocument.createAccessor()
            .setType(oldAttr.getType())
            .setArray(oldAttr.getArray())
            .setBuffer(buffer);
        newPrimitive.setAttribute(semantic, newAccessor);

    });

   

    // ✅ Copy indices if present
    if (primitive.getIndices()) {
        const indicesAccessor = newDocument.createAccessor()
            .setType(primitive.getIndices().getType())
            .setArray(primitive.getIndices().getArray())
            .setBuffer(buffer);
        newPrimitive.setIndices(indicesAccessor);
    }

    // ✅ Copy material reference (if any)
   // if (primitive.getMaterial()) {
  //      newPrimitive.setMaterial(primitive.getMaterial());
  //  }

    // ✅ Copy mode (Triangles, Points, Lines, etc.)
    newPrimitive.setMode(primitive.getMode());

    return newPrimitive;
}