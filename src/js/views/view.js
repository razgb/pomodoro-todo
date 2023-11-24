class view {
  _parentContainer = "";
  _menuState = false;

  render() {}

  _clear() {
    this._parentContainer.innerHTML = "";
  }

  addHandlerMenu() {
    const menuButton = document.querySelector(".menu__hamburger");
    menuButton.addEventListener("click", function () {
      const menuTab = document.querySelector(".menu");
      const app = document.querySelector(".app");

      if (!this._menuState) {
        menuTab.style.transform = "translateX(0)";
        app.style.marginLeft = "20%";
        this._menuState = true;
      } else {
        menuTab.style.transform = "translateX(-110%)";
        app.style.marginLeft = "0";
        this._menuState = false;
      }
    });
  }
}

export default new view();
