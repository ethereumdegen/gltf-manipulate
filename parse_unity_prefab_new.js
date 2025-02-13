 

import fs from 'fs';
import  yaml  from 'js-yaml' ;


 
import path from 'path';
import util from 'util';

 

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


 
// Define a custom YAML type for handling !u! followed by any number
const UuidType = new yaml.Type('!u!', {
  kind: 'scalar',
  resolve: function(data) {
    // Resolve data that starts with !u! followed by numbers
    return /^\d+$/.test(data);
  },
  construct: function(data) {
    // This method will return the data associated with the tag
    return `UUID: ${data}`;
  }
});
// Extend the DEFAULT_SCHEMA with the new custom type
const schema = yaml.DEFAULT_SCHEMA.extend({ explicit: [UuidType] });

 

// Function to read and parse the YAML
function parseYamlFile(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    // Load YAML using the custom schema
    const data = yaml.load(fileContents, { schema: schema });
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}




// =========================
// Example Usage
// =========================
const prefabPath =  'prefabs/PF_GeneralStore_Exterior.prefab';
const outputJsonPath =  'prefabs/output.json';

const parsedEntities = parseYamlFile(prefabPath);
console.log('Parsed JSON Output:', JSON.stringify(parsedEntities, null, 2));

/*
if (parsedEntities) {
  saveJsonFile(parsedEntities, outputJsonPath);
}*/

