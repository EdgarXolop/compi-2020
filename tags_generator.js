const fs = require('fs')

let content = fs.readFileSync('tags.txt', 'utf8')

let config = {
    tags: []
}

content.split('\n').forEach(tag => {

    config.tags.push({
        name: tag.trim(0).toLowerCase(),
        ignore: false,
        autoClose: false
    })

})

fs.writeFile('functions/config.json',JSON.stringify(config),() => console.log("config created"))