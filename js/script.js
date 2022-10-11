// select the list items
let ul = document.querySelectorAll('li');
const tiles= ["1", "2", "3", "4", "5", "6", "7", "8", ""]
let clicked = "";
let clickedval = "";
let clickable = [];
let click_vals = [];
let click_direction = [];
let empty = "";
const state = {}
state.content = tiles;
let curnode = "";
let solution = [];

const onclick_handler = ev => {
    //get clicked value
    clicked = ev.target.id;
    clickedval = ev.target.innerText;
    //console.log("Clicked!",clicked, empty);
    //find destination always -> empty variable
    //commence swap data
    //document.getElementById(empty).classList.remove("empty")
    //let data = document.getElementById(clicked).innerText;
    //ev.target.innerText = document.getElementById(empty).innerText;
    //document.getElementById(empty).innerText = data;

    let nstate = forward_state(state.content,ev.target.innerText); //figure out state first
    state.content = nstate.split(','); //unpack from string to array
    fillGrid(ul,state.content); //update UI

    // get new state after dropping
   // state.content = getState(ul);
    // get new dimention from the state after dropping
    state.dimension = getDimension(state);

    removeallclick(ul);
    setDroppable(ul);
    setDraggable(ul);
    //console.log(clickable,'test',clickedval,clicked);
    if(checkwin(state.content)){
        showModal();
    }
    //ev.dataTransfer.setData("text/plain", ev.target.id)
    //ev.dataTransfer.dropEffect = "move";
}



const checkwin = (curstate) => {
    if (curstate.toString() == "1,2,3,4,5,6,7,8,"){
        return true;
    }
    return false;
}

const showModal = () => {
    document.getElementById('message').innerText = "You Won!";
    document.getElementById('modal').classList.remove("hide");

}

const hideModal = () => {
    document.getElementById('modal').classList.add("hide");
}

const removeallclick = (items) => {
    items.forEach((item) => {
        item.setAttribute("onclick", "");
    })
}

const removeDroppable = (items) => {
    items.forEach((item) => {
        item.setAttribute("onclick", "");
        item.setAttribute("ondrop", "");
        item.setAttribute("ondragover", "");
        item.setAttribute("draggable", "false");
        item.setAttribute("ondragstart", "");
        item.setAttribute("ondragend", "");
    })
}




// this function sets a unique id for each list item, in the form 'li0' to 'li8'
const setId = (items) => {
    for(let i = 0; i < items.length; i++) {
        items[i].setAttribute("id", `li${i}`)
    }
}

const fillGrid = (items, tiles) => {
    items.forEach((item, i) => {
        item.innerText = tiles[i];
        document.getElementById(item.id).classList.remove("empty");
    })
}

const forward_state = (currentstate,valuemoved) => {
    let newstate = [];
    let index = currentstate.indexOf(valuemoved);
    let index_e = currentstate.indexOf("");
    for (let i = 0; i < currentstate.length;i++){
        if (i==index){
            newstate[i] = currentstate[index_e];
        }else if (i==index_e){
            newstate[i] = currentstate[index];
        }else
        {
            newstate[i] = currentstate[i];
        }
    }
    //console.log(newstate,"test1",currentstate)
    
    return newstate.toString();
}

let visited = new Set();

function setUp() {
    setId(ul)
    fillGrid(ul, tiles); //Change shuffle instead of random, into solved and then shuffle for n-steps
    

    state.content = getState(ul); // gets placements of 1x9 array
    state.dimension = getDimension(state); //transform into 3x3 array

 // set up the droppable and dragabble contents
    setDroppable(ul);
    setDraggable(ul);
    console.log("The state dimension", state.dimension)
    visited.add(state.content.toString());
    //shuffle
    for(let i = 0; i < getRandomInt(50, 100); i++) {
        let randomval = getRandomInt(0, clickable.length-1);
        let getid = clickable[randomval];
        let check = forward_state(state.content,click_vals[randomval]);
        if (!visited.has(check)){
            document.getElementById(getid).click();
            visited.add(check);
        }else{
            i--;
        }
    }
    
    //console.log(visited);
}

let queue = [];

class node {
    constructor(parent,curstate,id,val,move){
        this.parent = parent;
        this.curstate = curstate;
        this.id = id;
        this.val = val;
        this.move = move;
    }
}

function solve(){
    visited = new Set();
    visited.add(state.content.toString());
    let snode = new node("none",state.content.toString(),"","")
    curnode = snode;
    let first = true;
    let counter = 0;
    queue.push(curnode);
    while(queue.length>0){
        curnode = queue.shift();
        if(!first){
            //document.getElementById(curnode.id).click(); //replace
            //theory_click(curnode.curstate.split(','),curnode.id,curnode.val);
            state.dimension = getDimension_fromstring(curnode.curstate);
            setclickable(curnode.curstate.split(','));
            counter++;
        }
        if (checkwin(curnode.curstate)){
            break;
        }
        console.log(visited.size,queue.length,clickable,curnode,counter);
        first = false;
    //check moves -> clickable = li1, li2 //click_vals = 1, 2
        for(let i = 0; i < clickable.length;i++){
    //check move validty
            let curstate = curnode.curstate;
            //console.log(curstate,curstate.split(','),);
            let newstate = forward_state(curstate.split(','),click_vals[i]); //check lookahead to check if visited
            if (!visited.has(newstate)){
                    visited.add(newstate);
                //create node
                    newnode = new node(curnode, newstate, clickable[i], click_vals[i], click_direction[i]);
                //add to queue
                    queue.push(newnode);
            }
        }
    //check next
    }
    console.log("OUT")
    solution = [];
    let moves = 0;
    while (curnode.parent){
        solution.unshift(curnode);
        curnode = curnode.parent;
    }
    console.log("Moves!",moves);
    let html = "<h1>The Step by step solution</h1>";
    let new3x3 = "";
    let curdimension = [];
    let bimage = {"U":"images/up.png","D":"images/down.png","L":"images/left.png","R":"images/right.png"};
    console.log(solution);
    for (let i=0; i<solution.length;i++){
        new3x3 = "";
        curdimension = getDimension_fromstring(solution[i].curstate.toString());
        for(let row = 0; row < curdimension.length;row++){
            for (let col = 0; col < curdimension[row].length;col++){
                if (curdimension[row][col].toString()==solution[i].val.toString()){
                    new3x3+="<li" + " style='background-image: url("+bimage[solution[i].move]+");background-size: cover;'" + ">"+curdimension[row][col].toString()+"</li>";
                }else{
                    new3x3+="<li>"+curdimension[row][col].toString()+"</li>";
                }
                
            }
        }
        html+="<br><div id='smol_container'><ul>" + new3x3 + "</ul> <h2>Move #: "+ moves.toString() +"</h2></div>"
        moves++
    }
    document.getElementById('solution_add').innerHTML = html;
}

let sol_queue = [];
function animate_sol(){
    if(solution.length==0){
        return;
    }
    sol_queue = solution.slice();
    anim_recurse();
}

function anim_recurse(){
    node = sol_queue.shift()
    fillGrid(ul,node.curstate.split(','));
    state.content = node.curstate.split(',');
    state.dimension = getDimension_fromstring(node.curstate);
    setDroppable(ul);
    setDraggable(ul);
    if(sol_queue.length===0){
        return;
    }
    setTimeout(anim_recurse,1000);
}


/**
 * Getters
 */
const getState = (items) => {
    const content = [];
    items.forEach((item, i) => {
        content.push(item.innerText)
    });
    return content;
}

const getEmptyCell = () => {
    const emptyCellNumber = state.emptyCellIndex+1;
    const emptyCellRow = Math.ceil(emptyCellNumber/3);
    const emptyCellCol = 3 - (3 * emptyCellRow - emptyCellNumber);
    // emptyCellRow holds the actual row number the empty tile falls into in a 9-cell grid
    // the array index will be one less than its value. Same goes for emptyCellCol
    return [emptyCellRow-1, emptyCellCol-1]
}

const getDimension = (state) => {
    let j = 0;
    let arr = [];
    const {content} = state;
    for(let i = 0; i < 3; i++) {
        arr.push(content.slice(j, j+3));
        j+=3;
    }

    return arr;
}

const getDimension_fromstring = (items) => {
    let j = 0;
    let arr = [];
    let content = items.split(',');
    for(let i = 0; i < 3; i++) {
        arr.push(content.slice(j, j+3));
        j+=3;
    }

    return arr;
}

/**
 * setters
*/
const setDroppable = (items) => {
    items.forEach((item, i) => {
        if(!item.innerText) {
            state.emptyCellIndex = i;
            empty = "li"+ i;
            item.setAttribute("class", "empty");
        }
        return;
    })
}

const setDraggable = (items) => {
    const [row, col] = getEmptyCell();
    console.log(state.dimension,row,col);
    let left, right, top, bottom = null;
    if(state.dimension[row][col-1]) left = state.dimension[row][col-1];
    if(state.dimension[row][col+1]) right = state.dimension[row][col+1];

    if(state.dimension[row-1] != undefined) top = state.dimension[row-1][col];
    if(state.dimension[row+1] != undefined) bottom = state.dimension[row+1][col];

    clickable = [];
    click_direction = [];
    click_vals = [];
    let counter = 0;
    // make its right and left dragabble
    items.forEach(item => {
        if(item.innerText == top || 
            item.innerText == bottom || 
            item.innerText == right ||
            item.innerText == left) {
                item.setAttribute("onclick", "onclick_handler(event);");
                clickable[counter] = item.id;
                click_vals[counter] = item.innerText;
                if(item.innerText == top){
                    click_direction[counter] = 'D';
                }else if(item.innerText == bottom){
                    click_direction[counter] = 'U';
                }else if(item.innerText == left){
                    click_direction[counter] = 'R';
                }else {
                    click_direction[counter] = 'L';
                }
                counter++;
                
            }
        
    })
    //console.log(clickable); check clickable
}

const getempty = (dimension) => {
    for(let i = 0; i<dimension.length;i++){
        for (let j = 0; j<dimension[i].length;j++){
            if (dimension[i][j] == ""){
                return [i,j];
            }
        }
    }
}

const setclickable = (items) => {
    //find empty
    const [row,col] = getempty(state.dimension);
    //set directions
    let left, right, top, bottom = null;
    if(state.dimension[row][col-1]) left = state.dimension[row][col-1];
    if(state.dimension[row][col+1]) right = state.dimension[row][col+1];

    if(state.dimension[row-1] != undefined) top = state.dimension[row-1][col];
    if(state.dimension[row+1] != undefined) bottom = state.dimension[row+1][col];

    clickable = [];
    click_direction = [];
    click_vals = [];
    let counter_array = 0;
    let counter_item = 0;
    //set clickable,click_direction,click_vals,counter
    items.forEach(item => {
        if(item == top || 
            item == bottom || 
            item == right ||
            item == left) {
                clickable[counter_array] = "li" + (counter_item).toString();
                click_vals[counter_array] = item;
                if(item== top){
                    click_direction[counter_array] = 'D';
                }else if(item == bottom){
                    click_direction[counter_array] = 'U';
                }else if(item == left){
                    click_direction[counter_array] = 'R';
                }else {
                    click_direction[counter_array] = 'L';
                }
                counter_array++;
            }
        counter_item++;
        
    })
}

const theory_click =(curstate,clicked,clickedval) =>{
    let nstate = forward_state(curstate,clickedval); //figure out state first
    state.content = nstate.split(','); //unpack from string to array
    fillGrid(ul,state.content); //update UI
    state.dimension = getDimension(state);
    //removeallclick(document.querySelectorAll('li'));
    //setDroppable(document.querySelectorAll('li'));
    //setDraggable(document.querySelectorAll('li'));
    setclickable(state.content);
    if(checkwin(state.content)){
        showModal();
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



//complete shuffle code (DONE)

//recognize win (DONE)

//automate
