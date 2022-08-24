function decodeCoordinate(pos){ return [pos%3, ~~(pos/3)]; }
/*
non-anchor  positions  anchors
-4 -3 -2    0 1 2         -13
-1  0 +1    3 4 5     -11      +11
+2 +3 +4    6 7 8         +13
*/
class Condition {
    static fromString(str){ return new Condition((+str)%10, !(Math.abs(+str) <= 10)); }
    constructor(delta, anchored, parent){
        this.delta = delta;
        this.anchored = anchored;
        this.parent = parent || null;
    }
    validate(pos){ // check if a candidate position *can* satisfy the Condition
        const dcol = (this.delta+4)%3 -1;
        const drow = ~~((this.delta+4)/3) -1;
        const [col, row] = decodeCoordinate(pos);
        const x = col + dcol;
        const y = row + drow;
        if(this.anchored){ // o
            if(x >= 0 && x <= 2 && y >= 0 && y <= 2) return false;
        }else{ // > < ^ v
            if(x > 2 || x < 0) return false;
            if(y > 2 || y < 0) return false;
        }
        return true;
    }
}
class Block {
    static fromString(char, str){ return new Block(char, str.split(',').map(s => s.split(' ').map(Condition.fromString))); }
    constructor(char, states){
        this.char = char;
        this.conditionSets = states;
        this.maximumStrictness = 0;
        for(let i = 0; i < states.length; i ++){
            const strictness = states[i].map(c => c.anchored?0.5:1).reduce((a,b) => a+b);
            if(strictness > this.maximumStrictness){
                this.maximumStrictness = strictness;
                this.maximumStrictnessStep = i;
            }
        }
    }
    generateInitialStates(conditionSet){
        let out = [];
        for(let i = 0; i < 9; i ++){
            if(this.conditionSets[conditionSet].map(c => c.validate(i)).reduce((a,b) => a && b)){
                out.push(i);
            }
        }
        return out;
    }
}
class Grid {
    constructor(blocks){
        this.blocks = blocks.sort((a,b) => b.maximumStrictness - a.maximumStrictness);
        this.mostStrictBlock = blocks[0]; // use this as starting point
        this.mostStrictBlockStartPoint = blocks[0].maximumStrictnessStep;
        this.conditionLength = blocks.map(a => a.conditionSets.length).reduce((a,b) => a+b);
    }
    invert(){ this.blocks.push(this.blocks.splice(1, 1)[0]); } // only have to worry about two possible cycle directions in a completely connected graph of 3 nodes
    generateInitialStates(){ // a state satisfying one condition set of a block is guaranteed to be in the dance cycle
        const conditions = this.mostStrictBlock.conditionSets[this.mostStrictBlockStartPoint];
        const candidates = [];
        for(const i of this.mostStrictBlock.generateInitialStates(this.mostStrictBlockStartPoint)){
            for(let j = 0; j < 9; j ++){ if(i == j) continue;
                for(let k = 0; k < 9; k ++){ if(i == k || j == k) continue;
                    const temp = [i,j,k];
                    if(this.verifyGridState(temp, 0, this.mostStrictBlockStartPoint)) candidates.push(temp);
                }
            }
        }
        return candidates;
    }
    generateExtensions(gridState, depth=1, fastTech=true, invalid=null){
        const loc = new Set();
        const out = new Set();
        gridState.forEach(g => loc.add(g));
        for(let i = 0; i < gridState.length; i ++){
            if(invalid && invalid.has(i)) continue;
            if(!invalid) invalid = new Set();
            invalid.add(i);
            const pos = gridState[i];
            const [col, row] = decodeCoordinate(pos);
            for(let k = 0; k < 4; k ++){
                const temp = gridState.slice(0);
                let m = -1;
                switch(k){
                    case 0: if(col > 0){ // <-
                        if(loc.has(pos-1)){
                            const x = decodeCoordinate(pos-1)[0];
                            temp[m = temp.indexOf(pos-1)] += (x==0 || (x==1 && loc.has(pos-2))) ? 1 : -1;
                        }
                        temp[i] -= 1;
                    } break;
                    case 1: if(col < 2){ // ->
                        if(loc.has(pos+1)){
                            const x = decodeCoordinate(pos+1)[0];
                            temp[m = temp.indexOf(pos+1)] += (x==2 || (x==1 && loc.has(pos+2))) ? -1 : 1;
                        }
                        temp[i] += 1;
                    } break;
                    case 2: if(row > 0){ // ^
                        if(loc.has(pos-3)){
                            const y = decodeCoordinate(pos-3)[1];
                            temp[m = temp.indexOf(pos-3)] += (y==0 || (y==1 && loc.has(pos-6))) ? 3 : -3;
                        }
                        temp[i] -= 3;
                    } break;
                    case 3: if(row < 2){ // v
                        if(loc.has(pos+3)){
                            const y = decodeCoordinate(pos+3)[1];
                            temp[m = temp.indexOf(pos+3)] += (y==2 || (y==1 && loc.has(pos+6))) ? -3 : 3;
                        }
                        temp[i] += 3;
                    } break;
                }
                if(m >= 0){ // it ought to exist first...
                    if(!fastTech && invalid.has(m)) continue;
                    if(!fastTech) invalid.add(m);
                }
                out.add(temp.join(''));
                if(depth > 1)
                    for(const o of this.generateExtensions(temp, depth-1, fastTech, invalid))
                        out.add(o);
                if(!fastTech) invalid.delete(m);
            }
            invalid.delete(i);
        }
        return out;
    }
    generateExtensions2(gridState){ // actually works, but only depth=1
        const loc = {};
        const out = [];
        gridState.forEach(g => loc[g] = true);
        for(let i = 0; i < gridState.length; i ++){
            const pos = gridState[i];
            const [col, row] = decodeCoordinate(pos);
            for(let k = 0; k < 4; k ++){
                const temp = gridState.slice(0);
                switch(k){
                    case 0: if(col > 0){ // <-
                        if(loc[pos-1]){
                            const x = decodeCoordinate(pos-1)[0];
                            temp[temp.indexOf(pos-1)] += (x==0 || (x==1 && loc[pos-2])) ? 1 : -1;
                        }
                        temp[i] -= 1;
                        out.push(temp);
                    } break;
                    case 1: if(col < 2){ // ->
                        if(loc[pos+1]){
                            const x = decodeCoordinate(pos+1)[0];
                            temp[temp.indexOf(pos+1)] += (x==2 || (x==1 && loc[pos+2])) ? -1 : 1;
                        }
                        temp[i] += 1;
                        out.push(temp);
                    } break;
                    case 2: if(row > 0){ // ^
                        if(loc[pos-3]){
                            const y = decodeCoordinate(pos-3)[1];
                            temp[temp.indexOf(pos-3)] += (y==0 || (y==1 && loc[pos-6])) ? 3 : -3;
                        }
                        temp[i] -= 3;
                        out.push(temp);
                    } break;
                    case 3: if(row < 2){ // v
                        if(loc[pos+3]){
                            const y = decodeCoordinate(pos+3)[1];
                            temp[temp.indexOf(pos+3)] += (y==2 || (y==1 && loc[pos+6])) ? -3 : 3;
                        }
                        temp[i] += 3;
                        out.push(temp);
                    } break;
                }
            }
        }
        return out;
    }
    verifyGridState(gridState, activeBlock, conditionSet, previousState){
        const pos = gridState[activeBlock];
        const loc = {};
        gridState.forEach((g,i) => loc[g] = i);
        if(previousState) previousState.forEach((g,i) => {
            if(i !== activeBlock)
                loc[g] = g in loc ? true : i;
        }); // afterimage algorithm
        const used = {}; // make sure no double duty can happen
        for(const condition of this.blocks[activeBlock].conditionSets[conditionSet]){
            if(!condition.validate(pos)) return false;
            if(!condition.anchored){
                if(!((pos + condition.delta) in loc)) return false;
                if(loc[pos + condition.delta] !== true){
                    if(used[loc[pos + condition.delta]]) return false; // illegal afterimage cx
                    used[loc[pos + condition.delta]] = true;
                }
            }
        }
        return true;
    }
    findSolution(initialGridState, activeBlock, conditionSet){
        const q = this.generateExtensions2(initialGridState).map(x => [x, x.join("")]);
        while(q.length){
            const visited = {};
            for(const g of q.splice(0)){
                if(this.verifyGridState(g[0], activeBlock, conditionSet)) return g[1];
                if(g[0].join("") in visited) continue;
                visited[g[0].join("")] = true;
                q.push(...(this.generateExtensions2(g[0]).map(x => [x, g[1]+','+x.join("")])));
            }
        }
    }
    findCycle(initialGridStates, steps=1, fastTech=true, visited={}){
        const initialActiveBlock = 0;
        const initialConditionSet = this.mostStrictBlockStartPoint;
        let a = initialActiveBlock, b = initialConditionSet+1; if(b >= this.blocks[a].conditionSets.length){ a=(a+1)%this.blocks.length; b=0; }
        const q = initialGridStates.map(g => [g, g.join(""), a, b, g.join("")]);
        // const visited = {};
        const solutions = new Set();
        while(q.length && !solutions.size){
            const z = q.splice(0);
            for(let [g,seq,a,b,initialState] of z){
                const state = g.join(""); // if(g.length > 3) throw "no";
                // const initialState = seq.substring(0, g.length);
                let prevState = seq.substr(-2*g.length-1, g.length).split(''); if(!prevState.length) prevState = null;
                while((a !== initialActiveBlock || b !== initialConditionSet) && this.verifyGridState(g, a, b, prevState)){ // update a/b state
                    prevState = null; // fade afterimage
                    b ++;
                    if(b >= this.blocks[a].conditionSets.length){
                        a = (a + 1) % this.blocks.length;
                        b = 0;
                    }
                }
                const id = initialState+'_'+a+'_'+b+'_'+state; // initialState (also the goal) differs across instances of the various initialGridState(s)
                if(visited[id]){ continue; }
                visited[id] = true;
                if(a === initialActiveBlock && b === initialConditionSet && initialState === state){
                    return [seq];
                    // solutions.add(seq);
                }
                q.push(...([...this.generateExtensions(g, steps, fastTech)].map(g => [g.split("").map(a => +a),seq+','+g,a,b,initialState])));
            }
        }
        return [...solutions];
    }
    solve(steps=1, fastTech=true){	
        //const forward = this.findCycle(this.generateInitialStates(), steps, fastTech); // this.generateInitialStates().map(a => this.findCycle(a, 0, 0, steps)).sort((a,b) => a.length-b.length)[0];	
        //this.invert();	
            this.invert();
        let temp = this.findCycle(this.generateInitialStates(), steps, fastTech); // this.generateInitialStates().map(a => this.findCycle(a, 0, 0, steps)).sort((a,b) => a.length-b.length)[0] || forward;	
        /*if(temp[0].length > forward[0].length){	
            this.invert();	
            temp = forward;	
        }*/	
            this.invert();
        // if(temp[0].length == forward[0].length) temp.push(...forward);	
        // console.log(temp);	
        // console.log(this.backtrackConditions(temp));	
        return temp; //[temp, this.blocks.map(b => b.char).join("")];	
    }
    backtrackConditions(path, initialActiveBlock=0, initialConditionSet=this.mostStrictBlockStartPoint, triedOpposite=false){
        let a = initialActiveBlock, b = initialConditionSet+1, out = "", prev = null;
        if(b >= this.blocks[a].conditionSets.length){ a=(a+1)%this.blocks.length; b=0; }
        for(const g of path.split(",").map(a => a.split("").map(a=>+a))){
            let updates = out?0:1, blockStart = out?"":this.blocks[a].char;
            while((a !== initialActiveBlock || b !== initialConditionSet) && this.verifyGridState(g, a, b, prev)) {
                prev = null;
                if(b == 0) blockStart += this.blocks[a].char;
                b ++;
                updates ++;
                if(b >= this.blocks[a].conditionSets.length){
                    a = (a + 1) % this.blocks.length;
                    b = 0;
                }
            }
            out += updates.toString().padStart(2) + blockStart.padEnd(2);
            prev = g;
        }
        if(!triedOpposite && a !== initialActiveBlock && b !== initialConditionSet){ // sooo this is a thing... that should probably not be in the solver classes
          this.invert();
          out = this.backtrackConditions(path, initialActiveBlock, initialConditionSet, true);
          this.invert();
        }
        return out;
    }
    static render(str, disp="cun"){
        const z = str.split("").map(x => +x);
        const d = [...new Array(3)].map(a => [...new Array(3)].map(a => '.'));
        for(var i in z){
            const c = decodeCoordinate(z[i]);
            d[c[1]][c[0]] = disp[i];
        }
        return d.map(x => x.join('')).join('\n');
    }
}

