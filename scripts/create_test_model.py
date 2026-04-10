"""
Creates a simple apartment room as a .glb test model using Blender.
Run via: blender --background --python scripts/create_test_model.py
"""
import bpy
import os

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def add_box(name, location, scale, color):
    bpy.ops.mesh.primitive_cube_add(location=location, scale=scale)
    obj = bpy.context.active_object
    obj.name = name
    mat = bpy.data.materials.new(name=f"Mat_{name}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.6
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    return obj

# Floor
add_box("Floor", (0, 0, 0), (4, 3, 0.05), (0.85, 0.80, 0.72))

# Walls
add_box("Wall_Back",  (0, -3, 1.5),  (4, 0.05, 1.5), (0.95, 0.93, 0.90))
add_box("Wall_Left",  (-4, 0, 1.5),  (0.05, 3, 1.5), (0.95, 0.93, 0.90))
add_box("Wall_Right", ( 4, 0, 1.5),  (0.05, 3, 1.5), (0.95, 0.93, 0.90))

# Ceiling
add_box("Ceiling", (0, 0, 3.05), (4, 3, 0.05), (1.0, 1.0, 1.0))

# Sofa
add_box("Sofa_Base",   (1.5, -1.5, 0.25), (1.0, 0.45, 0.25), (0.36, 0.30, 0.25))
add_box("Sofa_Back",   (1.5, -1.9, 0.5),  (1.0, 0.1, 0.5),   (0.36, 0.30, 0.25))

# Bed
add_box("Bed_Base",    (-1.5, -1.0, 0.2), (0.9, 1.0, 0.2), (0.80, 0.75, 0.70))
add_box("Bed_Pillow",  (-1.5, -1.8, 0.45),(0.7, 0.15, 0.1),(1.0,  1.0,  1.0))
add_box("Bed_Cover",   (-1.5, -0.8, 0.37),(0.85, 0.7, 0.06),(0.5, 0.65, 0.8))

# Table
add_box("Table_Top",  (1.5, 1.5, 0.45), (0.6, 0.35, 0.04), (0.55, 0.40, 0.28))
add_box("Table_Leg1", (1.1, 1.2, 0.22), (0.04, 0.04, 0.22),(0.4, 0.28, 0.18))
add_box("Table_Leg2", (1.9, 1.2, 0.22), (0.04, 0.04, 0.22),(0.4, 0.28, 0.18))
add_box("Table_Leg3", (1.1, 1.8, 0.22), (0.04, 0.04, 0.22),(0.4, 0.28, 0.18))
add_box("Table_Leg4", (1.9, 1.8, 0.22), (0.04, 0.04, 0.22),(0.4, 0.28, 0.18))

# TV stand
add_box("TVStand", (0, -2.9, 0.3), (1.2, 0.15, 0.3), (0.2, 0.2, 0.2))
add_box("TV",      (0, -2.85, 0.85),(1.0, 0.05, 0.55),(0.1, 0.1, 0.1))

# Export as GLB
out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        "public", "models", "tipo-a.glb")
os.makedirs(os.path.dirname(out_path), exist_ok=True)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
)
print(f"Model exported to: {out_path}")
