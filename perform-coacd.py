import coacd
import trimesh
import numpy as np
import os


def process_and_export_convex_hulls(input_file, output_file ):
    # Load the GLB file
    # input_file = "model.glb"
    mesh = trimesh.load(input_file, force="mesh")
    
   # original_node_name = mesh.metadata.get('name')
    
    
    
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

     # Convert original_mesh back to a Trimesh object for compatibility
    original_trimesh = trimesh.Trimesh(vertices=mesh.vertices, faces=mesh.faces)


    # Create a new Scene
    scene = trimesh.Scene()

    # Add the original mesh to the scene with its original node name
    scene.add_geometry(original_trimesh, node_name="root")
 
     

    # Create a parent node for collision volumes
    collision_node = scene.add_node(name="collision_volumes")

    # Add each convex hull as a child node under the 'collision_volumes' node
    for i, hull in enumerate(hull_meshes):
        scene.add_geometry(hull, node_name=f"convex_hull_{i}", parent_node_name="collision_volumes")

    # Export the scene as a GLB file
    scene.export( output_file)

    print(f"Successfully saved GLB with original mesh and {len(hull_meshes)} collision volumes as 'combined_convex_hulls.glb'")
    
    
    
#process_and_export_convex_hulls("model.glb",  "combined_convex_hulls.glb")  

# Directory containing the GLB files
directory_path = "models"

# Loop through all files in the specified directory
for filename in os.listdir(directory_path):
    if filename.endswith(".glb"):
        input_path = os.path.join(directory_path, filename)
        output_path = os.path.join(directory_path, f"convex_{filename}")
        process_and_export_convex_hulls(input_path, output_path)

