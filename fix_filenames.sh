#!/bin/bash

# Get the current directory
DIR="."

# Loop through each file in the directory
for file in "$DIR"/*; do
  # Check if the filename contains 'SM'
  if [[ "$file" == *"SM"* ]]; then
    # Replace 'SM' with 'elven' in the filename
    newname="${file//SM/elven}"
    # Rename the file
    mv "$file" "$newname"
    echo "Renamed $file to $newname"
  fi
done
