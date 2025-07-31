## Gltf Manipulation scripts 


### Convert.js 

converts multiple FBX files to GLTF (requires local install of fbxToGltf ) 

```

node convert.js 


```



### remove_nodes.js

Removes all texturees, prunes and dedups all glbs in the folder 



### process_glb.js

Removes all texturees, prunes and dedups all glbs in the folder 


### split_and_center.js

Re-exports every node from a GLB file into its own unique GLB file, centering ALL nodes 

### generate_colliders.py

Uses COACD (req local install using pip) to generate colliders for each glb in /models 


```

python3 generate_colliders.py

```

### combine_colliders 

Combines the original GLB with generated collliders. This is a separate script because pythons trimesh crate is insufficient 




## SETUP JS 


```

npm install @gltf-transform/core @gltf-transform/functions






```


 
## SETUP PYTHON

```

 ## install coacd.. 
 ### How to run in python virtual env.... Setup for python ! 

python3 -m venv myenv

source myenv/bin/activate  # Linux/macOS

pip install coacd numpy trimesh


```


### Standard Use 

1. convert 
2. remove nodes (remove wrong LOD) 
2. apply_xforms  ( important for collider gen ! ) 
3. generate colliders
4. combine colliders  
5. fix_filenames_combined