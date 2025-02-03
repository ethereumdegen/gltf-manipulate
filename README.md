## Gltf Manipulation scripts 


### Convert.js 

converts multiple FBX files to GLTF (requires local install of fbxToGltf ) 


### process_glb.js

Removes all texturees, prunes and dedups all glbs in the folder 


### split_and_center.js

Re-exports every node from a GLB file into its own unique GLB file, centering ALL nodes 

### generate_colliders.py

Uses COACD (req local install using pip) to generate colliders for each glb in /models 

### combine_colliders 

Combines the original GLB with generated collliders. This is a separate script because pythons trimesh crate is insufficient 