function horizontalMerge(arr){
    let out = [... new Array(arr[0].split('\n').length)].map(a => "");
    arr.forEach(sec => sec.split('\n').forEach((line, i) => out[i] += " " + line));
    return out.map(a => a.trim()).join('\n')
}
function displaySolution(sol, grid){
    const seq = sol[0];
    const steps = seq.split(',').length -1;
    const attacks = grid.conditionLength;
    console.log(`cycle length: ${steps}, atk: ${attacks}, efficiency: ${(attacks/steps).toFixed(2)} atk/st`); 
    console.log(horizontalMerge(seq.split(',').map(g => Grid.render(g, sol[1]))));
}

// grid.generateExtensions([0,4,8])
// grid.verifyGridState([4,1,7], 0, 0)
// grid.verifyGridState([3,1,7], 0, 1)
// grid.findSolution([4,1,7], 0, 1)
// var seq = grid.findCycle([4,7,1],0,0)
// renderSequence(seq);

/*
non-anchor  positions  anchors
-4 -3 -2    0 1 2         -13
-1  0 +1    3 4 5     -11      +11
+2 +3 +4    6 7 8         +13
*/
/*
var grid = new Grid([
    Block.fromString('c',"-3 3,-2 4"), // celsius
    Block.fromString('n',"1,-1,-3,3"), // nightingale
    Block.fromString('u',"13 -4,13 -3,13 -2")]) // curie
var t = performance.now()
displaySolution(grid.solve(1), grid)
console.log(performance.now() - t)
var t = performance.now()
//displaySolution(grid.solve(2), grid)
console.log(performance.now() - t)
// grid.findCycle([0,1,2],0,0,1);



*/


