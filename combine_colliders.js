import { NodeIO, Document, Node, Mesh, Material, BufferUtils } from '@gltf-transform/core';
import fs from 'fs';
import path from 'path';

const directoryPath = './models';  

/*


Loop through every  .glb in models and combine it with its generated collision glb 

*/

async function combineGLBFiles() {
    const io = new NodeIO();

    try {
        const files = fs.readdirSync(directoryPath).filter(file =>
            file.endsWith('.glb') && !file.startsWith('collision_') && !file.startsWith('combined_')
        );

        for (const file of files) {
            const baseFilePath = path.join(directoryPath, file);
            const colliderFile = `collision_${file}`;
            const colliderFilePath = path.join(directoryPath, colliderFile);

            console.log(`Processing base file: ${baseFilePath}`);
            console.log(`Processing collider file: ${colliderFilePath}`);

            if (fs.existsSync(colliderFilePath)) {
                const baseDocument = await io.read(baseFilePath);
                const colliderDocument = await io.read(colliderFilePath);

                // Create a new combined document
                const combinedDocument = new Document();
                const combinedRoot = combinedDocument.getRoot();

                 const newIo = new NodeIO(); // New IO instance for writing

                   const newBuffer = combinedDocument.createBuffer('buffer.glb');

                      // ✅ Create an empty node for collision volumes
                const collisionParentNode = combinedDocument.createNode("collision_volumes");
                combinedRoot.listNodes().push(collisionParentNode);



                // ✅ Utility function to correctly transfer meshes and their buffers
                function transferMeshes(sourceDocument, prefix, parentNode = null) {
                    for (const srcNode of sourceDocument.getRoot().listNodes()) {
                        const srcMesh = srcNode.getMesh();
                        if (srcMesh) {
                            // Create a new mesh in the combined document
                            const newMesh = combinedDocument.createMesh(`${prefix}_${srcMesh.getName()}`);

                            // Clone each primitive separately
                            for (const primitive of srcMesh.listPrimitives()) {
                                const newPrimitive = clonePrimitive(combinedDocument, primitive, newBuffer);
                                newMesh.addPrimitive(newPrimitive);
                            }

                            // ✅ Add new mesh to the combined document
                            combinedRoot.listMeshes().push(newMesh);

                            // ✅ Create a new node for the mesh
                            const newNode = combinedDocument.createNode(`${prefix}_${srcNode.getName()}`).setMesh(newMesh);

                            // ✅ If a parent node is specified, attach the node as a child
                            if (parentNode) {
                                parentNode.addChild(newNode);
                            } else {
                                combinedRoot.listNodes().push(newNode);
                            }
                        }
                    }
                }

                // ✅ Transfer both base and collider meshes properly
                transferMeshes(baseDocument, "base");
               
                  transferMeshes(colliderDocument, "collider", collisionParentNode);


                // Save the combined GLB
                const outputFilePath = path.join(directoryPath, `combined_${file}`);
                await newIo.write(outputFilePath, combinedDocument);
                console.log(`✅ Combined file saved: ${outputFilePath}`);
            } else {
                console.error(`❌ Collider file not found for ${colliderFile}`);
            }
        }
    } catch (error) {
        console.error('❌ Error processing files:', error);
    }
}

combineGLBFiles();





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
    if (primitive.getMaterial()) {
        let old_mat_name = primitive.getMaterial().getName();


         const flatWhiteMaterial = newDocument.createMaterial( old_mat_name )
                .setBaseColorFactor( primitive.getMaterial().getBaseColorFactor() ) // RGBA: White
                .setMetallicFactor(0) // Non-metallic
                .setRoughnessFactor(1)
                 .setDoubleSided(true);
                 ; // Fully rough (matte)

        newPrimitive.setMaterial( flatWhiteMaterial );
    }

    // ✅ Copy mode (Triangles, Points, Lines, etc.)
    newPrimitive.setMode(primitive.getMode());

    return newPrimitive;
}