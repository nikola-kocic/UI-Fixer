/* global Components */
/* global CustomizableUI */
/* global BrowserOpenTab */

const ff4uifix_Fixer = (function ff4uifix_Fixer_f() {
  const _MENU_BUTTON_PREF = "menu";
  const _NEW_TAB_PREF = "newtab";
  const _MENUBAR_PREF = "classicmenumov";
  let _prefBranch = null;
  const _mappings = {
    "fixer-menu-button" : {
      fixer_pref_id: "menu",
      org_element_id: "PanelUI-button",
      area: CustomizableUI.AREA_NAVBAR,
      before_element_id: "window-controls",
    },
    "fixer-menubar" : {
      fixer_pref_id: "classicmenumov",
      org_element_id: "menubar-items",
      area: CustomizableUI.AREA_MENUBAR,
      before_element_id: null,
    },
  };

  function printState(prefix, mapkey, d) {
    const map = _mappings[mapkey];
    const fixer_element_placement = CustomizableUI.getPlacementOfWidget(mapkey);
    const fixer_element = d.getElementById(mapkey);
    const org_element = d.getElementById(map.org_element_id);
    const fixer_pref = _prefBranch.getBoolPref(map.fixer_pref_id);
    console.log(`${prefix}, id=${mapkey}, fixer_pref=${fixer_pref}\
, fixer_element_placement=${JSON.stringify(fixer_element_placement)}\
, fixer_element=${fixer_element ? "true" : "false"}\
, org_element=${org_element ? "true" : "false"}\
, org_element parent=${org_element ? org_element.parentNode.id : "N/A"}`
      //, `document = ${d.title}`
    );
  }

  //Shows/hides "New Tab" option in Tab Context Menu
  function updateNewtab() {
    const fixer_newtabpref = _prefBranch.getBoolPref(_NEW_TAB_PREF);

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
  }

  function restoreOriginalElement(d, org_element, area, before_element_id) {
    const before_element = before_element_id == null ? null : d.getElementById(before_element_id);
    if (org_element != null) {
      const orgelem_toolbar = d.getElementById(area);
      orgelem_toolbar.insertBefore(org_element, before_element);
    }
  }

  function updateElement(d, fixer_pref, fixer_element_id, org_element_id, area, before_element_id) {
    printState("updateElement", fixer_element_id, d);
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
        restoreOriginalElement(d, org_element, area, before_element_id);
        CustomizableUI.removeWidgetFromArea(fixer_element_id);
      } else {  // fixer_element_visible == false
        if (!org_element) {
          // TODO: CustomizableUI:Widget 'PanelUI-button' not found, unable to move
          CustomizableUI.addWidgetToArea(org_element_id, area);
        } else if (org_element.parentNode.id == fixer_element_id) {
          restoreOriginalElement(d, org_element, area, before_element_id);
        }
      }
    }
  }

  function updateMenubar() {
    const map = _mappings["fixer-menubar"];
    const fixer_pref = _prefBranch.getBoolPref(_MENUBAR_PREF);
    updateElement(document, fixer_pref, "fixer-menubar",
      map.org_element_id, map.area, map.before_element_id);
  }

  function updateMenuButton() {
    const map = _mappings["fixer-menu-button"];
    const fixer_pref = _prefBranch.getBoolPref(_MENU_BUTTON_PREF);
    updateElement(document, fixer_pref, "fixer-menu-button",
      map.org_element_id, map.area, map.before_element_id);
  }

  function updatePrefOnCustomizationChange(fixer_pref_id, fixer_element_id) {
    const fixer_pref = _prefBranch.getBoolPref(fixer_pref_id);
    const fixer_element_visible = (CustomizableUI.getPlacementOfWidget(fixer_element_id) != null);
    if (fixer_pref !== fixer_element_visible) {
      printState("updatePrefOnCustomizationChange", fixer_element_id, document);
      _prefBranch.setBoolPref(fixer_pref_id, fixer_element_visible);
      return true;
    }
    return false;
  }

  const prefObserver = {
    observe(aSubject, aTopic, aData) {
      if (aTopic != "nsPref:changed") {
        return;
      }

      if (aData == _NEW_TAB_PREF) {
        updateNewtab();
      } else if (aData == _MENU_BUTTON_PREF) {
        updateMenuButton();
      } else if (aData == _MENUBAR_PREF) {
        updateMenubar();
      }
    },
  };

  function init() {
    //Load Preferences
    const prefService = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
    _prefBranch = prefService.getBranch("extensions.ff4uifix.");
    _prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);

    //Update UI
    updateNewtab();
    updateMenuButton();
    updateMenubar();

    //Add Preference Changed Events
    _prefBranch.addObserver(_MENU_BUTTON_PREF, prefObserver, false);
    _prefBranch.addObserver(_NEW_TAB_PREF, prefObserver, false);
    _prefBranch.addObserver(_MENUBAR_PREF, prefObserver, false);

    const listener = {
      onWidgetBeforeDOMChange(aNode, aNextNode, aContainer, aIsRemoval) {
        if ({}.hasOwnProperty.call(_mappings, aNode.id)) {
          if (aIsRemoval) {
            const d = aNode.ownerDocument;
            //console.log(`onWidgetBeforeDOMChange aIsRemoval: id=${aNode.id}, document=${d.title}`);
            printState("onWidgetBeforeDOMChange aIsRemoval", aNode.id, d);
            const map = _mappings[aNode.id];
            if (updatePrefOnCustomizationChange(map.fixer_pref_id, aNode.id) == false) {
              // const fixer_pref = _prefBranch.getBoolPref(map.fixer_pref_id);
              //updateElement(d, fixer_pref, aNode.id, map.org_element_id, map.area, map.before_element_id);
            }
          }
        }
      },
      onWidgetAdded(aWidgetId, aArea, aPosition) {
        if ({}.hasOwnProperty.call(_mappings, aWidgetId)) {
          printState(`onWidgetAdded, area=${aArea}, position=${aPosition}`, aWidgetId, document);
          const map = _mappings[aWidgetId];
          if (updatePrefOnCustomizationChange(map.fixer_pref_id, aWidgetId) == false) {
            const fixer_pref = _prefBranch.getBoolPref(map.fixer_pref_id);
            // Call updateElement so original element is moved to newly added fixer element
            updateElement(document, fixer_pref, aWidgetId, map.org_element_id, map.area, map.before_element_id);
          }
        }
      },
      onWidgetRemoved(aWidgetId, aArea) {
        if ({}.hasOwnProperty.call(_mappings, aWidgetId)) {
          printState(`onWidgetRemoved, area=${aArea}`, aWidgetId, document);
      //     const map = _mappings[aWidgetId];
      //     updatePrefOnCustomizationChange(map.fixer_pref_id, aWidgetId);
        }
      },
      onWidgetAfterDOMChange(aNode, aNextNode, aContainer, aWasRemoval) {
        if ({}.hasOwnProperty.call(_mappings, aNode.id)) {
          console.log(`onWidgetAfterDOMChange, aNode.id = ${aNode.id}, aWasRemoval = ${aWasRemoval}`);
        }
      },
      onAreaReset(aArea, aContainer) {
        // use const after https://bugzilla.mozilla.org/show_bug.cgi?id=1101653 is fixed
        // eslint-disable-next-line prefer-const
        for (let k of Object.keys(_mappings)) {
          const map = _mappings[k];
          if (map.area === aArea) {
            printState(`onAreaReset, area=${aArea}, aContainer.id=${aContainer.id}`, k, document);
            const fixer_pref = _prefBranch.getBoolPref(map.fixer_pref_id);
            if (fixer_pref) {
              CustomizableUI.addWidgetToArea(k, aArea);
            }
          }
        }
      },
      onWidgetReset(aNode, aContainer) {
        if ({}.hasOwnProperty.call(_mappings, aNode.id)) {
          console.log(`onWidgetReset, aNode.id=${aNode.id}, aContainer.id=${aContainer.id}`);
        }
      },
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
      onWidgetInstanceRemoved(aWidgetId/*, aDocument*/) {
        console.log(`onWidgetInstanceRemoved aWidgetId=${aWidgetId}`);
      },
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
  }

  function cleanup() {
    _prefBranch.removeObserver(_MENU_BUTTON_PREF, prefObserver);
    _prefBranch.removeObserver(_NEW_TAB_PREF, prefObserver);
    _prefBranch.removeObserver(_MENUBAR_PREF, prefObserver);
  }
  return {
    init: init,
    cleanup: cleanup,
  };
}());

window.addEventListener("load", function load() {
  window.removeEventListener("load", load, false); //remove listener, no longer needed
  ff4uifix_Fixer.init();
}, false);
window.addEventListener("unload", () => { ff4uifix_Fixer.cleanup(); }, false);