const dances = {
    Capricorn: ["-4,-3 -1,-2 2,1 3,4", "-1 1,4,3,2,1", "2,-2,1 3,4", "2 4,3,-3,-2", "2 4,1,3"],
    Aquarius: ["-3 2,-2 4,-11,1", "-2 1,-3,-4,11,-1 2", "-1,4,1,-2,-4 -3", "2,-1 1,11", "-11 4,1,-2"],
    Pisces: ["-1,-2,-4 -3,-3 -2,-4 -3", "-4 -3,-3 -2,-4 -3,-3 -2", "2,1,3,4,3", "1 4,3 4", "-4 -3,-3 -2"],
    Aries: ["2,3,2 4,-13,3 4", "-4,-1,2,-1 1", "3,-3,-11,-2 1", "-4 11,-3,-2", "-2,-13,-2"],
    Taurus: ["-3 -1,-3 1,13", "-1,1,-3,3", "-3,1,3,-1,-3", "-3 1,1 3,-1 3,-3 -1", "1,-1,-3,3"],
    Gemini: ["1,-2,-3,3", "-4 -2,-3,3,2 4", "1,-2,-3,-4,-1", "3,-2 4,-3", "-2 4,1,-1,-4 2"],
    Cancer: ["-1,4,-4,1,-1", "-11,-1,11,1,-11", "11,-4,3,-3,-11", "2 4,-1 1,-4 -2", "-1 1,-4 -2"],
    Leo: ["-13 3,2,3,4,11", "4,1,-2,-3", "-3,4,-13,-1 4", "-4,-1,2,3", "-13 3,2 4"],
    Virgo: ["2 3,3 4,2,-3,-4 -1,-3 -1", "-3 13,-3 2,-4,-3 13,-2,-3 13", "-3 2,-2,1,-1 3", "13,-3 4,-4,-3", "-3 2,-2 3"],
    Libra: ["-2 -1,-4 -2,-4 1", "-2 -1,-4 1,-13,2,4", "-4,4,-1 1,2,-2", "-1 1,-4,-2,-13", "-2 -1,-4 1"],
    Scorpio: ["-4 13,-3,-2 13,-3,-4 13", "-1,1,-3 13,3,-3 13", "13,-4,-2,13", "-1,1,-3 13", "-4 13,-3,-2 13"],
    Sagittarius: ["-3 3,13,-4,-3,-2", "-3 3,-2 4,-11,-3 3", "-3 3,13,11,-4", "-3 3,13", "-3 3,-2 4"]
}

