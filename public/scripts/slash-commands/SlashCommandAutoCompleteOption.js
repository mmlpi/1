import { SlashCommand } from './SlashCommand.js';



export class SlashCommandFuzzyScore {
    /**@type {number}*/ start;
    /**@type {number}*/ longestConsecutive;

    /**
     * @param {number} start
     * @param {number} longestConsecutive
     */
    constructor(start, longestConsecutive) {
        this.start = start;
        this.longestConsecutive = longestConsecutive;
    }
}


export class SlashCommandAutoCompleteOption {
    /**@type {string|SlashCommand}*/ value;
    /**@type {string}*/ name;
    /**@type {SlashCommandFuzzyScore}*/ score;
    /**@type {string}*/ replacer;
    /**@type {HTMLElement}*/ dom;


    /**
     * @param {string|SlashCommand} value
     * @param {string} name
     */
    constructor(value, name) {
        this.value = value;
        this.name = name;
    }


    makeItem(key, typeIcon, noSlash, namedArguments = [], unnamedArguments = [], returnType = 'void', helpString = '', aliasList = []) {
        const li = document.createElement('li'); {
            li.classList.add('item');
            const type = document.createElement('span'); {
                type.classList.add('type');
                type.classList.add('monospace');
                type.textContent = typeIcon;
                li.append(type);
            }
            const specs = document.createElement('span'); {
                specs.classList.add('specs');
                const name = document.createElement('span'); {
                    name.classList.add('name');
                    name.classList.add('monospace');
                    name.textContent = noSlash ? '' : '/';
                    key.split('').forEach(char=>{
                        const span = document.createElement('span'); {
                            span.textContent = char;
                            name.append(span);
                        }
                    });
                    specs.append(name);
                }
                const body = document.createElement('span'); {
                    body.classList.add('body');
                    const args = document.createElement('span'); {
                        args.classList.add('arguments');
                        for (const arg of namedArguments) {
                            const argItem = document.createElement('span'); {
                                argItem.classList.add('argument');
                                argItem.classList.add('namedArgument');
                                if (!arg.isRequired || (arg.defaultValue ?? false)) argItem.classList.add('optional');
                                if (arg.acceptsMultiple) argItem.classList.add('multiple');
                                const name = document.createElement('span'); {
                                    name.classList.add('argument-name');
                                    name.textContent = arg.name;
                                    argItem.append(name);
                                }
                                if (arg.enumList.length > 0) {
                                    const enums = document.createElement('span'); {
                                        enums.classList.add('argument-enums');
                                        for (const e of arg.enumList) {
                                            const enumItem = document.createElement('span'); {
                                                enumItem.classList.add('argument-enum');
                                                enumItem.textContent = e;
                                                enums.append(enumItem);
                                            }
                                        }
                                        argItem.append(enums);
                                    }
                                } else {
                                    const types = document.createElement('span'); {
                                        types.classList.add('argument-types');
                                        for (const t of arg.typeList) {
                                            const type = document.createElement('span'); {
                                                type.classList.add('argument-type');
                                                type.textContent = t;
                                                types.append(type);
                                            }
                                        }
                                        argItem.append(types);
                                    }
                                }
                                args.append(argItem);
                            }
                        }
                        for (const arg of unnamedArguments) {
                            const argItem = document.createElement('span'); {
                                argItem.classList.add('argument');
                                argItem.classList.add('unnamedArgument');
                                if (!arg.isRequired || (arg.defaultValue ?? false)) argItem.classList.add('optional');
                                if (arg.acceptsMultiple) argItem.classList.add('multiple');
                                if (arg.enumList.length > 0) {
                                    const enums = document.createElement('span'); {
                                        enums.classList.add('argument-enums');
                                        for (const e of arg.enumList) {
                                            const enumItem = document.createElement('span'); {
                                                enumItem.classList.add('argument-enum');
                                                enumItem.textContent = e;
                                                enums.append(enumItem);
                                            }
                                        }
                                        argItem.append(enums);
                                    }
                                } else {
                                    const types = document.createElement('span'); {
                                        types.classList.add('argument-types');
                                        for (const t of arg.typeList) {
                                            const type = document.createElement('span'); {
                                                type.classList.add('argument-type');
                                                type.textContent = t;
                                                types.append(type);
                                            }
                                        }
                                        argItem.append(types);
                                    }
                                }
                                args.append(argItem);
                            }
                        }
                        body.append(args);
                    }
                    const returns = document.createElement('span'); {
                        returns.classList.add('returns');
                        returns.textContent = returnType ?? 'void';
                        // body.append(returns);
                    }
                    specs.append(body);
                }
                li.append(specs);
            }
            const help = document.createElement('span'); {
                help.classList.add('help');
                const content = document.createElement('span'); {
                    content.classList.add('helpContent');
                    content.innerHTML = helpString;
                    const text = content.textContent;
                    content.innerHTML = '';
                    content.textContent = text;
                    help.append(content);
                }
                li.append(help);
            }
            if (aliasList.length > 0) {
                const aliases = document.createElement('span'); {
                    aliases.classList.add('aliases');
                    aliases.append(' (alias: ');
                    for (const aliasName of aliasList) {
                        const alias = document.createElement('span'); {
                            alias.classList.add('monospace');
                            alias.textContent = `/${aliasName}`;
                            aliases.append(alias);
                        }
                    }
                    aliases.append(')');
                    // li.append(aliases);
                }
            }
        }
        return li;
    }


    renderItem() {
        throw new Error(`${this.constructor.name}.renderItem() is not implemented`);
    }


    renderDetails() {
        throw new Error(`${this.constructor.name}.renderDetails() is not implemented`);
    }
}
