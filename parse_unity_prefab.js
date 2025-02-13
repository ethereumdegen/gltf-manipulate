 

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




 
 

 /*
const customTags = [{
  tag: '!u!',
  identify: value => typeof value === 'object',
  resolve: (doc, cst) => {
    // Parsing the custom tag to extract the type and UUID
    const tagMatch = cst.tag.match(/^!u!(\d+)/);
    const uuidMatch = cst.src.match(/&(\d+)/); // Use `src` to access the raw string
    if (tagMatch && uuidMatch) {

    	console.log("tag match !! ");
      return {
        type: `UnityType${tagMatch[1]}`,
        uuid: uuidMatch[1],
        properties: yaml.parse(cst.value)
      };
    } else {

    	console.log(" no tag match   ");
    }
    return yaml.parse(cst.value);
  },
  construct: data => {
    // Custom construction logic if needed, based on the data.type
    return data;
  },
   test: /^!u!\d+/
}];
*/


/*
const customTags = [{
  tag: '!u!',
  identify: value => true, // Simplified for testing purposes, normally should be more specific
  resolve: (doc, cst) => {
    console.log(`Raw Content: ${cst.src}`); // Log raw content to see what's being read
    const tagMatch = cst.tag.match(/^!u!(\d+)/);
    const uuidMatch = cst.src.match(/&(\d+)/); // Assuming 'src' is the correct raw string property
    console.log(`Tag Match: ${tagMatch}, UUID Match: ${uuidMatch}`); // Debug output
    if (tagMatch && uuidMatch) {
      return {
        type: `UnityType${tagMatch[1]}`,
        uuid: uuidMatch[1],
        properties: yaml.parse(cst.value)
      };
    }
    return yaml.parse(cst.value);
  },
  test: /^!u!\d+/ // Ensure this matches the tags exactly as they appear in your YAML files
}];*/

/*
const error = {
  tag: '!tag:unity3d.com,2011',
  collection: 'map',

   resolve: (doc, cst) => {
    console.log(`Raw Content: ${doc}`);
  }, 

  identify: v => !!(typeof v === 'object' && v && v instanceof Error)
}

*/


function createUnityType(tagSuffix) {
  return  { 
    tag: `tag:unity3d.com,2011:${tagSuffix}` ,

     collection: 'map',

     resolve: (doc, cst) => {
      console.log(`Raw Content: ${doc}`);
    }, 

    identify: v => !!(typeof v === 'object' && v && v instanceof Error)


 //    kind: 'mapping', // or 'scalar', 'sequence', depending on what you expect
   // resolve: data => true, // Assuming we always resolve successfully
     
  };
}
 


const customTags = [ 

  // error , 

   createUnityType('1'), // For GameObjects
   createUnityType('4'), // For Components, etc.

  ];




// Options for YAML parser
const yamlOptions = {
  customTags ,
  schema: 'unity',
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

//console.log( JSON.stringify ( entities_array ) )


saveJsonFile(entities_array, 'prefabs/output.json');

