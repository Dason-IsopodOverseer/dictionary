"use strict";

let deferredInstallPrompt = null;
const installButton = document.getElementById("icondownload");
installButton.addEventListener("click", installPWA);

// Add event listener for beforeinstall prompt event
window.addEventListener("beforeinstallprompt", saveBeforeInstallPromptEvent);

function saveBeforeInstallPromptEvent(evt) {
  deferredInstallPrompt = evt;
  installButton.removeAttribute("hidden");
}

function installPWA(evt) {
  //display the install prompt
  deferredInstallPrompt.prompt();

  //hides the install button so it can't be called more then once
  evt.srcElement.setAttribute("hidden", true);
  
  //add install confirmation

  //logs the users response ti the prompt
  deferredInstallPrompt.userChoice.then(choice => {
    if (choice.outcome === "accepted") {
      console.log("User accepted the A2HS Prompt", choice);
    } else {
      console.log("User dismissed the A2HS Prompt", choice);
    }
    deferredInstallPrompt = null;
  });
} //installPWA

window.addEventListener("appinstalled", logAppInstalled);

function logAppInstalled(evt) {
  console.log("Dason's Dictionary was installed.", evt);
}
