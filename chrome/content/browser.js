/* global Components */
/* global CustomizableUI */
/* global BrowserOpenTab */

const ff4uifix_Fixer = {
  _MENU_BUTTON_PREF: "menu",
  _NEW_TAB_PREF : "newtab",
  _MENUBAR_PREF : "classicmenumov",
  _prefBranch   : undefined,
  _mappings: {
    "fixer-menu-button" : {
      fixer_pref_id: "menu",
      org_element_id: "PanelUI-button",
      area: CustomizableUI.AREA_NAVBAR,
      before_element_id: "window-controls"
    },
    "fixer-menubar" : {
      fixer_pref_id: "classicmenumov",
      org_element_id: "menubar-items",
      area: CustomizableUI.AREA_MENUBAR,
      before_element_id: null
    }
  },
  init : function() {
    //Load Preferences
    const prefService = Components.classes["@mozilla.org/preferences-service;1"]
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

    const listener = {
      onWidgetBeforeDOMChange: function(aNode, aNextNode, aContainer, aIsRemoval) {
        if ({}.hasOwnProperty.call(this._mappings, aNode.id)) {
          if (aIsRemoval) {
            const d = aNode.ownerDocument;
            //console.log(`onWidgetBeforeDOMChange aIsRemoval: id=${aNode.id}, document=${d.title}`);
            this.printState("onWidgetBeforeDOMChange aIsRemoval", aNode.id, d);
            const map = this._mappings[aNode.id];
            if (this.updatePrefOnCustomizationChange(map.fixer_pref_id, aNode.id) == false) {
              // const fixer_pref = this._prefBranch.getBoolPref(map.fixer_pref_id);
              //this.updateElement(d, fixer_pref, aNode.id, map.org_element_id, map.area, map.before_element_id);
            }
          }
        }
      }.bind(this),
      onWidgetAdded: function(aWidgetId, aArea, aPosition) {
        if ({}.hasOwnProperty.call(this._mappings, aWidgetId)) {
          this.printState(`onWidgetAdded, area=${aArea}, position=${aPosition}`, aWidgetId, document);
          const map = this._mappings[aWidgetId];
          if (this.updatePrefOnCustomizationChange(map.fixer_pref_id, aWidgetId) == false) {
            const fixer_pref = this._prefBranch.getBoolPref(map.fixer_pref_id);
            // Call updateElement so original element is moved to newly added fixer element
            this.updateElement(document, fixer_pref, aWidgetId, map.org_element_id, map.area, map.before_element_id);
          }
        }
      }.bind(this),
      onWidgetRemoved: function(aWidgetId, aArea) {
        if ({}.hasOwnProperty.call(this._mappings, aWidgetId)) {
          this.printState(`onWidgetRemoved, area=${aArea}`, aWidgetId, document);
      //     const map = this._mappings[aWidgetId];
      //     this.updatePrefOnCustomizationChange(map.fixer_pref_id, aWidgetId);
        }
      }.bind(this),
      onWidgetAfterDOMChange: function(aNode, aNextNode, aContainer, aWasRemoval) {
        if ({}.hasOwnProperty.call(this._mappings, aNode.id)) {
          console.log(`onWidgetAfterDOMChange, aNode.id = ${aNode.id}, aWasRemoval = ${aWasRemoval}`);
        }
      }.bind(this),
      onAreaReset: function(aArea, aContainer) {
        // use const after https://bugzilla.mozilla.org/show_bug.cgi?id=1101653 is fixed
        // eslint-disable-next-line prefer-const
        for (let k of Object.keys(this._mappings)) {
          const map = this._mappings[k];
          if (map.area === aArea) {
            this.printState(`onAreaReset, area=${aArea}, aContainer.id=${aContainer.id}`, k, document);
            const fixer_pref = this._prefBranch.getBoolPref(map.fixer_pref_id);
            if (fixer_pref) {
              CustomizableUI.addWidgetToArea(k, aArea);
            }
          }
        }
      }.bind(this),
      onWidgetReset: function(aNode, aContainer) {
        if ({}.hasOwnProperty.call(this._mappings, aNode.id)) {
          console.log(`onWidgetReset, aNode.id=${aNode.id}, aContainer.id=${aContainer.id}`);
        }
      }.bind(this),
      onWidgetMoved(aWidgetId, aArea, aOldPosition, aNewPosition) {
        console.log(`onWidgetMoved, aWidgetId=${aWidgetId}, aArea=${aArea}, aOldPosition=${aOldPosition}, aNewPosition=${aNewPosition}`);
      },
      onWidgetUndoMove(aNode, aContainer) {
        console.log(`onWidgetUndoMove, aNode.id=${aNode.id}, aContainer=${aContainer}`);
      },
      onAreaNodeUnregistered(aArea, aNode, aReason) {
        console.log(`onAreaNodeUnregistered aArea=${aArea}, aNode.id=${aNode.id}, aReason=${aReason}`);
      },
      onAreaNodeRegistered(aArea, aNode) {
        console.log(`onAreaNodeRegistered aArea=${aArea}, aNode.id=${aNode.id}`);
      },
      onWidgetCreated(aWidgetId) {
        console.log(`onWidgetCreated aWidgetId=${aWidgetId}`);
      },
      onWidgetAfterCreation(aWidgetId, aArea) {
        console.log(`onWidgetAfterCreation aWidgetId=${aWidgetId}, aArea=${aArea}`);
      },
      onWidgetDestroyed(aWidgetId) {
        console.log(`onWidgetDestroyed aWidgetId=${aWidgetId}`);
      },
      onWidgetInstanceRemoved(aWidgetId, aDocument) {
        console.log(`onWidgetInstanceRemoved aWidgetId=${aWidgetId}`);
      }//,
      // onWidgetDrag(aWidgetId, aArea) {
      //   console.log("onWidgetDrag");
      // },
      // onCustomizeStart(aWindow) {
      //   console.log("onCustomizeStart");
      // },
      // onCustomizeEnd(aWindow) {
      //   console.log("onCustomizeEnd");
      // },
      // onWidgetOverflow(aNode, aContainer) {
      //   console.log("onWidgetOverflow");
      // },
      // onWidgetUnderflow(aNode, aContainer) {
      //   console.log("onWidgetUnderflow");
      // }
    };
    CustomizableUI.addListener(listener);
  },

  printState: function(prefix, mapkey, d) {
    const map = this._mappings[mapkey];
    const fixer_element_placement = CustomizableUI.getPlacementOfWidget(mapkey);
    const fixer_element = d.getElementById(mapkey);
    const org_element = d.getElementById(map.org_element_id);
    const fixer_pref = this._prefBranch.getBoolPref(map.fixer_pref_id);
    console.log(`${prefix}, id=${mapkey}, fixer_pref=${fixer_pref}\
, fixer_element_placement=${JSON.stringify(fixer_element_placement)}\
, fixer_element=${fixer_element ? "true" : "false"}\
, org_element=${org_element ? "true" : "false"}\
, org_element parent=${org_element ? org_element.parentNode.id : "N/A"}`
      //, `document = ${d.title}`
    );
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
    const fixer_newtabpref = this._prefBranch.getBoolPref(this._NEW_TAB_PREF);

    const fixer_newtab = document.getElementById("fixer-newtab");
    if (fixer_newtabpref == true) {
      if (fixer_newtab == null) {
        const newTabMenuItem = document.getElementById("menu_newNavigatorTab");
        const fixer_newtabelement = document.createElement("menuitem");
        fixer_newtabelement.setAttribute("id", "fixer-newtab");
        fixer_newtabelement.setAttribute("label", newTabMenuItem.label);
        fixer_newtabelement.addEventListener("click", BrowserOpenTab, false);

        const tabcontext = document.getElementById("tabContextMenu");
        tabcontext.insertBefore(fixer_newtabelement, tabcontext.firstChild);
      } else {
        fixer_newtab.hidden = false;
      }
    } else if (fixer_newtab) { // fixer_newtabpref == false
      fixer_newtab.hidden = true;
    }
  },

  restoreOriginalElement: function(d, org_element, area, before_element_id) {
    const before_element = before_element_id == null ? null : d.getElementById(before_element_id);
    if (org_element != null) {
      const orgelem_toolbar = d.getElementById(area);
      orgelem_toolbar.insertBefore(org_element, before_element);
    }
  },

  updateElement: function(d, fixer_pref, fixer_element_id, org_element_id, area, before_element_id) {
    this.printState("updateElement", fixer_element_id, d);
    const fixer_element_visible = (CustomizableUI.getPlacementOfWidget(fixer_element_id) != null);
    // If element is not placed, if customize toolbar is open,
    // we can still access it using getElementById
    const org_element = d.getElementById(org_element_id);
    if (fixer_pref == true) {
      if (fixer_element_visible) {
        if (org_element.parentNode.id != fixer_element_id) {
          const fixer_element = d.getElementById(fixer_element_id);
          fixer_element.appendChild(org_element);
        }
      } else {  // fixer_element_visible == false
        // Add fixer element, callback will move the original element inside
        CustomizableUI.addWidgetToArea(fixer_element_id, area);
      }
    } else { // fixer_pref == false
      if (fixer_element_visible) {
        this.restoreOriginalElement(d, org_element, area, before_element_id);
        CustomizableUI.removeWidgetFromArea(fixer_element_id);
      } else {  // fixer_element_visible == false
        if (!org_element) {
          // TODO: CustomizableUI:Widget 'PanelUI-button' not found, unable to move
          CustomizableUI.addWidgetToArea(org_element_id, area);
        } else if (org_element.parentNode.id == fixer_element_id) {
          this.restoreOriginalElement(d, org_element, area, before_element_id);
        }
      }
    }
  },

  updateMenubar : function () {
    const map = this._mappings["fixer-menubar"];
    const fixer_pref = this._prefBranch.getBoolPref(this._MENUBAR_PREF);
    this.updateElement(document, fixer_pref, "fixer-menubar",
      map.org_element_id, map.area, map.before_element_id);
  },

  updateMenuButton : function () {
    const map = this._mappings["fixer-menu-button"];
    const fixer_pref = this._prefBranch.getBoolPref(this._MENU_BUTTON_PREF);
    this.updateElement(document, fixer_pref, "fixer-menu-button",
      map.org_element_id, map.area, map.before_element_id);
  },

  updatePrefOnCustomizationChange: function(fixer_pref_id, fixer_element_id) {
    const fixer_pref = this._prefBranch.getBoolPref(fixer_pref_id);
    const fixer_element_visible = (CustomizableUI.getPlacementOfWidget(fixer_element_id) != null);
    if (fixer_pref !== fixer_element_visible) {
      this.printState("updatePrefOnCustomizationChange", fixer_element_id, document);
      this._prefBranch.setBoolPref(fixer_pref_id, fixer_element_visible);
      return true;
    }
    return false;
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
window.addEventListener("unload", () => { ff4uifix_Fixer.cleanup(); }, false);
