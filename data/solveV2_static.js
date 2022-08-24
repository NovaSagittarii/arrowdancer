// gemini dumb but also really really really good. it’s still dumb though
// its really dumb actually
/*
non-anchor  positions  anchors
-4 -3 -2    0 1 2         -13
-1  0 +1    3 4 5     -11      +11
+2 +3 +4    6 7 8         +13
*/

function decodeCoordinate(pos){ return [pos%3, ~~(pos/3)]; }
function debug(x){ console.log(x); return x; }
class Condition {
    static fromString(str){ return new Condition((+str)%10, !(Math.abs(+str) <= 10)); }
    constructor(delta, anchored){
        this.delta = delta;
        this.anchored = anchored;
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
    static fromString(char, str, moveable){ return [new Block(char, str.split(',').map(s => s.split(' ').map(Condition.fromString)), moveable)]; }
    static twinFromString(char, str, moveable){
        const base = new Block(char.toUpperCase(), str.split(',').map(s => s.split(' ').map(Condition.fromString)), moveable);
        const twin = new Block(char.toLowerCase(), base.conditionSets.map(cs => cs.map(c => new Condition(-c.delta, c.anchored))), moveable);
        base.maximumStrictness = twin.maximumStrictness = 0; // don’t bother touching this since initialStates with these also need to consider all possible combinations of progress
        return [base, twin];
    }
    static frog(char='f'){ return [new Block(char, [], false)]; }
    constructor(char, states, moveable=true){
        this.char = char;
        this.conditionSets = states;
        this.maximumStrictness = Math.max(...states.map(set => set.map(c => c.anchored?0.5:1).reduce((a,b) => a+b)));
        this.moveable = moveable; // can u move it
    }
    static generateInitialStates(conditionSet){
        let out = [];
        for(let i = 0; i < 9; i ++){
            if(conditionSet.map(c => c.validate(i)).reduce((a,b) => a && b)){
                out.push(i);
            }
        }
        return out;
    }
}
// Block.twinFromString('g', "-2 4,1,-1,-4 2")
function explore(g,c){
    const x = Block.generateInitialStates(g.conditionSets[c[0]][c[1]][c[2]]).length;
    const y = g.generateInitialStates(c).length
    console.log(x, y, y/x);
}

class Grid {
    constructor(blocks){ // oh yeah, it turns out min/max step doesn’t really matter, they’re all guaranteed to be in the dance cycle
        this.blocks = blocks.flat()
        this.blocks.forEach((b,i) => {
            b.id = i;
            b.conditionSets.forEach(cs => cs.map(c => c.src = i))
        });
        this.conditionSets = blocks.map(blockSet => blockSet.map(b => b.conditionSets))
        this.maximumStrictness = 0;
        // const maximumStrictness = Math.max(...blocks.flat().map(b => b.maximumStrictness));
        for(let i = 0; i < this.conditionSets.length; i ++){
            if(this.conditionSets[i].length > 1) continue; // gemini danger
            const conditionSet = this.conditionSets[i][0];
            for(let j = 0; j < conditionSet.length; j ++){
                const strictness = conditionSet[j].map(c => c.anchored?0.5:1).reduce((a,b) => a+b);
                if(strictness > this.maximumStrictness){
                    this.maximumStrictness = strictness;
                    this.initialCondition = conditionSet[j];
                    this.initialState = [i, j, 0];
                }
            }
        }
    }
    generateInitialStateExtension(initialBlock, initialCondition=this.initialCondition, head=[], out=[]){
        if(head && head.length >= this.blocks.length){
            if(this.verifyGridState(head, initialCondition)) out.push(head);
            return;
        }
        if(head.length == initialBlock){
            for(let i of Block.generateInitialStates(initialCondition)){
                if(head.indexOf(i) > -1) continue; // no overlap
                this.generateInitialStateExtension(initialBlock, initialCondition, head.concat(i), out);
            }
        }else{
            for(let i = 0; i < 9; i ++){
                if(head.indexOf(i) > -1) continue; // no overlap
                this.generateInitialStateExtension(initialBlock, initialCondition, head.concat(i), out);
            }
        }
        return out;
    }
    generateInitialStates(st=this.initialCondition[0].src, initialCondition=this.initialCondition){
        //return Block.generateInitialStates(this.initialCondition).map(x => this.generateInitialStateExtension([x])).flat()
        return this.generateInitialStateExtension(st, initialCondition);
    }
    generateExtensions(gridState, depth=1, fastTech=true, invalid=new Set(this.blocks.filter(a => !a.moveable).map(a => a.id))){
        const loc = new Set();
        const out = []; //new Set();
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
                out.push(temp); // out.add(temp.join(''));
                if(depth > 1)
                    for(const o of this.generateExtensions(temp, depth-1, fastTech, invalid))
                        out.push(o); // out.add(o);
                if(!fastTech) invalid.delete(m);
            }
            invalid.delete(i);
        }
        return out;
    }
    verifyGridState(gridState, conditionSet, previousState){
        if(!conditionSet.length) return true; // probably a frog
        const activeBlock = conditionSet[0].src;
        const pos = gridState[activeBlock];
        const loc = {};
        gridState.forEach((g,i) => loc[g] = i);
        if(previousState) previousState.forEach((g,i) => {
            if(i !== activeBlock)
                loc[g] = g in loc ? true : i;
        }); // afterimage algorithm
        const used = {}; // make sure no double duty can happen
        for(const condition of conditionSet){
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
    updateGridState(gridState, danceState, prevState=[], initialDanceState=this.initialState){
        let canContinue = true;
        while(canContinue){
            if(initialDanceState[0] === danceState[0] && initialDanceState[1] === danceState[1] && initialDanceState[2] === danceState[2]) break;
            canContinue = false;
            const activeDances = this.conditionSets[danceState[0]];
            for(let i = 0; i < activeDances.length; i ++){ // typically this section only needs to run once but gemini is a thing and i don’t like that
                if(i>=2) throw "hey, this doesn’t support 3+ concurrent dances";
                const conditionSet = activeDances[i][danceState[1+i]];
                if(conditionSet && this.verifyGridState(gridState, conditionSet, prevState)){
                    canContinue = true;
                    danceState[1+i] += 1;
                }
            }
            if(!activeDances[0].length) canContinue = true; // probably a frog
            prevState = null; // fade afterimage
            // if(!canContinue) break; // there's some funny control flow here... but oh well
            // canContinue = false;
            // for(let i = 0; i < danceState.length; i ++) if(danceState[i] !== initialDanceState[i]) canContinue = true;
            if(canContinue || !activeDances[0].length){ // edge case for dumb frog
                let advance = true;
                for(let i = 0; i < activeDances.length; i ++)
                    if(danceState[1+i] < activeDances[i].length) advance = false; // all active dances have not completed yet
                if(advance){
                    danceState[0] = (danceState[0]+1)%this.conditionSets.length;
                    danceState[1] = danceState[2] = 0;
                }
            }
        }
        return danceState
    }// static res ={};
    encodeGridState(gridState, danceState, prevGridState=null, initialDanceState=this.initialState){
        return Grid.encodeGridState(gridState, this.updateGridState(gridState, danceState, prevGridState, initialDanceState))
    }
    findCycle(initialGridStates, steps=1, fastTech=true, initialDanceState=this.initialState, cyclical=true){
        // join/split really really hurts the performance so bitwise i resorted to ;w;
        let ids = initialDanceState.slice(0); // [a,c0,c1]
        ids[1] ++; // c0
        if(ids[1] >= this.conditionSets[ids[0]][0].length){ ids[1]=0; ids[0]++; }
        if(ids[0] >= this.conditionSets.length) ids[0]=0;
        const init = initialGridStates.map(g => [Grid.encodeGridState(g, initialDanceState), this.encodeGridState(g, ids.slice(0))]);
        let solutions = [];
        for(const start of init){ // init being initial states
            let limit = (solutions[0]&&solutions[0].length-2)||99;
            const q = [start];
            const candidates = [];
            const visited = new Set();
            while(q.length && !candidates.length && --limit){
                const z = q.splice(0); //console.log(z.length);
                for(let states of z){
                    const state = states[states.length-1];
                    const g = Grid.decodeGrid(state);
                    const danceState = Grid.decodeDance(state);
                    let prevState = states[state.length-2];
    // Grid.res[danceState] = Grid.res[danceState] ? Grid.res[danceState]+1 : 1;
                    prevState = prevState ? Grid.decodeGrid(prevState) : null;
                    // this.updateGridState(g, danceState, prevState, initialDanceState);
                    if(states.length > 1 && cyclical ? states[0] == state : !((states[0]^state)>>20)){
                        // return [seq];
                        candidates.push(states);
                        continue;
                    }
                    if(visited.has(state)){ continue; }
                    visited.add(state);
                    for(const ext of this.generateExtensions(g, steps, fastTech)){
                        const next = this.encodeGridState(ext, danceState.slice(0), g, initialDanceState);
                        if(next !== state) q.push(states.concat(next));
                    }

                    // q.push(...([...this.generateExtensions(g, steps, fastTech)].map(g => [g.split("").map(a => +a),seq+','+g,a,b,initialState])));
                }
            }
            if(candidates.length){
                if(solutions[0] && candidates[0].length === solutions[0].length) solutions.push(...candidates);
                if(!solutions.length || candidates[0].length < solutions[0].length) solutions = candidates;
            }
        }
        return solutions;
    }
    solve(steps=1, fastTech=true, cyclical=true){
        if(cyclical) return this.findCycle(this.generateInitialStates(), steps, fastTech);
        else {
            return [].concat(...this.conditionSets.map((a, i) => this.findCycle(this.generateInitialStates(i, a[0][0]), steps, fastTech, [i,0,0], cyclical)));
        }
    }
    static encodeGridState(state, progress){ // [b0,b1,b2,b3,b4] [a,c0,c1]
        return (state[0]+1)<<0 | (state[1]+1)<<4 | (state[2]+1)<<8 | (state[3]+1)<<12 | (state[4]+1)<<16 | (progress[0]+1)<<20 | (progress[1]+1)<<24 | (progress[2]+1)<<28; // apparently bitwise is wayyyyy faster than join
    }
    static decodeGrid(n){ // making arrays is actually really free apparently??
        return [(n>>0&15)-1, (n>>4&15)-1, (n>>8&15)-1, (n>>12&15)-1, (n>>16&15)-1].filter(a => a>=0)
    }
    static decodeDance(n){
        return [(n>>20&15)-1, (n>>24&15)-1, (n>>28&15)-1]
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
function disp(sol){
    console.log(sol.split(',').length-2 + '\n'+horizontalMerge(sol.split(',').map(g => Grid.render(g,grid.blocks.map(b=>b.char).join('')))) + '\n'+res[0].map(g => Grid.decodeDance(g)).map(d => grid.blocks[grid.conditionSets[d[0]][0][0][0].src].char+d[1]+d[2]).join(' ') +'\n'+grid.initialState);
}


/**




fhjsakdf
sdf
sdf



**/


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
for(let i = 0; i < constellations.length; i ++){if(i)break;
    for(let j = i+1; j < constellations.length; j ++){
        for(let k = j+1; k < constellations.length; k ++){
            console.log(++ct1);
            // if(ct1 < 17) continue;
            calculateVariations(i,j,k);
            //break;
        }//break;
    }//break;
}
function getBlock(l, x, y, m){
    return Block.fromString(l, dances[constellations[x]][y], m);
    // return Block[constellations[x] == "Gemini" ? "twinFromString" : "fromString"](l, dances[constellations[x]][y], m);
}
function calculateVariations(a,b,c){
    var ctx = 0;
    var moving = false;
    for(let i = 0; i < danceIndex.length; i ++){
        for(let j = 0; j < danceIndex.length; j ++){
            for(let k = 0; k < danceIndex.length; k ++){
                const A = getBlock('A', a, i, moving);
                const B = getBlock('B', b, j, moving);
                const C = getBlock('C', c, k, moving);
                var grid = new Grid([A, B, C, Block.frog(), Block.frog(), Block.frog()])
                const A2 = getBlock('A', a, i, moving);
                const B2 = getBlock('B', b, j, moving);
                const C2 = getBlock('C', c, k, moving);
                var reversed = new Grid([A2, C2, B2, Block.frog(), Block.frog(), Block.frog()])
                
                var o = constellations[a] + " " + danceIndex[i] + "," + constellations[b] + " " + danceIndex[j] + "," + constellations[c] + " " + danceIndex[k];
                const atk = grid.conditionLength;
                var SOL1 = grid.solve(1, false)[0];
                if(SOL1 !== undefined) console.log(o, atk, SOL1);
                var out = o+","+atk
                +","+(((SOL1?.length-3)/4)||999) +","+ ","+","
                /*var SOL1 = grid.solve(2, false)[0];
                var SOL2 = reversed.solve(2, false)[0];
                var out = o+","+atk
                +","+(((SOL1?.length-3)/4)||999) +","+ (((SOL2?.length-3)/4)||999)+","+SOL1.replace(/,/g,"|")+","+SOL2.replace(/,/g,"|")*/
                // +","+Math.min(grid.solve(1, false)[0]?.length-2||999, reversed.solve(1, false)[0]?.length-2||999)
                // +","+Math.min(grid.solve(2, false)[0]?.length-2||999, reversed.solve(2, false)[0]?.length-2||999)
                // +","+Math.min(grid.solve(2, true)[0]?.length-2||999, reversed.solve(2, true)[0]?.length-2||999);
                ++ctx;//console.log(ct1, ++ctx);
                if(SOL1 !== undefined) fs.appendFileSync('output', out+'\n');
                //break;
            }//break;
        }//break;
    }
}

