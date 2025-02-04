import { NodeIO } from '@gltf-transform/core';
import { mat4, vec4 } from 'gl-matrix';
import fs from 'fs';
import path from 'path';
/*


Applies transforms for all models in the folder

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
            const root = document.getRoot();

            root.listNodes().forEach(node => {
                // Compute the node's world transform matrix
                const matrix = node.getWorldMatrix();

                // Apply the transformation to the mesh
                if (node.getMesh()) {
                    node.getMesh().listPrimitives().forEach(primitive => {
                        const positions = primitive.getAttribute('POSITION');
                        if (positions) {
                            const array = positions.getArray();
                            for (let i = 0; i < array.length; i += 3) {
                                const vec = vec4.fromValues(array[i], array[i + 1], array[i + 2], 1); // Homogeneous coordinates
                                vec4.transformMat4(vec, vec, matrix); // Apply matrix transformation
                                array[i] = vec[0];
                                array[i + 1] = vec[1];
                                array[i + 2] = vec[2];
                            }
                            positions.setArray(array);
                        }
                    });
                }

                // Reset transformations on the node since they are baked into the mesh
                node.setTranslation([0, 0, 0]);
                node.setRotation([0, 0, 0, 1]); // Identity quaternion
                node.setScale([1, 1, 1]);
            });

            // Save the modified GLB back to disk
            const outputFilePath = path.join(directoryPath, file);
            await io.write(outputFilePath, document);
            console.log(`Optimized file saved: ${outputFilePath}`);
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

optimizeGLBFiles();
