 

import fs from 'fs';
import  yaml  from 'yaml' ;



 

// Create a custom YAML schema that includes your custom type
 
 

class TransformSimple {
  constructor(position, scale, rotation) {
    this.position = position;
    this.scale = scale;
    this.rotation = rotation; // Assuming rotation is given in Euler angles (pitch, yaw, roll)
  }
}

class ZoneEntity {
  constructor(name, uuid, transform) {
    this.name = name;
    this.uuid = uuid;
    this.transform = transform;
  }
}




// Custom tag handling
function customTagResolver(value, tagName) {
  // Log the tag and value to see what's being parsed
  console.log(`Handling tag ${tagName} with value`, value);
  return { tag: tagName, value }; // Simple wrap into an object with its tag
}


 

// Custom tag handling for Unity-specific tags
const unityTagHandler = {
  identify: value => true,
  tag: '!u!', // This will need to be adjusted if Unity uses multiple distinct tags
  resolve: (doc, cst) => {
    // Custom parsing logic for Unity tags
    return yaml.parse(cst.strValue, { schema: 'failsafe' });
  },
  test: /^!u!\d+$/,
};

// Options for YAML parser
const yamlOptions = {
  customTags: [unityTagHandler],
  schema: 'failsafe',
};


 

function parseUnityYAML(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContents, yamlOptions).map(doc => doc.toJSON());
    return docs; // Returns an array of JavaScript objects
  } catch (error) {
    console.error('Failed to parse the YAML file:', error);
    return null;
  }
}


 

function saveJsonFile(output_data, outputPath) {
  const jsonData = JSON.stringify(output_data, null, 2); // Beautify the JSON output
  fs.writeFileSync(outputPath, jsonData, 'utf8');
  console.log(`Data saved to ${outputPath}`);
}

// Example usage
const entities_array = parseUnityYAML('prefabs/PF_GeneralStore_Exterior.prefab');

console.log( JSON.stringify ( entities_array ) )


saveJsonFile(entities_array, 'prefabs/output.json');

