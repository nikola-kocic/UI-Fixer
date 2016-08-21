/* global Components */

const ff4uifix_Options = (function ff4uifix_Options_f() {
  function init() {
    const browserDoc: Document = (
      Components.classes["@mozilla.org/appshell/window-mediator;1"]
      .getService(Components.interfaces.nsIWindowMediator)
      .getMostRecentWindow("navigator:browser").document
    );

    //Hide "Make Firefox Menu Button Movable" if it's not supported in browser
    const appbuttonHandle = browserDoc.getElementById("PanelUI-menu-button");
    if (appbuttonHandle == null) {
      const menuPref = document.getElementById("fixer-menu-pref");
      if (menuPref) {
        menuPref.hidden = true;
      }
    }
  }
  return {init: init};
}());

window.addEventListener("load", () => { ff4uifix_Options.init(); }, false);
