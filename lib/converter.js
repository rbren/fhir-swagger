const defaultSchemes=require("../data/defaultSchemes.json");
const FS =require("fs")
module.exports = {
    convert: function (source) {
        let snapshot= source.snapshot;
        let schema = {
            type: "object",
            properties: {},
            required:[]
        };

        snapshot.element.forEach(resource => {
            // let name="";
            let name = resource.path.split(".").pop();
            let parts = resource.path.split(".");
            if (name == resource.path|| name=="meta"||name=="contained") {
                return;
            }
            let prop = {
            }            
            if(resource.base?.path.endsWith(".text")){
                prop.type="string"
            }else if(resource.base?.path.endsWith(".id")){
                prop.type="string"
            }
            else if(resource.contentReference){
                // console.log(Object.keys(schema.properties))
                // json.components.schemas.Observation.properties.referenceRange
                prop=JSON.parse(JSON.stringify(schema.properties[resource.contentReference.slice(1,resource.contentReference.length)]))
                // prop["$ref"]=`#/components/schemas/${source.id}/${resource.contentReference.slice(1,resource.contentReference.length)}`
            }
            else{
                let types
                try {
                    types=getType(resource.type,resource);    
                } catch (error) {
                    console.error(error);
                    console.log(resource)
                    throw Error("stap")
                }
                
                if(types.length>=2){
                    prop.oneOf=[]
                    types.forEach(x=>
                        {
                            prop.oneOf.push(x)
                        }
                    )
                    // var clean = prop.oneOf.filter((arr, index, self) =>
                    //     index === self.findIndex((t) => (t.type === arr.type)))
                    // prop.oneOf=clean;
                    // prop.oneOf={
                    //     "anyOf":types
                    // }
                }else{
                    prop=types[0]
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
            if (resource.min != undefined && resource.min>0) {
                prop.minItems = resource.min
            }
            if (resource.max != undefined && resource.max != "*") {
                if(prop.items){
                    prop.maxItems = Number(resource.max)
                }
                
            }
            if(resource.binding?.strength == "required" && parts.length>2){
                let currentSpot=schema.properties;
                parts.slice(1,-1).forEach(x=>{
                    if(currentSpot[x]==undefined)
                        currentSpot[x]=Object.assign({},currentSpot[x])
                    currentSpot =currentSpot[x];
                })
                if(currentSpot.required==undefined){
                    currentSpot.required=[]
                }
                currentSpot.required.push(name)
            }else if (resource.binding?.strength == "required") {
                schema.required.push(name);
            }
            prop.description = resource.definition;
            if(parts.length<=2){
                schema.properties[name] = prop;
            }else{
                let currentSpot=schema.properties;
                let temp =parts.slice(1,parts.length-1)
                // console.log(temp)
                temp.forEach(x=>{
                    if(currentSpot[x]==undefined){
                        currentSpot[x]=Object.assign({},currentSpot[x])
                    }
                    currentSpot =currentSpot[x];
                })
                if(!currentSpot.properties){
                    currentSpot.properties=Object.assign({},currentSpot.properties)
                }
                currentSpot.properties[name]=prop
                // console.log(currentSpot,'bagel')
                // currentSpot={...prop,...currentSpot};
            }
            // schema.properties[name] = prop;
        })
        return schema;
    },
    convertAll:function(path){
        let files =FS.readdirSync(path,{withFileTypes: true})
        let schemas=defaultSchemes
        files.forEach(file=>{
            if(file.name.endsWith(".profile.json")){
                let profile =JSON.parse(FS.readFileSync(path+"/"+file.name))
                // console.log(profile.snapshot)
                let schema=this.convert(profile.snapshot)
                schemas.components.schemas[profile.name]=schema;
            }
        })
        return schemas;
    },
    getDefault :function(){
        return defaultSchemes.components
    }
}

function getType(type,resource) {
    let types = []
    type.forEach((x,i) => {
        switch (x.code) {
            case "Meta":
            case "Extension":
            case "Extension":
            case "modifierExtension":
                types.push({})
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
                types.push({ type: "string", format: "[A-Za-z0-9\-\.]{1,64}" })
                break;
            case "oid":
                types.push({ type: "string", format: "urn:oid:[0-2](\.(0|[1-9][0-9]*))+" })
                break;
            case "canonical":
            case "uuid":
            case "uri":
            case "url":
            case "string":
                types.push({ type: "string" })
                break;
            case "date":
                types.push({ type: "string", "pattern": "([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?" })
                break;
            case "Reference":
                let reference= resource.type[i].profile? 
                    resource.type[i].profile[0].split("/").pop()
                        :resource.type[i].targetProfile?resource.type[i].targetProfile[0].split("/").pop():"anything";
                types.push({ "$ref": "#/components/schemas/Reference" ,"comment":`Reference to ${reference}`})
                break;
            case "boolean":
                types.push({ type: "boolean" })
                break;
            case "decimal":
                types.push({ type: "number", format: "double" })
                break;
            case "unsignedInt":
                types.push({ type: "integer", format: "int32" })
                break;
            case "integer":
            case "positiveInt":
                types.push({ type: "integer", format: "int32" })
                break;
            case "CodeableConcept":    
            case "Coding":                   
            case "code":
                let description= resource?.binding?.description+(
                    resource?.binding?.valueSetReference?.reference ?
                    " <br> from list "+resource?.binding?.valueSetReference?.reference:(resource?.binding?.valueSetUri ? " <br> from list "+ resource?.binding?.valueSetUri:resource?.short))
                let data={"type":"string","description":description};
                types.push(data)
                break;
            case "BackboneElement":
                types.push({ "type":"object"})
                break;
            default:
                types.push({ "$ref": "#/components/schemas/" + x.code })
                break;
        }
    })    
    return types;
}