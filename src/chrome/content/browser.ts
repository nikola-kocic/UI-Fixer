/* global Components */
/* global CustomizableUI */
/* global BrowserOpenTab */

type Mapping = {
  fixer_pref_id: string,
  org_element_id: string,
  area: string,
  before_element_id: string | null,
}

const ff4uifix_Fixer = (function ff4uifix_Fixer_f() {
  const _MENU_BUTTON_PREF = "menu";
  const _NEW_TAB_PREF = "newtab";
  const _MENUBAR_PREF = "classicmenumov";
  const _mappings: {[key: string]: Mapping} = {
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

  // Load Preferences
  const prefService = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
  const _prefBranch: IPrefBranch = prefService.getBranch("extensions.ff4uifix.");

  // Shows/hides "New Tab" option in Tab Context Menu
  function updateNewtab(): void {
    const fixer_newtabpref = _prefBranch.getBoolPref(_NEW_TAB_PREF);

    const fixer_newtab = document.getElementById("fixer-newtab");
    if (fixer_newtabpref === true) {
      if (fixer_newtab == null) {
        const newTabMenuItem = document.getElementById("menu_newNavigatorTab");
        const fixer_newtabelement = document.createElement("menuitem");
        fixer_newtabelement.setAttribute("id", "fixer-newtab");
        fixer_newtabelement.setAttribute("label", (newTabMenuItem as any).label);
        fixer_newtabelement.addEventListener("click", BrowserOpenTab, false);

        const tabcontext = document.getElementById("tabContextMenu");
        if (tabcontext) {
          tabcontext.insertBefore(fixer_newtabelement, tabcontext.firstChild);
        }
      } else {
        fixer_newtab.hidden = false;
      }
    } else if (fixer_newtab) { // fixer_newtabpref == false
      fixer_newtab.hidden = true;
    }
  }

  function restoreOriginalElement(d: Document, org_element: HTMLElement, area: string, before_element_id: string | null): boolean {
    const before_element = before_element_id == null ? null : d.getElementById(before_element_id);
    if (org_element != null) {
      const orgelem_toolbar = d.getElementById(area);
      if (orgelem_toolbar) {
        if (orgelem_toolbar.insertBefore(org_element, before_element)) {
          return true;
        }
      }
    }
    return false;
  }

  function updateElement(d: Document, fixer_pref: boolean, fixer_element_id: string, org_element_id: string, area: string, before_element_id: string | null): boolean {
    const fixer_element_visible = (CustomizableUI.getPlacementOfWidget(fixer_element_id) != null);
    // If element is not placed, if customize toolbar is open,
    // we can still access it using getElementById
    const org_element = d.getElementById(org_element_id);
    let success = false;
    if (fixer_pref === true) {
      if (fixer_element_visible) {
        if (org_element && (org_element.parentNode as HTMLElement).id !== fixer_element_id) {
          const fixer_element = d.getElementById(fixer_element_id);
          if (fixer_element) {
            fixer_element.appendChild(org_element);
            success = true;
          }
        }
      } else {  // fixer_element_visible == false
        // Add fixer element, callback will move the original element inside
        CustomizableUI.addWidgetToArea(fixer_element_id, area);
        success = true;
      }
    } else { // fixer_pref == false
      if (fixer_element_visible) {
        if (org_element) {
          restoreOriginalElement(d, org_element, area, before_element_id);
        }
        CustomizableUI.removeWidgetFromArea(fixer_element_id);
        success = true;
      } else {  // fixer_element_visible == false
        if (!org_element) {
          // TODO: CustomizableUI:Widget 'PanelUI-button' not found, unable to move
          CustomizableUI.addWidgetToArea(org_element_id, area);
        } else if ((org_element.parentNode as HTMLElement).id === fixer_element_id) {
          restoreOriginalElement(d, org_element, area, before_element_id);
          success = true;
        }
      }
    }
    return success;
  }

  function updateMenubar(): void {
    const map = _mappings["fixer-menubar"];
    const fixer_pref = _prefBranch.getBoolPref(_MENUBAR_PREF);
    updateElement(document, fixer_pref, "fixer-menubar",
      map.org_element_id, map.area, map.before_element_id);
  }

  function updateMenuButton(): void {
    const map = _mappings["fixer-menu-button"];
    const fixer_pref = _prefBranch.getBoolPref(_MENU_BUTTON_PREF);
    updateElement(document, fixer_pref, "fixer-menu-button",
      map.org_element_id, map.area, map.before_element_id);
  }

  function updatePrefOnCustomizationChange(fixer_pref_id: string, fixer_element_id: string): boolean {
    const fixer_pref = _prefBranch.getBoolPref(fixer_pref_id);
    const fixer_element_placement = CustomizableUI.getPlacementOfWidget(fixer_element_id);
    const fixer_element_visible = (fixer_element_placement !== null && fixer_element_placement.area !== CustomizableUI.AREA_PANEL);
    if (fixer_pref !== fixer_element_visible) {
      _prefBranch.setBoolPref(fixer_pref_id, fixer_element_visible);
      return true;
    }
    return false;
  }

  const prefObserver: IObserver = {
    observe(aSubject, aTopic, aData): void {
      if (aTopic !== "nsPref:changed") {
        return;
      }

      if (aData === _NEW_TAB_PREF) {
        updateNewtab();
      } else if (aData === _MENU_BUTTON_PREF) {
        updateMenuButton();
      } else if (aData === _MENUBAR_PREF) {
        updateMenubar();
      }
    },
  };

  function init(): void {
    // Update UI
    updateNewtab();
    updateMenuButton();
    updateMenubar();

    // Add Preference Changed Events
    _prefBranch.addObserver(_MENU_BUTTON_PREF, prefObserver, false);
    _prefBranch.addObserver(_NEW_TAB_PREF, prefObserver, false);
    _prefBranch.addObserver(_MENUBAR_PREF, prefObserver, false);

    const listener: ICustomizeObserver = {
      onWidgetBeforeDOMChange(aNode, aNextNode, aContainer, aIsRemoval) {
        if ({}.hasOwnProperty.call(_mappings, aNode.id)) {
          if (aIsRemoval) {
            const d = aNode.ownerDocument;
            const map = _mappings[aNode.id];
            if (updatePrefOnCustomizationChange(map.fixer_pref_id, aNode.id) === false) {
              // const fixer_pref = _prefBranch.getBoolPref(map.fixer_pref_id);
              // updateElement(d, fixer_pref, aNode.id, map.org_element_id, map.area, map.before_element_id);
            }
          }
        }
      },
      onWidgetAdded(aWidgetId, aArea, aPosition) {
        if ({}.hasOwnProperty.call(_mappings, aWidgetId)) {
          const map = _mappings[aWidgetId];
          if (updatePrefOnCustomizationChange(map.fixer_pref_id, aWidgetId) === false) {
            const fixer_pref = _prefBranch.getBoolPref(map.fixer_pref_id);
            // Call updateElement so original element is moved to newly added fixer element
            updateElement(document, fixer_pref, aWidgetId, map.org_element_id, map.area, map.before_element_id);
          }
        }
      },
      onAreaReset(aArea, aContainer) {
        // use const after https://bugzilla.mozilla.org/show_bug.cgi?id=1101653 is fixed
        // eslint-disable-next-line prefer-const
        for (let k of Object.keys(_mappings)) {
          const map = _mappings[k];
          if (map.area === aArea) {
            const fixer_pref = _prefBranch.getBoolPref(map.fixer_pref_id);
            if (fixer_pref) {
              CustomizableUI.addWidgetToArea(k, aArea);
            }
          }
        }
      },
    };
    CustomizableUI.addListener(listener);
  }

  function cleanup(): void {
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
  window.removeEventListener("load", load, false);  // remove listener, no longer needed
  ff4uifix_Fixer.init();
}, false);
window.addEventListener("unload", () => { ff4uifix_Fixer.cleanup(); }, false);
