const { tags } = require('./config.json')

const generalTag = /<\/?!?\w+((\s+\w+(\s*=\s*(?:"?.*?"?|'?.*?'?|[\^'">\s]+))?)+\s*|\s*)\/?>/gm
const startOfTag = /<\/?/mg
const endOfTag = /\/?>/mg
const openTag = /<!?\w+((\s+\w+(\s*=\s*(?:"?.*?"?|'?.*?'?|[\^'">\s]+))?)+\s*|\s*)>/gm
const autoClosedTag = /<\w+((\s+\w+(\s*=\s*(?:"?.*?"?|'?.*?'?|[\^'">\s]+))?)+\s*|\s*)\/>/gm
const commentStartTag = /<!--.*?/gm
const commentEndTag = /.*?-->/gm
const commentTag = /<!--[^>]*-->/gm
const closeTag = /<\/\w+((\s+\w+(\s*=\s*(?:"?.*?"?|'?.*?'?|[\^'">\s]+))?)+\s*|\s*)\/?>/gm
const contentOfTag = /((\s*(\w+\s*=\s*(?:".*?"|'.*?'+))?)+\s*|\s*)/g
const singleTag = /(\w*\=(\"[^"]+\"|\'[^']+\'))/g


function getKeyByValue(object, value) { 
    return Object.keys(object).find(key =>  
            object[key] === value); 
} 
/**
* Enum type to clasifies the line
*/
const LineType = {
    CONTENT_LINE: 0,
    OPEN_TAG: 1,
    CLOSED_TAG: 2,
    AUTO_CLOSED_TAG: 3,
    COMMENT_TAG: 4,
    INVALID_TAG: 5
}


/**
 * Data object to evaluate
 */
class Data  {
    constructor( tokens=[], content="" ){
        this.tokens = tokens
        this.content = content
    }
}

function isContent(value){
    
    return (( value.indexOf("{") !== -1 && value.indexOf("}") !== -1 ) || 
            ( value.indexOf("(") !== -1 && value.indexOf(")") !== -1 ) ||
            ( value.indexOf("()") !== -1 ) ||
            ( value.indexOf("if") !== -1 || value.indexOf("else") !== -1 || value.indexOf("function") !== -1  ) ||
            ( value.indexOf("try") !== -1  && value.indexOf("catch") !== -1 ) ||
            ( value.indexOf("let") !== -1  || value.indexOf("typeof") !== -1 || value.indexOf("var") !== -1 || value.indexOf("=>") !== -1 ))
}

/**
 * Search tags by the name given
 * @param {string} tagName 
 */
function getInfoTagByName(tagName = "") 
{

    let tag = null

    tagName = tagName.trim()

    tag = tags.find(item => item.name === tagName)

    return tag
}

/**
 * recieve the #tml to read
 * @param {string} value line value 
 */
function getPosibleTag(value)
{   
    let tagName = value.replace(startOfTag,'').replace(endOfTag,'').trim().split(' ')[0]
    let tagFound = false
    tags.forEach(tag =>{
        if (tag.name.indexOf(tagName) !== -1)
        {
            tagName = tag.name
            tagFound = true
        }
    })
    if(!tagFound)
        tags.forEach(tag =>{
            if (tagName.indexOf(tag.name) !== -1) tagName = tag.name
        })

    return tagName
}

/**
 * Retruns the type by the value given
 * @param {string} value 
 *   CONTENT_LINE: 0,
 *   OPEN_TAG: 1,
 *   CLOSED_TAG: 2,
 *   AUTO_CLOSED_TAG: 3,
 *   COMMENT_TAG: 4
 */
function getLineType( value ) {

    if(!value) return null

    if(value.match(openTag))
        return LineType.OPEN_TAG
        
    else if(value.match(autoClosedTag))
        return LineType.AUTO_CLOSED_TAG

    else if(value.match(closeTag))
        return LineType.CLOSED_TAG

    else if(value.match(commentTag))
        return LineType.COMMENT_TAG

    else
        return LineType.CONTENT_LINE
}

/**
 * getTokenValidationInfo
 * @param {string} value 
 */
function getTokenValidationInfo(value){
    let info = {}

    if(isContent(value))
    {
        info.tagType = getKeyByValue(LineType,LineType.CONTENT_LINE)
    }
    else if( value.startsWith('</') )
    {
        if( value.match(closeTag) ) info.tagType = getKeyByValue(LineType,LineType.CLOSED_TAG)
        else info = { tagType: getKeyByValue(LineType,LineType.INVALID_TAG), message: `Talvez intentaste escribir </${getPosibleTag(value)}>` }
    }
    else if( value.match('<') || value.endsWith('>') )
    {
        if( value.match(openTag) ) info.tagType = getKeyByValue(LineType,LineType.OPEN_TAG)
        else if( value.match(autoClosedTag) ) info.tagType = getKeyByValue(LineType,LineType.AUTO_CLOSED_TAG)
        else if( value.match(commentTag) ) info.tagType = getKeyByValue(LineType,LineType.COMMENT_TAG)
        else info = { tagType: getKeyByValue(LineType,LineType.INVALID_TAG), message: `Talvez intentaste escribir <${getPosibleTag(value)}>` }
    }
    else
    {
        info.tagType = getKeyByValue(LineType,LineType.CONTENT_LINE)
    }

    info.value = value

    if( info.tagType !==  getKeyByValue(LineType,LineType.INVALID_TAG) && info.tagType !==  getKeyByValue(LineType,LineType.CONTENT_LINE) && info.tagType !==  getKeyByValue(LineType,LineType.COMMENT_TAG) )
    {      
        let tagName = value.replace(startOfTag,'').replace(endOfTag,'').trim().split(' ')[0]
        let contentTag = value.replace(startOfTag,'').replace(endOfTag,'').replace(tagName,'').trim()

        getAttributesInfo(info, contentTag)

        info.details = getInfoTagByName(tagName)

    }

    return info
}

/**
 * getTokenInfo
 * @param {string} value 
 */
function getTokenInfo (value){

    let validationInfo = {}

    if(!value) value = ""
    else value = value.trim()

    validationInfo = getTokenValidationInfo(value)


    return validationInfo

}
/**
 * Removes the white lines and the intial white spaces of each line
 * @param {Data} content 
 */
const removeWhiteContent= (data) =>{

    data.content = data.content.replace(/^(\s*|\n)/gm, "");

    //console.log("#####COMMENTS REMOVED - <!-- --> #####")

    //console.log(content)
}

/**
 * Removes the comments
 * @param {Data} content 
 */
const removeComments = (data) => {

    data.content = data.content.replace(commentTag, "");

    //console.log("#####COMMENTS REMOVED - <!-- --> #####")

    //console.log(content)

}

/**
 * Identifies the tokens
 * @param {Data} data 
 */
const generateTokens = (data) => {
    let line

    let lines = data.content.split('\n')
    let tokens = [];
    let content = null

    lines.forEach((line,numberOfLine) => {
        //TODO: Change to #
        line = line.replace(/</mg,'\n<').replace(/>/mg,'>\n').trim()

        tokens = line.split('\n')

        //console.log('TOKENS IN LINE ' + tokens)

        tokens.forEach(token=>{

            if ( token.startsWith('<') && token.endsWith('>') )
            {
                if(content) {
                    //console.log("TOKEN FOUND " + content)
                    data.tokens.push({value: content, line: numberOfLine + 1})

                    content = null
                }

                content = token

                //console.log("TOKEN BUILDING " + content)
                //console.log("TOKEN FOUND " + content)

                data.tokens.push({value: content, line: numberOfLine + 1})

                content = null
            }
            else if(token.startsWith('<'))
            {   
                if(content) {
                    //console.log("TOKEN FOUND " + content)
                    data.tokens.push({value: content, line: numberOfLine + 1})

                    content = null
                }

                content = token
                //console.log("TOKEN BUILDING " + content)

            }else if(token.endsWith('>'))
            {
                content += " " + token
                //console.log("TOKEN BUILDING " + content)
                //console.log("TOKEN FOUND " + content)
                data.tokens.push({value: content, line: numberOfLine + 1})

                content = null
            }
            else
            {
                if(!content)
                {
                    content = token
                    //console.log("TOKEN BUILDING " + content)
                }
                else
                { 
                    content += " " + token
                    //console.log("TOKEN BUILDING " + content)
                }
   
            }

        })

    })

    line = undefined
    lines = undefined
}

/**
 * getAttributesInfo - returns the attributes info
 * @param {object} info 
 * @param {string} contentTag 
 */
function getAttributesInfo(info,contentTag)
{
    let attributes = contentTag.trim().match(singleTag)
    let validContent = !(!attributes)
    
    info.attributes = []

    if( validContent )
    {
        attributes = attributes.filter( el => el !== null);
        attributes = attributes.filter( el => el.trim() !== '');

        attributes.forEach( t => {
            let name = t.split("=")[0].trim()
            let value = t.replace(name,'').trim()
            let valid = true

            contentTag = contentTag.replace(t,'').trim()

            try {
                value = value.slice(2,-1)
            } catch (error) {
                valid = false
            }

            info.attributes.push({
                name,
                value,
                valid
            })
        })

        contentTag = contentTag.trim()

        if(contentTag !== '')
            info.attributes.push({
                name: null,
                value: contentTag,
                valid: false
            })
        
    }
}

/**
 * analyzes the token info
 * @param {Data} data 
 */
const buildTokensInfo = data => {
    let udpatedTokens = []

    data.tokens.forEach(token => {

        let info = getTokenInfo(token.value)
        let tempToken = {
            value: token.value,
            line: token.line,
            tagType: info.tagType,
            attributes: info.attributes,
            details: info.details,
        }

        udpatedTokens.push(tempToken)
    })

    data.tokens = udpatedTokens
}

/**
 * 
 * @param {Data} data 
 */
const reomveUnnecessaryTokens = (tokens) => {
    let formattedTokens = []

    tokens.forEach(token => {

        if( token.tagType !==  getKeyByValue(LineType,LineType.CONTENT_LINE) && token.tagType !==  getKeyByValue(LineType,LineType.COMMENT_TAG) )
            formattedTokens.push(token)
    })

    return formattedTokens
}

const parseToDataObject = (json) => {
    return new Data([],json.content)
}

module.exports = {
    generateTokens,
    buildTokensInfo,
    reomveUnnecessaryTokens,
    removeWhiteContent,
    removeComments,
    parseToDataObject
}