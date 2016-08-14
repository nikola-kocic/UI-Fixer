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
		this.updateNewtab(true);
		this.updateMenuButton(true);
		this.updateMenubar(true);

		//Add Preference Changed Events
		this._prefBranch.addObserver(this._MENU_BUTTON_PREF, this, false);
		this._prefBranch.addObserver(this._NEW_TAB_PREF, this, false);
		this._prefBranch.addObserver(this._MENUBAR_PREF, this, false);
	},

	observe : function (aSubject, aTopic, aData) {
		if (aTopic != "nsPref:changed")
			return;

		if (aData == this._NEW_TAB_PREF)
			this.updateNewtab(false);
		else if (aData == this._MENU_BUTTON_PREF)
			this.updateMenuButton(false);
		else if (aData == this._MENUBAR_PREF)
			this.updateMenubar(false);
	},

	//Shows/hides "New Tab" option in Tab Context Menu
	updateNewtab : function (starting) {
		var fixer_newtabpref = this._prefBranch.getBoolPref(this._NEW_TAB_PREF);
		if (starting == true && fixer_newtabpref == false) { return; }

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
			}
			else {
				fixer_newtab.hidden = false;
			}
		}
		else {
			document.getElementById("fixer-newtab").hidden = true;
		}
	},

	updateToolbar : function (toolbar, set) {
		toolbar.setAttribute("currentset", set);
		toolbar.currentSet = set;
		window.document.persist(toolbar.id, "currentset");
		try { BrowserToolboxCustomizeDone(true); }
		catch (e) { }
	},

	removeButton : function (buttonHandle) {
		if (buttonHandle != null) {
			window.CustomizableUI.removeWidgetFromArea(buttonHandle.id);
		}
	},

	//Moves Menubar to set location
	updateMenubar : function (starting) {
		var fixer_pref = this._prefBranch.getBoolPref(this._MENUBAR_PREF);
		const fixer_element_id = "fixer-menubar";
		var fixer_element = document.getElementById(fixer_element_id);

		if (starting == true && fixer_pref == false) {
			if (fixer_element != null) { this.removeButton(fixer_element); }
			return;
		}

		var org_element = document.getElementById("menubar-items");

		if (org_element == null && fixer_element != null) {
			this.removeButton(fixer_element);
			return;
		}

		if (fixer_pref == true) {
			// If the Fixer element is not visible, add it to the Navbar
			if (fixer_element == null) {
				window.CustomizableUI.addWidgetToArea(fixer_element_id, window.CustomizableUI.AREA_MENUBAR);
				fixer_element = document.getElementById(fixer_element_id);
			}
			fixer_element.appendChild(org_element);
		} else {  // fixer_pref == false
			var orgelem_toolbar = document.getElementById(window.CustomizableUI.AREA_MENUBAR);
			if (fixer_element != null && orgelem_toolbar != null) {
				orgelem_toolbar.insertBefore(org_element, null);
				this.removeButton(fixer_element);
			}
		}
	},

	updateMenuButton : function (starting) {
		var fixer_pref = this._prefBranch.getBoolPref(this._MENU_BUTTON_PREF);
		const fixer_element_id = "fixer-menu-button";
		var fixer_element = document.getElementById(fixer_element_id);

		if (starting == true && fixer_pref == false) {
			if (fixer_element != null) { this.removeButton(fixer_element); }
			return;
		}

		var org_element = document.getElementById("PanelUI-button");

		if (org_element == null && fixer_element != null) {
			this.removeButton(fixer_element);
			return;
		}

		if (fixer_pref == true) {
			// If the Fixer element is not visible, add it to the Navbar
			if (fixer_element == null) {
				window.CustomizableUI.addWidgetToArea(fixer_element_id, window.CustomizableUI.AREA_NAVBAR);
				fixer_element = document.getElementById(fixer_element_id);
			}
			fixer_element.appendChild(org_element);
		} else {  // fixer_pref == false
			var orgelem_toolbar = document.getElementById(window.CustomizableUI.AREA_NAVBAR);
			var windowcontrols = document.getElementById("window-controls");
			if (fixer_element != null && orgelem_toolbar != null) {
				orgelem_toolbar.insertBefore(org_element, windowcontrols);
				this.removeButton(fixer_element);
			}
		}
	},

	isElementPlaced: function(aWidgetId) {
		const element_placed = window.CustomizableUI.getPlacementOfWidget(aWidgetId) !== null;
		return element_placed;
	},

	CustomizationChange : function () {
		//Movable Firefox Menu Button
		var fixer_menupref = this._prefBranch.getBoolPref(this._MENU_BUTTON_PREF);
		const fixer_menubutton_visible = this.isElementPlaced("fixer-menu-button");
		if (fixer_menupref !== fixer_menubutton_visible) {
			this._prefBranch.setBoolPref(this._MENU_BUTTON_PREF, fixer_menubutton_visible);
		}

		//Movable Menu Bar
		var fixer_menubarpref = this._prefBranch.getBoolPref(this._MENUBAR_PREF);
		const fixer_menubar_visible = this.isElementPlaced("fixer-menubar");
		if (fixer_menubarpref !== fixer_menubar_visible) {
			this._prefBranch.setBoolPref(this._MENUBAR_PREF, fixer_menubar_visible);
		}
	},

	cleanup : function () {
		this._prefBranch.removeObserver(this._MENU_BUTTON_PREF, this);
		this._prefBranch.removeObserver(this._NEW_TAB_PREF, this);
		this._prefBranch.removeObserver(this._MENUBAR_PREF, this);
	}
}

window.addEventListener("load", function () { ff4uifix_Fixer.init(); }, false);
window.addEventListener("customizationchange", function () { ff4uifix_Fixer.CustomizationChange(); }, false);
window.addEventListener("unload", function () { ff4uifix_Fixer.cleanup(); }, false);
