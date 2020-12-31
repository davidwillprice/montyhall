let NoOfDoors = 3;
let doors = {
  redDoor: {
    color: 'red',
    prize: 'goat',
  },
  blueDoor: {
    color: 'blue',
    prize: 'goat',
  },
  greenDoor: {
    color: 'green',
    prize: 'goat',
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
//Assign a car to a random door
  assignCar();
  //Set event listeners
  addDoorsEventListeners();
  addReplayEventListener();
}

function addDoorsEventListeners() {
  document.querySelectorAll('.monty-hall__door').forEach(door =>
    door.addEventListener("click", doorClicked)
  );
}
function addReplayEventListener() {
  document.getElementById('monty-hall__replay-btn').addEventListener("click", replayClicked);
}

function assignCar() {
  //Randomly assign one of the doors a car
  let randomDoorNo = (Math.floor(Math.random() * NoOfDoors)) + 1;
  if (randomDoorNo == 1) {
    doors.redDoor.prize = 'car';
  } else if (randomDoorNo == 2) {
    doors.blueDoor.prize = 'car';
  } else {
    doors.greenDoor.prize = 'car';
  }
}

function doorClicked(e) {
  //Identify the clicked doors' object
  let chosenDoor = doors[e.target.getAttribute('data-id') + 'Door'];
  //Add a property to the data knows it has been selected
  chosenDoor.selected = true;
  //Add keep text to selected door
  document.querySelector(`#monty-hall__door--${chosenDoor.color} .monty-hall__door-btn-con`).innerHTML="<p>Keep</p>";
  //Add keep event listener to selected door
  document.getElementById(`monty-hall__door--${chosenDoor.color}`).addEventListener("click", keepClicked);
  
  //Find a spare goat whose door can be opened
  const goatDoor = findSpareGoat();
  //Set the door to open in the data
  goatDoor.opened = true;
  //Show the spare goat door in UI
  document.getElementById('monty-hall__door--' + goatDoor.color).classList.toggle('monty-hall__door--goat')

  //Find the door you can switch to
  const swapDoor = findSwapDoor();
  //Add keep text to selected door
  document.querySelector(`#monty-hall__door--${swapDoor.color} .monty-hall__door-btn-con`).innerHTML="<p>Swap</p>";
  //Add keep event listener to selected door
  document.getElementById(`monty-hall__door--${swapDoor.color}`).addEventListener("click", swapClicked);

  //Remove all the door clicked event listeners
  removeAllDoorEventList();
  //Adjust message to reflect new state
  document.getElementById('monty-hall__message').innerHTML = `<p>You have selected the ${chosenDoor.color} door.</p> 
  <p>Monty reveals the ${goatDoor.color} door had a goat.</p>
  <p>Would you like to keep the ${chosenDoor.color} door or swap to the ${swapDoor.color} door?</p>`
}
function removeAllDoorEventList() {
  document.querySelectorAll('.monty-hall__door').forEach(door =>
    door.removeEventListener("click", doorClicked)
  );
}
function findSpareGoat() {
  //Loop through doors and return the doors that have a goat and aren't currently selected
  let unselectedGoatDoors = [];
  for (const door in doors) {
    if (!doors[door].selected && doors[door].prize === 'goat') {
      unselectedGoatDoors.push(doors[door]);
    }
  }
  //If there is only one door that has a goat and isn't selected, return it
  if (unselectedGoatDoors.length == 1) {
    return unselectedGoatDoors[0]
  } else {
    //If there is two doors that have goats and isn't selected, return a random one of those doors
    return unselectedGoatDoors[(Math.floor(Math.random() * 2))]
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
  //Clear keep/swap text
  clearKeepSwapTxt();
  //Remove eventlistener from keep and swap doors
  removeKeepSwapEventList()
  //Reveal reset button
  document.getElementById('monty-hall__btn-con').classList.toggle('monty-hall__hide');
  for (const door in doors) {
    if (!doors[door].selected && !doors[door].opened && doors[door].prize === 'car') {
      document.getElementById('monty-hall__message').innerHTML = `You swapped to the ${doors[door].color} door which has the car. You win!`
      //Update stats data
      stats.swap.won++;
      document.getElementById('monty-hall__door--' + doors[door].color).classList.toggle('monty-hall__door--car')
      document.getElementById('monty-hall__swap').innerHTML = stats.calcWinrate(stats.swap);
    } else if (!doors[door].selected && !doors[door].opened && doors[door].prize === 'goat') {
      document.getElementById('monty-hall__message').innerHTML = `You swapped to the ${doors[door].color} door but it has a goat. You lose!`
      //Update stats data
      stats.swap.lost++;
      document.getElementById('monty-hall__swap').innerHTML = stats.calcWinrate(stats.swap);
      //Open selected door
      document.getElementById('monty-hall__door--' + doors[door].color).classList.toggle('monty-hall__door--goat')
    }
  }
}
function keepClicked() {
  console.log('Keep clicked')
  //Clear keep/swap text
  clearKeepSwapTxt();
  //Remove eventlistener from keep and swap doors
  removeKeepSwapEventList();
  //Reveal reset button
  document.getElementById('monty-hall__btn-con').classList.toggle('monty-hall__hide');
  //Does the door the user selected have the car?
  for (const door in doors) {
    if (doors[door].selected && doors[door].prize === 'car') {
      document.getElementById('monty-hall__message').innerHTML = `You kept the ${doors[door].color} door which has the car. You win!`
      //Update stats data
      stats.keep.won++;
      document.getElementById('monty-hall__keep').innerHTML = stats.calcWinrate(stats.keep);
      //Open selected door
      document.getElementById('monty-hall__door--' + doors[door].color).classList.toggle('monty-hall__door--car')
    } else if (doors[door].selected && doors[door].prize === 'goat') {
      document.getElementById('monty-hall__message').innerHTML = `You kept the ${doors[door].color} door but it has a goat. You lose!`
      //Update stats data
      stats.keep.lost++;
      document.getElementById('monty-hall__keep').innerHTML = stats.calcWinrate(stats.keep);
      //Open selected door
      document.getElementById('monty-hall__door--' + doors[door].color).classList.toggle('monty-hall__door--goat')
    }
  }
}
function removeKeepSwapEventList() {
  //Remove event listener from selected door
  document.getElementById(`monty-hall__door--${findSelectedDoor().color}`)
  .removeEventListener("click", keepClicked);
  //Remove event listener from swap door
  document.getElementById(`monty-hall__door--${findSwapDoor().color}`)
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
    doors[door].prize = 'goat';
    doors[door].opened = false;
    doors[door].selected = false;
  }
  //Readd event listeners 
  addDoorsEventListeners();
  //Reassign a new car
  assignCar();
  //Reset door UI
  document.querySelectorAll('.monty-hall__door--goat').forEach(door =>
    door.classList.toggle('monty-hall__door--goat')
  );
  if (document.querySelector('.monty-hall__door--car')) {
    document.querySelector('.monty-hall__door--car').classList.toggle('monty-hall__door--car');
  }
  //Reset message
  document.getElementById('monty-hall__message').textContent = 'Select a door'
  //Hide reset button
  document.getElementById('monty-hall__btn-con').classList.toggle('monty-hall__hide');
}

/*
Game starts, 3 doors are available to click on
One door is assigned with the car, the other two with goats
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
