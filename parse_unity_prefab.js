 

import fs from 'fs';
import  yaml  from 'yaml' ;

// https://unity.com/blog/engine-platform/understanding-unitys-serialization-language-yaml

 

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

 
          console.log( "val",   doc  )  ;

          if (doc && doc.items){

            console.log( "items" , JSON.stringify( doc.items ) );


          }
            
     
        if ( cst && cst.value  )  {
          // Assuming cst.value contains the full node value as string
          const properties = yaml.parse(cst.value);

          // Extract UUID from the anchor if available
          const uuid = cst.anchor; // This assumes that the anchor is the UUID, check your specific YAML structure

           console.log(`uuid: ${uuid}`);

          // Include the UUID in the returned object
          return {
            uuid: uuid,
            type: `UnityType${tagSuffix}`,
            ...properties
          };
        }
    },




    identify: v => !!(typeof v === 'object' && v && v instanceof Error)

 
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
  schema: 'core',
};


 

function parseUnityYAML(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');

      const document = yaml.parseDocument(fileContents, yamlOptions);
    const items = [];
 


    // Iterate over all items in the document
    for (const item of document.contents.items) {


        console.log({item});

      const node = item.key;
      const value = item.value;

     console.log(JSON.stringify(item.key));

      
      // Check if the node has a tag and anchor which are often used for UUIDs
      if (node.tag && node.anchor) {
        const tag = node.tag;
        const uuid = node.anchor;
        const properties = value.toJSON();  // Converts the YAML node to a JSON object

        items.push({
          uuid: uuid,
          tag: tag,
          properties: properties
        });
      }
    }



     return items;
    //const docs = yaml.parseAllDocuments(fileContents, yamlOptions).map(doc => doc.toJSON());
     // return docs; // Returns an array of JavaScript objects
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

