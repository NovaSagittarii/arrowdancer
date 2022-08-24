// i should really learn react hahahahahhahahhahah
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
const danceIndex = ["6", "5", "4A", "4B", "Alt"]
const constellationIcons = {
  Capricorn: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/cap.png?v=1645390064880",
  Aquarius: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/aqu.png?v=1645390065572",
  Pisces: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/pisces.png?v=1645390066356",
  Aries: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/aries.png?v=1645390122109",
  Taurus: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/tarus.png?v=1645390083001",
  Gemini: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/gemini.png?v=1645390092501",
  Cancer: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/cancer.png?v=1645390097346",
  Leo: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/leo.png?v=1645390095517",
  Virgo: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/virgo.png?v=1645390100219",
  Libra: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/libra.png?v=1645390102671",
  Scorpio: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/scorpio.png?v=1645390063622",
  Sagittarius: "https://cdn.glitch.global/8c4dd34f-ae08-41b3-8b04-db63b5d7973f/sag.png?v=1645390109836"
}
class SelectionUI {
  constructor(centerText, parent=document.body, size=100){
    this.domElement = document.createElement("span");
    const d = this.domElement;
    d.classList.add("selectionUI");
    const p = document.createElement("p");
    p.innerHTML = centerText;
    p.classList.add("selectionLabel");
    if(size!==100){
      d.style.width = d.style.height = size + "px";
      p.style.lineHeight = (size-30)+"px";
    }
    d.append(p);
    const icon = "↖↑↗← →↙↓↘".split("");
    
    for(let i = -1; i <= 1; i ++){
      for(let j = -1; j <= 1; j ++){
        if(!i && !j) continue;
        const e = document.createElement("button"); // "select"
        d.append(e);
        e.style.left = (i+1)/2*size-20 + "px";
        e.style.top = (j+1)/2*size-20 + "px";
        e.classList.add("selectionButton")
        e.metadata = ''+(i+3*j);
        // <option value="volvo">Volvo</option>
        /*const def = document.createElement("option");
        def.value = "";
        const f = document.createElement("option");
        f.value = "normal";
        f.innerHTML = icon[(i+1)+3*(j+1)];
        const anchored = document.createElement("option");
        anchored.value = "anchor";
        anchored.innerHTML = "○";
        e.append(def);
        e.append(f);
        if(!i !== !j) e.append(anchored);*/
        
        e.index = 0;
        e.value = "";
        const options = ["", icon[(i+1)+3*(j+1)]]; if(!i !== !j) options.push("○");
        const states = ["", "normal", "anchor"] // maybe move to class static
        e.addEventListener('click', () => {
          e.innerHTML = options[e.index = (e.index+1)%options.length];
          e.value = states[e.index];
        });
      }
    }
    this.selectElements = Array.from(d.children).splice(1);
    parent.append(d);
  }
  evaluate(){
    return this.selectElements.filter(e => e.value).map(e => +e.metadata +(e.value ==="anchor" ? 10 : 0)*(+e.metadata > 0 ? 1 : -1))
  }
  clear(){
    this.selectElements.forEach(e => e.index=+!!(e.innerHTML = e.value = ""))
  }
}
class BlockBuilderUI {
  constructor(name, parent=document.body, blocks=7){
    this.name = name;
    const outer = document.createElement("div");  // outer.style.border = "1px solid black";
    outer.classList.add("blockBuilderContainer")
    const s1 = document.createElement("select");  // s1.style.height = s1.style.lineHeight = "2em";
    const s2 = document.createElement("select");  // s2.style.height = s2.style.lineHeight = "2em";
    [s1,s2].forEach(s => {
      s.append(document.createElement("option"));
    })
    for(const i in constellationIcons){
      const o = document.createElement("option");
      o.value = i;
      o.innerHTML = i;
      // o.style.background = `80% no-repeat url(${constellationIcons[i]})`;
      // o.style.backgroundSize = 'contain';
      s1.append(o);
    }
    for(const i in danceIndex){
      const o = document.createElement("option");
      o.value = i;
      o.innerHTML = danceIndex[i];
      s2.append(o);
    }
    s1.addEventListener('change', () => {
      s1.style.backgroundImage = `url(${constellationIcons[s1.value]})`;
    });
    s2.addEventListener('change', e => {
      // console.log(s1.value, s2.value);
      this.load(dances[s1.value][s2.value]);
    });
    const c1 = document.createElement("button");
    const c2 = document.createElement("button");
    const c3 = document.createElement("button");
    const o = document.createElement("input");    o.placeholder = "export area";
    this.mirror = document.createElement("input");   this.mirror.type = "checkbox";
    const o3 = document.createElement("label");   o3.innerHTML = "enable gemini";
    this.active = document.createElement("input");   this.active.type = "checkbox";    this.active.checked = true;
    const o4 = document.createElement("label");   o4.innerHTML = "allow movement";
    const d = document.createElement("div");
    c1.innerHTML = "Import";
    c1.addEventListener('click', () => {
      this.load(prompt("dance code?"));
    })
    c2.innerHTML = "Export";
    c2.addEventListener('click', () => {
      o.value = this.exportData();
      o.select();
    })
    c3.innerHTML = "Clear";
    c3.addEventListener('click', () => this.clear())
    this.selections = [... new Array(blocks)].map((_,i) => new SelectionUI(name+(i+1), d));
    outer.append(s1, s2, c1, c2, c3, o, this.mirror, o3, this.active, o4, d);
    parent.append(outer);
    d.style.width = (this.selections[0].domElement.clientWidth+80)*blocks+40+"px";
  }
  exportData(){
    return this.selections.map(s => s.evaluate().filter(a => a).join(' ')).filter(a => a).join(',')
  }
  clear(){
    this.selections.forEach(s => s.clear());
  }
  load(str){
    //try {
      this.clear();
      Block.fromString('c', str)[0].conditionSets.forEach((a,i) => a.forEach(c => {
        const s = this.selections[i].selectElements.filter(a => a.metadata==c.delta)[0];
        s.value = c.anchored?"anchor":"normal";
        s.index = c.anchored?1:0;
        s.click(); // use it to update the innerHTML (very hacky, make a class for it if continue adding!!)
      }));
    //}catch(err){console.error(err)}
  }
}

