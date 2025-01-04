    function showPopup(message) {
      const popup = document.getElementById("popup");
      const popupMessage = document.getElementById("popup-message");
      const popupClose = document.getElementById("popup-close");
  
      popupMessage.textContent = message;
      popup.classList.remove("hidden");
      popup.classList.add("visible");
  
      popupClose.addEventListener("click", () => {
        popup.classList.remove("visible");
        popup.classList.add("hidden");
      });
    }
