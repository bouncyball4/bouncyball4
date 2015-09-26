function dogeify (val) { 
var output = '';
var type = typeof val ;
if (type  === 'object' ) {
if (Array.isArray(val) ) {
            output += 'so '
for ( var i  = 0 ; i  < val.length ; i  += 1 ) {
if (i  === val.length-1 ) {
                    output += ' and '
} else if (i  !== 0 ) {
                    output += ' also '
} 
                output += this.dogeify(val[i])
} 
            output += ' many'
} else {
            output += 'such '
for ( var key in val ) {
                output += '"' + key + '" is ' + this.dogeify(val[key]) + ', '
} 
output = output.replace(/, $/, '');
            output += ' wow'
} 
} else if (type  === 'number' ) {
        output += val.toString(8)
} else if (type  === 'string' ) {
        output += '"' + val + '"'
} else if (type  === 'boolean' ) {
if (val ) {
            output += 'yes'
} else {
            output += 'no'
} 
} else {
        output += '"'+val.toString()+'"'
} 
    return output
} 
function parse (str) { 
str = str.trim();
if (str.charAt(0)  === '"' ) {
if (str.charAt(str.length-1)  === '"' ) {
            return str.substring(1, str.length-1)
} else {
            throw 'Error: not a valid string'
} 
} else if (str.match(/^\d/) ) {
str = str.replace('very', 'e');
str = str.replace('VERY', 'E');
        return parseInt(str, 8)
} else if (str.match(/^so/) ) {
var tr = [];
var nested = 0;
var ss = 0;
var curVal = '';
var things = str.match(/\S+/g);
things.shift();
for ( var i  = 0 ; i  < things.length ; i  += 1 ) {
var kh = false;
var thing = things[i];
var ci = thing.indexOf('"');
while (ci  > -1 ) {
ss = !ss 
ci = thing.indexOf('"', ci+1);
} 
if (!ss  && (thing  === 'so'  || thing  === 'such' ) ) {
                nested += 1
} 
if (!ss  && nested  === 0 ) {
if (thing  === 'and'  || thing  === 'also' ) {
tr.push(this.parse(curVal));
curVal = '' 
kh = true 
} else if (thing  === 'many' ) {
                    break
} 
} else {
if (thing  === 'many'  || thing  === 'wow' ) {
                    nested -= 1
} 
} 
if (!kh ) {
                curVal += thing+" "
} 
} 
tr.push(this.parse(curVal));
        return tr
} else if (str.match(/^such/) ) {
var tokens = ",.!?";
var tr = {};
var curKey = undefined;
var curVal = '';
var ss = false;
var nested = 0;
var things = str.match(/\S+/g);
things.shift();
for ( var i  = 0 ; i  < things.length ; i  += 1 ) {
var kh = false;
var thing = things[i].trim();
var ind = thing.indexOf('"');
var nca = thing;
if (tokens.indexOf(nca.charAt(nca.length-1))  > -1 ) {
nca = nca.substring(0, nca.length-1);
} 
if (thing.charAt(0)  === '"'  && curKey  === undefined  && thing.charAt(thing.length-1)  === '"' ) {
curKey = thing.substring(1, thing.length-1);
kh = true 
} else if (ind  > -1 ) {
var ci = ind;
while (ci  > -1 ) {
ss = !ss 
ci = thing.indexOf('"', ci+1);
} 
} else if (thing  === "such"  || thing  === "so" ) {
                nested += 1
} else if (nca  === "wow"  || nca  === "many" ) {
if (nested  > 0 ) {
                    nested -= 1
if (nested  === 0 ) {
kh = true 
} 
} else {
                    break
} 
} else if (nested  === 0  && !ss  && thing  === "is" ) {
// Ignore "is" 
kh = true 
} 
if (curKey != undefined  && !kh ) {
                curVal += thing+" "
} 
var curTrim = curVal.trim();
if (nested  === 0  && tokens.indexOf(thing.charAt(thing.length-1))  > -1 ) {
if (tokens.indexOf(curTrim.charAt(curTrim.length-1))  > -1 ) {
curVal = curTrim.substring(0, curTrim.length-1);
} else {
curVal = curTrim 
} 
tr[curKey] = this.parse(curVal);
curKey = undefined 
curVal = '' 
} 
} 
tr[curKey] = this.parse(curVal);
        return tr
} else if (str  === 'yes' ) {
        return true
} else if (str  === 'no' ) {
        return false
} 
} 
DSON = {"dogeify": dogeify, "parse": parse}; 
if (typeof module != 'undefined' ) {
module.exports = DSON 
} 