// const selections = [new SelectionUI(), new SelectionUI(), new SelectionUI()];
// selections.map(s => s.evaluate().join(' ')).join(',')

const blocks = [new BlockBuilderUI("A"), new BlockBuilderUI("B"), new BlockBuilderUI("C")]

const output = document.createElement("code");
// output.style.width = "800px";
// output.style.height = "8em";
// output.spellcheck = "false";

const movementOptions = [1,2,3,4].map(a => {
  const e = document.createElement("input");
  const f = document.createElement("label");
  const g = document.createElement("div");
  e.type = "checkbox";
  e.value = a;
  f.innerHTML = `${a} movements/step (${a}F)`; a + " movements/step (max)"
  g.append(e, f);
  document.body.append(g);
  return e;
})
/*movementOptions[0].disabled = */movementOptions[0].checked = true;

const fastTech = (function(){
  const e = document.createElement("input");
  const f = document.createElement("label");
  const g = document.createElement("div");
  e.type = "checkbox";
  f.innerHTML = "Allow fast tech (only applies to 2F/3F)";
  g.append(e, f);
  document.body.append(g);
  return e;
})();
fastTech.checked = true;

const frog = (function(){
  const e = document.createElement("input");
  const f = document.createElement("label");
  const g = document.createElement("div");
  e.type = "checkbox";
  f.innerHTML = "Enable frog";
  g.append(e, f);
  document.body.append(g);
  return e;
})();

const checkReverse = (function(){
  const e = document.createElement("input");
  const f = document.createElement("label");
  const g = document.createElement("div");
  e.type = "checkbox";
  f.innerHTML = "Check reverse?";
  g.append(e, f);
  document.body.append(g);
  return e;
})(); checkReverse.checked = true;

const cyclicalSolutions = (function(){
  const e = document.createElement("input");
  const f = document.createElement("label");
  const g = document.createElement("div");
  e.type = "checkbox";
  f.innerHTML = "Cyclical solutions (disable for non-cyclic)";
  g.append(e, f);
  document.body.append(g);
  return e;
})(); cyclicalSolutions.checked = true;

let grid;

