//Data controller module
let MHPDataController = (function () {
  let NoOfDoors = 3;
  return {
    doors: {
      doorOne: {
        no: "one",
        prize: "empty",
        name: "first",
      },
      doorTwo: {
        no: "two",
        prize: "empty",
        name: "second",
      },
      doorThree: {
        no: "three",
        prize: "empty",
        name: "third",
      },
    },
    stats: {
      swap: {
        won: 0,
        lost: 0,
      },
      keep: {
        won: 0,
        lost: 0,
      },
      newResult: function (choice, result) {
        this[choice][result]++;
      },
      calcWinrate: function (x) {
        let winRate;
        if (x.won + x.lost === 0) {
          winRate = 0;
        } else {
          winRate = (x.won / (x.won + x.lost)) * 100;
        }
        return Math.round(winRate);
      },
    },
    assignGold: function () {
      //Randomly assign one of the doors with gold
      let randomDoorNo = Math.floor(Math.random() * NoOfDoors) + 1;
      if (randomDoorNo == 1) {
        this.doors.doorOne.prize = "gold";
      } else if (randomDoorNo == 2) {
        this.doors.doorTwo.prize = "gold";
      } else {
        this.doors.doorThree.prize = "gold";
      }
    },
    getSelectedDoor: function (e) {
      return this.doors["door" + e.currentTarget.getAttribute("data-id")];
    },
    setSelectedDoor: function (door) {
      door.selected = true;
    },
    findSpareEmptyDoor: function () {
      //Loop through doors and return any that are empty and aren't currently selected
      let unselectedEmptyDoors = [];
      for (const door in this.doors) {
        if (!this.doors[door].selected && this.doors[door].prize === "empty") {
          unselectedEmptyDoors.push(this.doors[door]);
        }
      }
      //Pick a random empty door
      return unselectedEmptyDoors[
        Math.floor(Math.random() * unselectedEmptyDoors.length)
      ];
    },
    setEmptyDoor: function (door) {
      door.opened = true;
    },
    findSwapDoor: function () {
      for (const door in this.doors) {
        if (!this.doors[door].selected && !this.doors[door].opened) {
          return this.doors[door];
        }
      }
    },
    findSelectedDoor: function () {
      for (const door in this.doors) {
        if (this.doors[door].selected) {
          return this.doors[door];
        }
      }
    },
    winOrLose: function (door) {
      return door.prize === "gold" ? true : false;
    },
    resetDoors: function () {
      for (const door in this.doors) {
        this.doors[door].prize = "empty";
        this.doors[door].opened = false;
        this.doors[door].selected = false;
      }
    },
  };
})();

//UI controller module
let MPHUIController = (function () {
  return {
    addDoorOptionButton: function (door, btnText) {
      document.querySelector(
        `#monty-hall__door--${door.no} .monty-hall__door-btn-con`
      ).innerHTML = `<button>${btnText}</button>`;
    },
    toggleClassById: function (id, CSSClass) {
      document.getElementById(id).classList.toggle(CSSClass);
    },
    toggleClassByQuerySelector: function (querySelector, CSSClass) {
      document.querySelector(querySelector).classList.toggle(CSSClass);
    },
    updateHTMLViaId: function (id, text) {
      document.getElementById(id).innerHTML = text;
    },
    toggleClassOfAllDoors: function (CSSClass) {
      document
        .querySelectorAll(".monty-hall__door")
        .forEach((door) => door.classList.toggle(CSSClass));
    },
    clearKeepSwapBtns: function () {
      document
        .querySelectorAll(".monty-hall__door-btn-con")
        .forEach((con) => (con.innerHTML = ""));
    },
    clearEmptyDoors: function () {
      document
        .querySelectorAll(".monty-hall__door--empty")
        .forEach((door) => door.classList.toggle("monty-hall__door--empty"));
    },
    clearGoldDoor: function () {
      if (document.querySelector(".monty-hall__door--gold")) {
        document
          .querySelector(".monty-hall__door--gold")
          .classList.toggle("monty-hall__door--gold");
      }
    },
  };
})();

