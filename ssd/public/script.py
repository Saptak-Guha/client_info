import os
from PIL import Image
import numpy as np

# Target replacement RGB color
target_rgb = np.array([25, 118, 210], dtype=np.uint8)

# Source reference color to match against (purple-ish)
SOURCE_PURPLE = np.array([80, 0, 191], dtype=np.uint8)

# How close the color should be to match (Euclidean distance in RGB)
PURPLE_THRESHOLD = 60  # increase if you want a wider range

# Folder with images
folder = "demo"

for filename in os.listdir(folder):
    if filename.lower().endswith((".png", ".jpg", ".jpeg")):
        path = os.path.join(folder, filename)
        img = Image.open(path).convert("RGBA")
        data = np.array(img)

        # Extract RGB channels
        rgb_data = data[:, :, :3]
        alpha_data = data[:, :, 3:]

        # Compute color distance to SOURCE_PURPLE
        distance = np.linalg.norm(rgb_data - SOURCE_PURPLE, axis=2)
        match_mask = distance < PURPLE_THRESHOLD

        # Replace RGB channels where color is close to purple
        rgb_data[match_mask] = target_rgb

        # Recombine RGB and Alpha
        new_data = np.concatenate([rgb_data, alpha_data], axis=2)

        # Save the image
        Image.fromarray(new_data).save(path)
        print(f"Overwritten: {filename}")