/*
var grid = new Grid("11,-4,3,-3,-11|-13 3,2,3,4,11|2 -3,3 -2".split('|').map((a,i) => Block.fromString(i, a)));
var sol1 = grid.solve(2,false);
console.log(sol1);
console.log((sol1[0]?.length-3)/4);
process.exit(); */

const danceIndex = ["6", "5", "4A", "4B", "Alt"]
const constellations = Object.keys(dances);
const fs = require('fs');
let ct1 = 0;let ct2=0;
for(let i = 0; i < constellations.length; i ++){
    for(let j = i+1; j < constellations.length; j ++){
        for(let k = j+1; k < constellations.length; k ++){
            console.log(++ct1);
            // if(ct1 < 17) continue;
            calculateVariations(i,j,k);
            //break;
        }//break;
    }//break;
}

function calculateVariations(a,b,c){
    var ctx = 0;
    for(let i = 0; i < danceIndex.length; i ++){
        for(let j = 0; j < danceIndex.length; j ++){
            for(let k = 0; k < danceIndex.length; k ++){
                const A = Block.fromString('A',dances[constellations[a]][i]);
                const B = Block.fromString('B',dances[constellations[b]][j]);
                const C = Block.fromString('C',dances[constellations[c]][k]);
                var grid = new Grid([A, B, C])
                const A2 = Block.fromString('A',dances[constellations[a]][i]);
                const B2 = Block.fromString('B',dances[constellations[b]][j]);
                const C2 = Block.fromString('C',dances[constellations[c]][k]);
                var reversed = new Grid([A2, C2, B2])

                var o = constellations[a] + " " + danceIndex[i] + "," + constellations[b] + " " + danceIndex[j] + "," + constellations[c] + " " + danceIndex[k];
                const atk = grid.conditionLength;
                var SOL1 = grid.solve(1, false)[0];
                var out = o+","+atk
                +","+(((SOL1?.length-3)/4)||999) +","+ ","+SOL1.replace(/,/g,"|")+","
                /*var SOL1 = grid.solve(2, false)[0];
                var SOL2 = reversed.solve(2, false)[0];
                var out = o+","+atk
                +","+(((SOL1?.length-3)/4)||999) +","+ (((SOL2?.length-3)/4)||999)+","+SOL1.replace(/,/g,"|")+","+SOL2.replace(/,/g,"|")*/
                // +","+Math.min(grid.solve(1, false)[0]?.length-2||999, reversed.solve(1, false)[0]?.length-2||999)
                // +","+Math.min(grid.solve(2, false)[0]?.length-2||999, reversed.solve(2, false)[0]?.length-2||999)
                // +","+Math.min(grid.solve(2, true)[0]?.length-2||999, reversed.solve(2, true)[0]?.length-2||999);
                console.log(ct1, ++ctx);
                fs.appendFileSync('output', out+'\n');
                //break;
            }//break;
        }//break;
    }
}