const solveButton = document.createElement("button");
solveButton.innerHTML = "Solve";
solveButton.addEventListener('click', () => {
  solveButton.innerHTML = "Solving...";
  solveButton.disabled = true;
  try {
    if(!blocks.reduce((a,c) => a&&!!c.exportData(), true)) throw "Dances cannot be empty";
    output.innerHTML = "";
    const res = {};
    for(const i of Array.from(movementOptions).filter(a => a.checked).map(a => +a.value)){
      const temp = blocks.map(b => {
        let block = Block[b.mirror.checked ? "twinFromString" : "fromString"](b.name, b.exportData(), b.active.checked);
        return block
      });
      if(frog.checked) temp.push(Block.frog());
      grid = new Grid(temp);
const t = performance.now();
      const solutions = grid.solve(i, fastTech.checked, cyclicalSolutions.checked);
res[i+"F forward"] = ((performance.now()-t)/1000).toFixed(2) + "s"
      const attacks = grid.conditionSets.flat().reduce((a,b) => a+b.length, 0);
      for(const sol of solutions){ // console.log(sol);
        const seq = sol.map(g => Grid.decodeGrid(g).join('')).join(',');
        const steps = sol.length-2; // seq.split(',').length -1;
        output.innerHTML += ( (`cycle length: ${steps}, atk: ${attacks}, efficiency: ${(attacks/steps).toFixed(2)} atk/st`) + '\n' +
        horizontalMerge(seq.split(',').map(g => Grid.render(g,grid.blocks.map(b=>b.char).join('')))) + '\n'+sol.map(g => Grid.decodeDance(g)).map(d => grid.blocks[grid.conditionSets[d[0]][0][0][0].src].char+d[1]+d[2]).join(' ')/*.replace(/0/g, "-")*/.replace(/[^\d- ]/g, m => `<strong>${m}</strong>`).replace(/ /g, "&nbsp;") + "\n\n" ).replace(/\n/g, "<br>");
        outputDiv.scrollIntoView();
      }
    }
    if(checkReverse.checked){
      output.innerHTML += "<br>---- <strong>reverse cycle</strong> ----</br></br>";
      for(const i of Array.from(movementOptions).filter(a => a.checked).map(a => +a.value)){
        const temp = blocks.map(b => {
          let block = Block[b.mirror.checked ? "twinFromString" : "fromString"](b.name, b.exportData(), b.active.checked);
          return block
        }).reverse();
        if(frog.checked) temp.push(Block.frog());
        const grid = new Grid(temp);
const t = performance.now();
        const solutions = grid.solve(i, fastTech.checked, cyclicalSolutions.checked);
res[i+"F reverse"] = ((performance.now()-t)/1000).toFixed(2) + "s"
        const attacks = grid.conditionSets.flat().reduce((a,b) => a+b.length, 0);
        for(const sol of solutions){ // console.log(sol);
          const seq = sol.map(g => Grid.decodeGrid(g).join('')).join(',');
          const steps = sol.length-2; // seq.split(',').length -1;
          output.innerHTML += ( (`cycle length: ${steps}, atk: ${attacks}, efficiency: ${(attacks/steps).toFixed(2)} atk/st`) + '\n' +
          horizontalMerge(seq.split(',').map(g => Grid.render(g,grid.blocks.map(b=>b.char).join('')))) + '\n'+sol.map(g => Grid.decodeDance(g)).map(d => grid.blocks[grid.conditionSets[d[0]][0][0][0].src].char+d[1]+d[2]).join(' ')/*.replace(/0/g, "-")*/.replace(/[^\d- ]/g, m => `<strong>${m}</strong>`).replace(/ /g, "&nbsp;") + "\n\n" ).replace(/\n/g, "<br>");
          outputDiv.scrollIntoView();
        }
      }
    }
    output.innerHTML += "<br><br>---- performance<br>" + Object.entries(res).map(a => a.join(' ')).join('<br>');
  } catch (error) {
    console.error(error);
    output.innerHTML = "unable to find solution. Make sure you put at least 2 non-empty steps for each sequence.\n" + error;
    outputDiv.scrollIntoView();
  }
  solveButton.disabled = false;
  solveButton.innerHTML = "Solve";
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear All";
clearButton.addEventListener('click', () => blocks.forEach(e => e.clear()));

const outputDiv = document.createElement("div");
outputDiv.className = "outputContainer";
outputDiv.append(output);
document.body.getElementsByTagName("p")[0].append(clearButton);
document.body.append(solveButton, outputDiv);

