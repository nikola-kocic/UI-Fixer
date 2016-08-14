var ff4uifix_Fixer = {
  _MENU_BUTTON_PREF: "menu",
  _NEW_TAB_PREF : "newtab",
  _MENUBAR_PREF : "classicmenumov",
  _prefBranch   : undefined,
  init : function() {
    //Load Preferences
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
    this._prefBranch = prefService.getBranch("extensions.ff4uifix.");
    this._prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);

    //Update UI
    this.updateNewtab();
    this.updateMenuButton();
    this.updateMenubar();

    //Add Preference Changed Events
    this._prefBranch.addObserver(this._MENU_BUTTON_PREF, this, false);
    this._prefBranch.addObserver(this._NEW_TAB_PREF, this, false);
    this._prefBranch.addObserver(this._MENUBAR_PREF, this, false);
  },

  observe : function (aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed") {
      return;
    }

    if (aData == this._NEW_TAB_PREF) {
      this.updateNewtab();
    } else if (aData == this._MENU_BUTTON_PREF) {
      this.updateMenuButton();
    } else if (aData == this._MENUBAR_PREF) {
      this.updateMenubar();
    }
  },

  //Shows/hides "New Tab" option in Tab Context Menu
  updateNewtab : function () {
    var fixer_newtabpref = this._prefBranch.getBoolPref(this._NEW_TAB_PREF);

    var fixer_newtab = document.getElementById("fixer-newtab");
    if (fixer_newtabpref == true) {
      if (fixer_newtab == null) {
        var newTabMenuItem = document.getElementById("menu_newNavigatorTab");
        var fixer_newtabelement = document.createElement("menuitem");
        fixer_newtabelement.setAttribute("id", "fixer-newtab");
        fixer_newtabelement.setAttribute("label", newTabMenuItem.label);
        fixer_newtabelement.addEventListener("click", BrowserOpenTab, false);

        var tabcontext = document.getElementById("tabContextMenu");
        tabcontext.insertBefore(fixer_newtabelement, tabcontext.firstChild);
      } else {
        fixer_newtab.hidden = false;
      }
    } else if (fixer_newtab) { // fixer_newtabpref == false
      fixer_newtab.hidden = true;
    }
  },

  updateElement: function(fixer_pref_id, fixer_element_id, org_element_id, area, before_element_id) {
    const fixer_pref = this._prefBranch.getBoolPref(fixer_pref_id);
    var fixer_element = document.getElementById(fixer_element_id);

    if (fixer_pref == true) {
      // If the Fixer element is not visible, add it to the Navbar
      if (fixer_element == null) {
        CustomizableUI.addWidgetToArea(fixer_element_id, area);
        fixer_element = document.getElementById(fixer_element_id);
      }
      const org_element = document.getElementById(org_element_id);
      fixer_element.appendChild(org_element);
    } else if (fixer_element) { // fixer_pref == false
      const listener = {
        onWidgetBeforeDOMChange: function(aNode, aNextNode, aContainer, aIsRemoval) {
          if (aIsRemoval && aNode.id == fixer_element_id) {
            const d = aNode.ownerDocument;

            const before_element = before_element_id == null ? null : d.getElementById(before_element_id);
            const org_element = d.getElementById(org_element_id);
            if (org_element != null) {
              const orgelem_toolbar = d.getElementById(area);
              orgelem_toolbar.insertBefore(org_element, before_element);
            }
          }
        }.bind(this)
      };
      CustomizableUI.addListener(listener);
      CustomizableUI.removeWidgetFromArea(fixer_element_id);
      CustomizableUI.removeListener(listener);
    }
  },

  updateMenubar : function () {
    this.updateElement(this._MENUBAR_PREF, "fixer-menubar",
      "menubar-items", CustomizableUI.AREA_MENUBAR, null);
  },

  updateMenuButton : function () {
    this.updateElement(this._MENU_BUTTON_PREF, "fixer-menu-button",
      "PanelUI-button", CustomizableUI.AREA_NAVBAR, "window-controls");
  },

  isElementPlaced: function(aWidgetId) {
    const element_placed = CustomizableUI.getPlacementOfWidget(aWidgetId) !== null;
    return element_placed;
  },

  updatePrefOnCustomizationChange: function(fixer_pref_id, fixer_element_id) {
    var fixer_pref = this._prefBranch.getBoolPref(fixer_pref_id);
    const fixer_element_visible = this.isElementPlaced(fixer_element_id);
    if (fixer_pref !== fixer_element_visible) {
      this._prefBranch.setBoolPref(fixer_pref_id, fixer_element_visible);
    }
  },

  onCustomizationChange: function() {
    this.updatePrefOnCustomizationChange(this._MENU_BUTTON_PREF, "fixer-menu-button");
    this.updatePrefOnCustomizationChange(this._MENUBAR_PREF, "fixer-menubar");
  },

  cleanup : function () {
    this._prefBranch.removeObserver(this._MENU_BUTTON_PREF, this);
    this._prefBranch.removeObserver(this._NEW_TAB_PREF, this);
    this._prefBranch.removeObserver(this._MENUBAR_PREF, this);
  }
};

window.addEventListener("load", function load() {
  window.removeEventListener("load", load, false); //remove listener, no longer needed
  ff4uifix_Fixer.init();
}, false);
window.addEventListener("customizationchange", () => {
  ff4uifix_Fixer.onCustomizationChange();
}, false);
window.addEventListener("unload", () => { ff4uifix_Fixer.cleanup(); }, false);