//Global controller module
let MPHGlobalController = (function (dataCtrl, UICtrl) {
  function addDoorsEventListeners() {
    document
      .querySelectorAll(".monty-hall__door")
      .forEach((door) => door.addEventListener("click", doorClicked, false));
  }
  function addEventListenerById(id, fn) {
    document.getElementById(id).addEventListener("click", fn);
  }
  function removeAllDoorEventList() {
    document
      .querySelectorAll(".monty-hall__door")
      .forEach((door) => door.removeEventListener("click", doorClicked));
  }
  function removeEventListenById(id, fn) {
    document.getElementById(id).removeEventListener("click", fn);
  }
  //MOVING TO STAGE 2//
  function doorClicked(e) {
    //Identify the clicked doors' object
    const selectedDoor = dataCtrl.getSelectedDoor(e);
    //Add selected to the door's data
    dataCtrl.setSelectedDoor(selectedDoor);
    //Add keep text to selected door
    UICtrl.addDoorOptionButton(selectedDoor, "Keep?");
    //Add keep event listener to selected door
    addEventListenerById(`monty-hall__door--${selectedDoor.no}`, keepClicked);
    //Find an empty door which can be opened
    const emptyDoor = dataCtrl.findSpareEmptyDoor();
    //Set the door to open in the data
    dataCtrl.setEmptyDoor(emptyDoor);
    //Show the spare empty door in UI
    UICtrl.toggleClassById(
      `monty-hall__door--${emptyDoor.no}`,
      "monty-hall__door--empty"
    );
    UICtrl.toggleClassById(
      `monty-hall__door--${emptyDoor.no}`,
      "monty-hall__door--unselectable"
    );
    //Find the door we will set as a possible switch option
    const swapDoor = dataCtrl.findSwapDoor();
    //Add swap text to selected door
    UICtrl.addDoorOptionButton(swapDoor, "Swap?");
    //Add swap event listener to swap door
    addEventListenerById(`monty-hall__door--${swapDoor.no}`, swapClicked);
    //Remove all the door clicked event listeners
    removeAllDoorEventList();
    //Adjust message to reflect new state
    UICtrl.updateHTMLViaId(
      "monty-hall__message",
      `<p>Monty reveals the ${emptyDoor.name} door was&nbsp;empty.<br>Would you like to keep the ${selectedDoor.name} door or swap to the ${swapDoor.name}&nbsp;door?</p>`
    );
  }
  function prepareStageThree() {
    //Take off the currently unselectable door to avoid duplicates
    UICtrl.toggleClassByQuerySelector(
      ".monty-hall__door--unselectable",
      "monty-hall__door--unselectable"
    );
    //Add monty-hall__door--unselectable class to all doors
    UICtrl.toggleClassOfAllDoors("monty-hall__door--unselectable");
    //Clear keep/swap text
    UICtrl.clearKeepSwapBtns();
    //Remove keep event listener
    removeEventListenById(
      `monty-hall__door--${dataCtrl.findSelectedDoor().no}`,
      keepClicked
    );
    //Remove swap event listener
    removeEventListenById(
      `monty-hall__door--${dataCtrl.findSwapDoor().no}`,
      swapClicked
    );
    //Reveal reset button
    UICtrl.toggleClassById("monty-hall__replay-btn-con", "monty-hall__hide");
  }
  function swapClicked(e) {
    prepareStageThree();
    //Get selected door
    const selectedDoor = dataCtrl.getSelectedDoor(e);
    //Find out whether the user won or lost based on the door they selected
    const gameResult = dataCtrl.winOrLose(selectedDoor);
    //Update the message UI with their action, the door and whether they won
    UICtrl.updateHTMLViaId(
      "monty-hall__message",
      `<p>You swapped to the ${selectedDoor.name} door ${
        gameResult
          ? "which has the gold. You&nbsp;win!"
          : "but it's empty. You&nbsp;lose!</p>"
      }</p>`
    );
    //If the user won...
    if (gameResult) {
      //Add gold to their selected door
      UICtrl.toggleClassById(
        `monty-hall__door--${selectedDoor.no}`,
        "monty-hall__door--gold"
      );
      //Add won game to stats
      dataCtrl.stats.newResult("swap", "won");
    } else {
      //Else if the user lost...
      //Show empty selected door
      UICtrl.toggleClassById(
        `monty-hall__door--${selectedDoor.no}`,
        "monty-hall__door--empty"
      );
      //Add lost game to stats
      dataCtrl.stats.newResult("swap", "lost");
    }
    //Update swap winrate in UI
    UICtrl.updateHTMLViaId(
      "monty-hall__swap",
      dataCtrl.stats.calcWinrate(dataCtrl.stats.swap)
    );
  }

  function keepClicked(e) {
    prepareStageThree();
    //Get selected door
    const selectedDoor = dataCtrl.getSelectedDoor(e);
    //Find out whether the user won or lost based on the door they selected
    const gameResult = dataCtrl.winOrLose(selectedDoor);
    //Update the message UI with their action, the door and whether they won
    UICtrl.updateHTMLViaId(
      "monty-hall__message",
      `<p>You kept the ${selectedDoor.name} door ${
        gameResult
          ? "which has the gold. You&nbsp;win!"
          : "but it's empty. You&nbsp;lose!</p>"
      }</p>`
    );

    //If the user won...
    if (gameResult) {
      //Add gold to their selected door
      UICtrl.toggleClassById(
        `monty-hall__door--${selectedDoor.no}`,
        "monty-hall__door--gold"
      );
      //Add won game to stats
      dataCtrl.stats.newResult("keep", "won");
    } else {
      //Else if the user lost...
      //Show empty selected door
      UICtrl.toggleClassById(
        `monty-hall__door--${selectedDoor.no}`,
        "monty-hall__door--empty"
      );
      //Add lost game to stats
      dataCtrl.stats.newResult("keep", "lost");
    }
    //Update swap winrate in UI
    UICtrl.updateHTMLViaId(
      "monty-hall__keep",
      dataCtrl.stats.calcWinrate(dataCtrl.stats.keep)
    );
  }
  //RESETTING TO STAGE 1//
  function replayClicked() {
    //Reset door data
    dataCtrl.resetDoors();
    //Readd event listeners
    addDoorsEventListeners();
    //Reassign a new gold door
    dataCtrl.assignGold();
    //Reset door UI
    UICtrl.clearEmptyDoors();
    //Apply unselectable to all doors
    UICtrl.toggleClassOfAllDoors("monty-hall__door--unselectable");
    //If it's visible, remove the gold door
    UICtrl.clearGoldDoor();
    //Reset message
    UICtrl.updateHTMLViaId("monty-hall__message", "<p>Select a door</p>");
    //Hide replay button
    UICtrl.toggleClassById("monty-hall__replay-btn-con", "monty-hall__hide");
  }
  return {
    init: function () {
      //SET UP STAGE 1//
      //Assign a gold to a random door
      dataCtrl.assignGold();
      //Set event listeners
      addDoorsEventListeners();
      addEventListenerById("monty-hall__replay-btn", replayClicked);
    },
  };
})(MHPDataController, MPHUIController);

//On the window load, run the controller init
window.onload = function () {
  MPHGlobalController.init();
};
