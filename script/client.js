"use strict";

window.settings = { ...DEFAULT_SETTINGS, ...window.settings };

let animationEndClasses = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

function initializeUI() {
  // $(":root")
  //   .css("--link-color", `${settings.LinkColor || "rgba(230,126,34,1)"}`)
  //   .css("--name-color", `${settings.UserColor || "rgba(255, 0, 0, 1)"}`)
  //   .css("--link-visible", settings.ShowLink ? "inline-block" : "none")
  //   ;

  // $("#logo img").removeClass().addClass(`${settings.ImageShape} ${settings.EnableShadow ? "shadow" : ""}`);
  // $("#name, #link").removeClass().addClass(`${settings.EnableShadow ? "shadow" : ""}`);
}

function connectWebsocket() {
  //-------------------------------------------
  //  Create WebSocket
  //-------------------------------------------
  let socket = new WebSocket("ws://127.0.0.1:3337/streamlabs");

  //-------------------------------------------
  //  Websocket Event: OnOpen
  //-------------------------------------------
  socket.onopen = function () {
    // AnkhBot Authentication Information
    let auth = {
      author: "DarthMinos",
      website: "http://darthminos.tv",
      api_key: API_Key,
      events: [
        "EVENT_SO_SETTINGS",
        "EVENT_SO_COMMAND"
      ]
    };

    // Send authentication data to ChatBot ws server

    socket.send(JSON.stringify(auth));
  };

  //-------------------------------------------
  //  Websocket Event: OnMessage
  //-------------------------------------------
  socket.onmessage = function (message) {
    console.log(message);
    // Parse message
    let socketMessage = JSON.parse(message.data);
    let eventName = socketMessage.event;
    console.log(socketMessage);
    let eventData = typeof socketMessage.data === "string" ? JSON.parse(socketMessage.data || "{}") : socketMessage.data;
    switch (eventName) {
      case "EVENT_SO_COMMAND":
      
        break;
      case "EVENT_SO_SETTINGS":
        window.settings = eventData;
        if (validateInit()) {
          initializeUI();
        }
        break;
      default:
        console.log(eventName);
        break;
    }
  };

  //-------------------------------------------
  //  Websocket Event: OnError
  //-------------------------------------------
  socket.onerror = function (error) {
    console.error(`Error: ${error}`);
  };

  //-------------------------------------------
  //  Websocket Event: OnClose
  //-------------------------------------------
  socket.onclose = function () {
    console.log("close");
    // Clear socket to avoid multiple ws objects and EventHandlings
    socket = null;
    // Try to reconnect every 5s
    setTimeout(function () { connectWebsocket(); }, 5000);
  };

}

function validateSettings() {
  let hasApiKey = typeof API_Key !== "undefined";
  let hasSettings = typeof settings !== "undefined";

  return {
    isValid: hasApiKey && hasSettings,
    hasSettings: hasSettings,
    hasApiKey: hasApiKey
  };
}

function validateInit() {
  // verify settings...
  let validatedSettings = validateSettings();

  // Connect if API_Key is inserted
  // Else show an error on the overlay
  if (!validatedSettings.isValid) {
    $("#config-messages").removeClass("hidden");
    $("#config-messages .settings").removeClass(validatedSettings.hasSettings ? "valid" : "hidden");
    $("#config-messages .api-key").removeClass(validatedSettings.hasApiKey ? "valid" : "hidden");
    return false;
  }
  return true;
}

jQuery(document).ready(function () {
  if (validateInit()) {
    initializeUI();
    connectWebsocket();
  } else {
    console.log("Invalid");
  }
});
