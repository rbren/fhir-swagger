// const defaultSchemes = require("../data/defaultSchemes.json");
const FS = require("fs")
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
module.exports = {
    convert: function (source) {
        let snapshot = source.snapshot;
        let schema = {
            type: "object",
            properties: {},
            required: []
        };

        snapshot.element.forEach(resource => {
            // let name="";
            let name = resource.path.split(".").pop();
            let parts = resource.path.split(".");
            if (name == resource.path || name == "contained") {
                return;
            }else if(name.includes("[x]")){
                resource.type.forEach(x=>{
                    let prop=getType([x])[0];
                    let newName= name.split("[x]")[0]+capitalizeFirstLetter(x.code)
                    schema.properties[newName] =prop;
                })
                return;
            }
            let prop = {
            }
            if(resource.base && resource.base.path && (resource.base.path.endsWith(".text") || resource.base.path.endsWith(".id"))){  

                prop.type = "string"

        }
            else if (resource.contentReference) {
                let reference = resource.contentReference.split("#").pop();
                prop = {
                    "type": "object",
                    "properties": {
                        "reference": {
                            "type": "string",
                            "description": "Literal reference, Relative, internal or absolute URL example: " + reference + "/{id}"
                        }
                    },
                    "required": ["reference"]

                }
            }
            else {
                let types
                try {
                    types = getType(resource.type, resource);
                } catch (error) {
                    console.error(error);
                    // console.log(resource)
                    throw Error("stap")
                }

                if (types.length >= 2) {
                    prop.oneOf = []
                    types.forEach(x => {
                        prop.oneOf.push(x)
                    }
                    )
                    // var clean = prop.oneOf.filter((arr, index, self) =>
                    //     index === self.findIndex((t) => (t.type === arr.type)))
                    // prop.oneOf=clean;
                    // prop.oneOf={
                    //     "anyOf":types
                    // }
                } else {
                    prop = types[0]
                    // if(types[0].type){
                    //     prop.type=types[0].type
                    // }else{
                    //     prop["$ref"]=types[0]["$ref"]
                    // }
                    // if(types[0].pattern){
                    //     prop.pattern=types[0].pattern
                    // }
                    // if(types[0].items)
                }
            }

            if (resource.binding?.strength == "required" && parts.length > 2) {
                let currentSpot = schema.properties;
                parts.slice(1, -1).forEach(x => {
                    if (currentSpot[x] == undefined)
                        currentSpot[x] = Object.assign({}, currentSpot[x])
                    currentSpot = currentSpot[x];
                })
                if (currentSpot.required == undefined) {
                    currentSpot.required = []
                }
                currentSpot.required.push(name)
            } else if (resource.binding?.strength == "required") {
                schema.required.push(name);
            }
            if (resource.max && resource.base.max == "*") {
                prop = { type: "array", "items": prop }
                if (resource.max !== "*") {
                    prop.maxItems = Number(resource.max)
                }
            }
            prop.description = resource.definition;

            if (parts.length <= 2) {
                schema.properties[name] = prop;
            } else {
                let currentSpot = schema.properties;
                let temp = parts.slice(1, parts.length - 1)
                // console.log(temp)
                if (parts.includes("QuestionnaireResponse")) {
                    // console.log("im here")
                }
                temp.forEach(x => {
                    if (currentSpot[x] == undefined && currentSpot.type!=="array") {
                        currentSpot[x] = Object.assign({}, currentSpot[x])
                    }
                    if (currentSpot.type === "array") {
                        currentSpot = currentSpot.items
                    } else {
                        currentSpot = currentSpot[x];
                    }

                })
                if (!currentSpot.properties) {
                    currentSpot.properties = Object.assign({}, currentSpot.properties)
                }
                if (currentSpot.items) {
                    if (currentSpot.items.oneOf) {
                        currentSpot.items.oneOf.push(prop)
                    } else if (currentSpot.items.properties) {
                        currentSpot.items.properties[name] = prop
                    }
                    // else if(currentSpot.items){
                    //     currentSpot.items = prop
                    // }
                    // currentSpot.properties[name] = prop
                } else {
                    currentSpot.properties[name] = prop
                }
                // currentSpot={...prop,...currentSpot};
                if (Object.entries(currentSpot.properties).length < 1) {
                    delete currentSpot.properties
                }
            }
            // schema.properties[name] = prop;
        })
        return schema;
    },
    convertAll: function (path) {
        let files = FS.readdirSync(path, { withFileTypes: true })
        let schemas = defaultSchemes
        files.forEach(file => {
            if (file.name.endsWith(".profile.json")) {
                let profile = JSON.parse(FS.readFileSync(path + "/" + file.name))
                // console.log(profile.snapshot)
                let schema = this.convert(profile.snapshot)
                schemas.components.schemas[profile.name] = schema;
            }
        })
        return schemas;
    },
    getDefault: async function (version) {
        return await fetch("https://hl7.org/fhir/" + version + "/fhir.schema.json").then(res => res.json()).catch(err => {
            return JSON.parse(FS.readFileSync(__dirname+"/../data/"+version+".schema.json"))
        })
    }
}

function getType(type, resource) {
    let types = []
    type.forEach((typeItem, i) => {
        switch (typeItem.code) {
            case "BackboneElement":
                types.push({ "type": "object" })
                break;
            case "time":
                types.push({ type: "string", "pattern": "([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?" })
                break;
            case "base64Binary":
                types.push({ type: "string", "pattern": "(\s*([0-9a-zA-Z\+\=]){4}\s*)+" });
                break;
            case "markdown":
                types.push({ type: "string", "pattern": "\s*(\S|\s)*" })
                break;
            case "id":
                types.push({ type: "string", "pattern": "[A-Za-z0-9\-\.]{1,64}" })
                break;
            case "oid":
                types.push({ type: "string", "pattern": "urn:oid:[0-2](\.(0|[1-9][0-9]*))+" })
                break;
            case "date":
                types.push({ type: "string", "pattern": "([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?" })
                break;
            case "Reference":
                let reference = typeItem.profile ?
                    typeItem.profile[0].split("/").pop()
                    : typeItem.targetProfile ? typeItem.targetProfile.split("/").pop() : "anything";
                let type = {
                    "type": "object",
                    "properties": {
                        "reference": {
                            "type": "string",
                            "description": "Literal reference, Relative, internal or absolute URL example: " + reference + "/{id}"
                        }
                    },
                    "required": ["reference"]

                }
                types.push(type)
                break;
            case "boolean":
                types.push({ type: "boolean" })
                break;
            case "decimal":
                types.push({ type: "number", "pattern": "double" })
                break;
            case "unsignedInt":
                types.push({ type: "integer", "pattern": "int32" })
                break;
            case "integer":
            case "positiveInt":
                types.push({ type: "integer", "pattern": "int32" })
                break;
            case "CodeableConcept":
            case "Coding":
            case "code":
                let description = resource?.binding?.description + (
                    resource?.binding?.valueSetReference?.reference ?
                        " <br> from list " + resource?.binding?.valueSetReference?.reference : (resource?.binding?.valueSetUri ? " <br> from list " + resource?.binding?.valueSetUri : resource?.short))
                let data = { "type": "string", "description": description };
                types.push(data)
                break;
            default:
                types.push({ "$ref": "#/components/schemas/" + typeItem.code })
                break;
        }
    })
    return types;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }