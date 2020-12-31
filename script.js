let NoOfDoors = 3;
let doors = {
  doorOne: {
    no: 'one',
    prize: 'empty',
    name: 'first'
  },
  doorTwo: {
    no: 'two',
    prize: 'empty',
    name: 'second'
  },
  doorThree: {
    no: 'three',
    prize: 'empty',
    name: 'third'
  },
};
let stats = {
  swap: {
    won: 0,
    lost: 0
  },
  keep: {
    won: 0,
    lost: 0
  },
  calcWinrate: function(x) {
    let winRate;
    if (x.won + x.lost === 0) {
      winRate = 0
    } else {
      winRate = (x.won / (x.won + x.lost)) * 100
    }
    return Math.round(winRate);
  }
}

function init() {
//Assign a gold to a random door
  assignGold();
  //Set event listeners
  addDoorsEventListeners();
  addReplayEventListener();
}

function addDoorsEventListeners() {
  document.querySelectorAll('.monty-hall__door').forEach(door =>
    door.addEventListener("click", doorClicked, false)
  );
}
function addReplayEventListener() {
  document.getElementById('monty-hall__replay-btn').addEventListener("click", replayClicked);
}

function assignGold() {
  //Randomly assign one of the doors a gold
  let randomDoorNo = (Math.floor(Math.random() * NoOfDoors)) + 1;
  if (randomDoorNo == 1) {
    doors.doorOne.prize = 'gold';
  } else if (randomDoorNo == 2) {
    doors.doorTwo.prize = 'gold';
  } else {
    doors.doorThree.prize = 'gold';
  }
}

function doorClicked(e) {
  //Identify the clicked doors' object
  let chosenDoor = doors['door'+ (e.currentTarget.getAttribute('data-id'))];
  //Add a property to the data knows it has been selected
  console.log(chosenDoor)
  chosenDoor.selected = true;
  //Add keep text to selected door
  document.querySelector(`#monty-hall__door--${chosenDoor.no} .monty-hall__door-btn-con`).innerHTML="<button>Keep</button>";
  //Add keep event listener to selected door
  document.getElementById(`monty-hall__door--${chosenDoor.no}`).addEventListener("click", keepClicked);
  
  //Find an empty door which can be opened
  const emptyDoor = findSpareEmpty();
  //Set the door to open in the data
  emptyDoor.opened = true;
  //Show the spare empty door in UI
  document.getElementById('monty-hall__door--' + emptyDoor.no).classList.toggle('monty-hall__door--empty')
  document.getElementById('monty-hall__door--' + emptyDoor.no).classList.toggle('monty-hall__door--unselectable')
  //Find the door you can switch to
  const swapDoor = findSwapDoor();
  //Add keep text to selected door
  document.querySelector(`#monty-hall__door--${swapDoor.no} .monty-hall__door-btn-con`).innerHTML="<button>Swap</button>";
  //Add keep event listener to selected door
  document.getElementById(`monty-hall__door--${swapDoor.no}`).addEventListener("click", swapClicked);

  //Remove all the door clicked event listeners
  removeAllDoorEventList();
  //Adjust message to reflect new state
  document.getElementById('monty-hall__message').innerHTML = `<p>Monty reveals the ${emptyDoor.name} door was&nbsp;empty.<br>
  Would you like to keep the ${chosenDoor.name} door or swap to the ${swapDoor.name}&nbsp;door?</p>`
}
function removeAllDoorEventList() {
  document.querySelectorAll('.monty-hall__door').forEach(door =>
    door.removeEventListener("click", doorClicked)
  );
}
function findSpareEmpty() {
  //Loop through doors and return the doors that are empty and aren't currently selected
  let unselectedEmptyDoors = [];
  for (const door in doors) {
    if (!doors[door].selected && doors[door].prize === 'empty') {
      unselectedEmptyDoors.push(doors[door]);
    }
  }
  //If there is only one door that is empty and isn't selected, return it
  if (unselectedEmptyDoors.length == 1) {
    return unselectedEmptyDoors[0]
  } else {
    //If there are two empty doors that aren't selected, return a random one of those doors
    return unselectedEmptyDoors[(Math.floor(Math.random() * 2))]
  }
}
function findSelectedDoor(){
  for (const door in doors) {
    if (doors[door].selected) {
      return doors[door]
    }
  }
}
function findSwapDoor() {
  for (const door in doors) {
    if (!doors[door].selected && !doors[door].opened) {
      return doors[door]
    }
  }
}
function swapClicked() {
  console.log('Swap clicked')
  doorsUnselectable();
  //Clear keep/swap text
  clearKeepSwapTxt();
  //Remove eventlistener from keep and swap doors
  removeKeepSwapEventList()
  //Reveal reset button
  document.getElementById('monty-hall__replay-btn-con').classList.toggle('monty-hall__hide');
  for (const door in doors) {
    if (!doors[door].selected && !doors[door].opened && doors[door].prize === 'gold') {
      document.getElementById('monty-hall__message').innerHTML = `<p>You swapped to the ${doors[door].name} door which has the gold. You&nbsp;win!</p>`
      //Update stats data
      stats.swap.won++;
      document.getElementById('monty-hall__door--' + doors[door].no).classList.toggle('monty-hall__door--gold')
      document.getElementById('monty-hall__swap').innerHTML = stats.calcWinrate(stats.swap);
    } else if (!doors[door].selected && !doors[door].opened && doors[door].prize === 'empty') {
      document.getElementById('monty-hall__message').innerHTML = `<p>You swapped to the ${doors[door].name} door but it's empty. You lose!</p>`
      //Update stats data
      stats.swap.lost++;
      document.getElementById('monty-hall__swap').innerHTML = stats.calcWinrate(stats.swap);
      //Open selected door
      document.getElementById('monty-hall__door--' + doors[door].no).classList.toggle('monty-hall__door--empty')
    }
  }
}
function keepClicked() {
  console.log('Keep clicked')
  doorsUnselectable();
  //Clear keep/swap text
  clearKeepSwapTxt();
  //Remove eventlistener from keep and swap doors
  removeKeepSwapEventList();
  //Reveal reset button
  document.getElementById('monty-hall__replay-btn-con').classList.toggle('monty-hall__hide');
  //Does the door the user selected have the gold?
  for (const door in doors) {
    if (doors[door].selected && doors[door].prize === 'gold') {
      document.getElementById('monty-hall__message').innerHTML = `<p>You kept the ${doors[door].name} door which has the gold. You&nbsp;win!</p>`
      //Update stats data
      stats.keep.won++;
      document.getElementById('monty-hall__keep').innerHTML = stats.calcWinrate(stats.keep);
      //Open selected door
      document.getElementById('monty-hall__door--' + doors[door].no).classList.toggle('monty-hall__door--gold')
    } else if (doors[door].selected && doors[door].prize === 'empty') {
      document.getElementById('monty-hall__message').innerHTML = `<p>You kept the ${doors[door].name} door but it's empty. You&nbsp;lose!</p>`
      //Update stats data
      stats.keep.lost++;
      document.getElementById('monty-hall__keep').innerHTML = stats.calcWinrate(stats.keep);
      //Open selected door
      document.getElementById('monty-hall__door--' + doors[door].no).classList.toggle('monty-hall__door--empty')
    }
  }
}
function doorsUnselectable(){
  //Take off the currently unselectable door to avoid duplicates
  document.querySelector('.monty-hall__door--unselectable').classList.toggle('monty-hall__door--unselectable');
  //Apply unselectable to all doors
  allDoorsUnselectable()
}
function allDoorsUnselectable() {
  document.querySelectorAll('.monty-hall__door').forEach(door => 
    door.classList.toggle('monty-hall__door--unselectable')
  )
}

function removeKeepSwapEventList() {
  //Remove event listener from selected door
  document.getElementById(`monty-hall__door--${findSelectedDoor().no}`)
  .removeEventListener("click", keepClicked);
  //Remove event listener from swap door
  document.getElementById(`monty-hall__door--${findSwapDoor().no}`)
  .removeEventListener("click", swapClicked);
}
function clearKeepSwapTxt() {
  document.querySelectorAll('.monty-hall__door-btn-con').forEach(con => 
    con.innerHTML = ""
  )
}
function replayClicked() {
  //Reset door data
  for (const door in doors) {
    doors[door].prize = 'empty';
    doors[door].opened = false;
    doors[door].selected = false;
  }
  //Readd event listeners 
  addDoorsEventListeners();
  //Reassign a new gold
  assignGold();
  //Reset door UI
  document.querySelectorAll('.monty-hall__door--empty').forEach(door =>
    door.classList.toggle('monty-hall__door--empty')
  );
  //Apply unselectable to all doors
  allDoorsUnselectable()
  if (document.querySelector('.monty-hall__door--gold')) {
    document.querySelector('.monty-hall__door--gold').classList.toggle('monty-hall__door--gold');
  }
  //Reset message
  document.getElementById('monty-hall__message').innerHTML = "<p>Select a door</p>"
  //Hide reset button
  document.getElementById('monty-hall__replay-btn-con').classList.toggle('monty-hall__hide');
}

/*
Game starts, 3 doors are available to click on
One door is assigned with the gold, the other two with goats
User selects a door
The door with a goat between the other two is revealed
Ask the user if they want to keep their door or switch
Reveal whether they were right or wrong
Depending on if they chose to keep or switch, update some percentages on how often they have been right
Add a button that allows the user to reset the doors
*/
window.onload = function() {
  init();
}
