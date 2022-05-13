// const defaultSchemes=require("../data/defaultSchemes.json");
const FS =require("fs");

function getType(type) {
    let array= Array.isArray(type)
    let x;
    if(array){
        x={code:type[0]}
    }else{
        x={code:type}
    }
    x.code=x.code.replace("<","").replace(">","")
    x.code =x.code.includes("(")?x.code.split("(")[0]:x.code
    let types = []

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
            let data={"type":"string","format":"[^\s]+(\s[^\s]+)*"};
            types.push(data)
            break;
        case "BackboneElement":
            types.push({ "type":"object"})
            break;
        default:
            types.push({ "$ref": "#/components/schemas/" + x.code })
            break;
    }
    if(array){
        types[0]= {type: "array","items":types[0]}
    }
    return types[0];
}


function turnJsonIntoSchema(){
    let data = JSON.parse(FS.readFileSync(__dirname+"/input.json"))
    output=(convert(data))
    FS.writeFileSync(__dirname+"/output.json", JSON.stringify(output,null,4))
}

function convert (source) {
    let schema={"type":"object",properties:{}}
    let props = source.props;
    Object.keys(props).forEach(x=>{
        let type =getType(props[x][0])
        type.description=props[x][1]
        schema.properties[x]=type;
    })
    return schema;
}

turnJsonIntoSchema()