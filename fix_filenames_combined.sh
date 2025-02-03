#!/bin/bash

# Get the current directory
DIR="./models"

# Loop through each file in the directory
for file in "$DIR"/*; do
  # Check if the filename contains 'SM'
  if [[ "$file" == *"combined_"* ]]; then
    # Replace 'SM' with 'elven' in the filename
    newname="${file//combined_/}"
    # Rename the file
    mv "$file" "$newname"
    echo "Renamed $file to $newname"
  fi
done
