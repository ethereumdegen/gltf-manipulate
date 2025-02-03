import coacd
import trimesh
import numpy as np
import os
import copy

def create_empty_like_node(scene, node_name, parent_name=None, transform=None):
    """
    Create a conceptual 'empty' node in a trimesh scene by ensuring it's referenced
    in the scene graph even without direct geometry.
    """
    if transform is None:
        transform = np.eye(4)  # Default to identity matrix if no transform provided

    # This line doesn't actually create a new node directly,
    # but sets up the transform that will be used as a reference for actual geometry nodes.
    if parent_name:
        scene.graph.update(frame_to=node_name, frame_from=parent_name, matrix=transform)
    else:
        # If no parent is specified, attach directly to the root
        # 'world' can be used as a generic root node name if needed
        scene.graph.update(frame_to=node_name, frame_from='world', matrix=transform)


 


def process_and_export_convex_hulls(input_file, output_file ):
   
        # Load the GLB file
    # input_file = "model.glb"
    mesh = trimesh.load(input_file, force="mesh")
       
    
    # Original mesh with metadata
    original_mesh = coacd.Mesh(mesh.vertices, mesh.faces)   # this step may destroy metadata 
   

     
    # Set CoACD parameters directly in function call
    convex_parts = coacd.run_coacd(
        original_mesh,
        threshold=0.1,              # Higher = fewer convex hulls (default: 0.05)
        max_convex_hull=5,          # Reduce number of convex hulls (-1 means unlimited)
        preprocess_mode="auto",     # Keep automatic preprocessing
        preprocess_resolution=50,   # Lower preprocessing resolution
        resolution=50000,           # Lower = fewer hulls, but less accurate
        mcts_nodes=10,              # Reduce search space to limit hulls
        mcts_iterations=100,        # Fewer iterations for speed
        mcts_max_depth=3,           # Depth limit for MCTS
        pca=False,                  # Disable PCA alignment
        merge=True,                 # Enable merging of smaller convex hulls
        decimate=True,              # Simplify hulls by reducing vertices
        max_ch_vertex=128,          # Maximum vertices per convex hull
        extrude=False,              # Disable extrude (can cause extra faces)
        extrude_margin=0.02,        # Extrude margin for hull merging
        apx_mode="ch",              # Approximation shape mode: convex hull
        seed=42,                    # Set random seed for reproducibility
    )

    # Convert each convex part to a Trimesh object
    hull_meshes = [trimesh.Trimesh(vertices=part[0], faces=part[1]) for part in convex_parts]



 

    # Create a new Scene
    scene = trimesh.Scene()
   
 
    create_empty_like_node(scene, node_name='collision_volumes')

 

    # Export the scene as a GLB file
    scene.export( output_file)

    print(f"Successfully saved   {len(hull_meshes)} collision volumes ")
    
    
    
#process_and_export_convex_hulls("model.glb",  "combined_convex_hulls.glb")  

# Directory containing the GLB files
directory_path = "models"

# Loop through all files in the specified directory
for filename in os.listdir(directory_path):
     if filename.endswith(".glb") and not filename.startswith("collision_"):
        input_path = os.path.join(directory_path, filename)
        output_path = os.path.join(directory_path, f"collision_{filename}")
        process_and_export_convex_hulls(input_path, output_path)

