import * as fs from 'fs';
import * as assert from 'assert';
import * as AST from './ast';

const jsp = require('uglify-js').parser;

var app = jsp.parse(fs.readFileSync('dist/app.js', 'utf8'));
var app_modules = AST.objectValue(AST.callArgument(0, app[1][0][1]));

var rtc = jsp.parse(fs.readFileSync('dist/rtc.js', 'utf8'));
var rtc_modules = AST.objectValue(AST.callArgument(0, AST.assignValue(rtc[1][0][1])));

var vnd = jsp.parse(fs.readFileSync('dist/vendor.js', 'utf8'));
var vnd_modules = AST.objectValue(AST.callArgument(0, AST.assignValue(vnd[1][0][1])));

var all = { 'app.js': app_modules, 'rtc.js': rtc_modules, 'vendor.js': vnd_modules };

checkNoModuleIsFromNodeModules(app_modules);
checkAllModulesAreReferenced(all);
checkNoDuplicates(all);
checkSimilarModules(all);



function checkNoModuleIsFromNodeModules(modules: AST.Object) {
    modules.forEach(m => {
        var name = AST.propertyName(m);

        if(name.match(/\/node_modules\//)) {
            console.error(`Module ${name} is from node_modules directory`);
        }
    });
}

function checkAllModulesAreReferenced(all: {[name: string]: AST.Object}) {
    var refd: { [name: string]: string[] } = {};
    var mods: { [name: string]: string   } = {};

    Object.keys(all).forEach(bundle => {
        all[bundle].forEach(m => {
            var name = AST.propertyName(m);
            mods[name] = bundle;
        });
    });

    Object.keys(all).forEach(bundle => {
        all[bundle].forEach(m => {
            var name = AST.propertyName(m);
            var deps = moduleDeps(AST.propertyValue(m));

            for (var k in deps) {
                var dep = deps[k];

                if (dep === false) {
                    console.log(`Module ${name} in ${bundle} refers to ${k} which is deliberately excluded`);
                } else if (dep === true) {
                    throw Error(`Module ${name} in ${bundle} refers to ${k} which is has the unexpected value true`);
                } else {
                    if (!mods[dep]) {
                        console.error(`Module ${name} in ${bundle} refers to ${dep} which does not exist`);
                    }
                    if (!refd[dep]) {
                        refd[dep] = [];
                    }
                    refd[dep].push(name);
                }
            }
        });
    });

    Object.keys(all).forEach(bundle => {
        all[bundle].forEach(m => {
            var name = AST.propertyName(m);

            if (!refd[name]) {
                console.error(`Module ${name} in ${bundle} is never referenced`);
            }
        });
    });
}

function checkNoDuplicates(all: {[name: string]: AST.Object}) {
    var names: { [name: string]: string } = {};

    Object.keys(all).forEach(bundle => {
        all[bundle].forEach(m => {
            var name = AST.propertyName(m);

            if (names[name]) {
                console.error(`Module ${name} in ${bundle} is already included in ${names[name]}`);
            }

            names[name] = bundle;
        });
    });
}

function shortName(path: string) {
    var i = path.lastIndexOf('/node_modules/');
    if (i < 0) {
        return path;
    } else {
        return path.substr(i + 14);
    }
}

function checkSimilarModules(all: {[name: string]: AST.Object}) {
    var names: { [name: string]: { bundle: string, name: string } } = {};

    Object.keys(all).forEach(bundle => {
        all[bundle].forEach(m => {
            var name = AST.propertyName(m);
            var short = shortName(name);

            if (names[short]) {
                console.error(`Module ${name} in ${bundle} is similar to ${names[short].name} in ${names[short].bundle} (${short})`);
            }

            names[short] = { bundle, name };
        });
    });
}

function moduleDeps(module: AST.Statement): { [name: string]: string | boolean } {
    /*
     *  [ 'array',
     *    [ [ 'function', null, [Object], [Object] ],
     *      [ 'object', [Object] ] ] ]
     */

    var m = AST.arrayValue(module);

    assert(m.length === 2);
    assert(AST.isFunction(m[0]));
    var deps = AST.objectValue(m[1]);
    var r: { [name: string]: string | boolean } = {};

    deps.forEach(item => {
        var name = AST.propertyName(item);
        var value = AST.propertyValue(item);

        assert(AST.isString(value) || AST.isBoolean(value));
        r[name] = AST.scalarValue(value);
    });

    return r;
}
