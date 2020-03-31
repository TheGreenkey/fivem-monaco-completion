const fs = require('fs').promises
const fetch = require('node-fetch')
const LuaLanguage = require('./lua-language.js')
const config = require('./config.js')

const handleErr = (err) => console.error(err)

async function main() {
  const response = await fetch(config.natives_url)
    .then(r => r.json())
    .catch(handleErr)
  
  const transformedData = Object
    .keys(response)
    .map(key =>
      Object
        .keys(response[key])
        .map(innerKey => response[key][innerKey])
    )
    .flat()
    .map(native =>
      Object.assign(native, {
        insertText: LuaLanguage.formatNativeCode(native),
        documentation: native.description,
        label: LuaLanguage.renderName(native)
      })
    )
    .map(obj => {
      config.properties_to_destroy.forEach(k => delete obj[k])
      return obj
    })
    
    fs.writeFile(config.output_file, JSON.stringify(transformedData))
    .then(() => console.log("Output written to " + config.output_file))
    .catch(handleErr)
  }
  
  main()
  