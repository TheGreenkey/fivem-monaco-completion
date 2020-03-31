const uppercaseFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const makeNative = (name) => uppercaseFirst(name.toLowerCase().replace('0x', 'n_0x').replace(/_([a-z])/g, (regs) => regs[1].toUpperCase()));
const formatParams = (native) => native.params.map(param => `${param.type} ${param.name}`).join(', ');
const renderName = (native) => native.name || native.hash;

module.exports = {
    name: 'lua',
    lowlightName: 'lua',
    renderName(native) {
        return makeNative(renderName(native));
    },
    formatNativeCode(native) {
        return `${this.renderName(native)}(${this.formatParams(native)})`;
    },
  
    mapType(type) {
        switch (type) {
            case 'BOOL':
                return 'boolean';
            case 'int':
                return 'integer';
            case 'float':
                return 'number';
            case 'char*':
                return 'string';
            case 'Vector3':
                return 'vector3';
        }
  
        return type;
    },
  
    formatResults(native) {
        const results = [];
  
        if (native.results !== 'void') {
            results.push([this.mapType(native.results), 'retval']);
        }
  
        results.push(...native.params
            .filter(param => /\*$/.test(param.type) && param.type !== 'char*')
            .map(param => [this.mapType(param.type.replace('*', '')), param.name])
        );
  
        if (results.length === 0) {
            return '';
        }
  
        return 'local ' + results.map(([type, name]) => `${name} --[[ ${type} ]]`).join(', ');
    },
  
    formatParams(native) {
        const tabs = (this.formatResults(native).length === 0) ? '' : '\t';
  
        const pl = native.params
            .filter(param => !/\*$/.test(param.type) || param.type === 'char*')
            .map((param, i) => `\${${i + 1}:${param.name} [${this.mapType(param.type)}]}`)
            .join(`, `);
  
        if (pl.length === 0) {
            return '';
        }
  
        return `${pl}`;
    }
  }