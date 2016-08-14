var ff4uifix_Fixer = {
	_MENU_BUTTON_PREF: "menu",
	_NEW_TAB_PREF : "newtab",
	_MENUBAR_PREF : "classicmenumov",
	_prefBranch   : undefined,
	_showMovableMenu : false,
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
		var fixer_menubarpref = this._prefBranch.getBoolPref(this._MENUBAR_PREF);
		var fixer_menubar = document.getElementById("fixer-menubar");

		if (starting == true && fixer_menubarpref == false) {
			if (fixer_menubar != null) { this.removeButton(fixer_menubar); }
			return;
		}

		var menubar = document.getElementById("menubar-items");

		if (menubar == null) {
			this.removeButton(fixer_menubar);
			return;
		}

		var menubartoolbar = document.getElementById(window.CustomizableUI.AREA_MENUBAR);

		if (fixer_menubarpref == true) {
			// If the Fixer element is not visible, add it to the Navbar
			if (fixer_menubar == null) {
				window.CustomizableUI.addWidgetToArea("fixer-menubar", window.CustomizableUI.AREA_MENUBAR);
				fixer_menubar = document.getElementById("fixer-menubar");
			}
			fixer_menubar.appendChild(menubar);
		} else {
			if (fixer_menubar != null && menubartoolbar != null) {
				menubartoolbar.insertBefore(menubar, null);
				this.removeButton(fixer_menubar);
			}
		}
	},

	updateMenuButton : function (starting) {
		this._showMovableMenu = this._prefBranch.getBoolPref(this._MENU_BUTTON_PREF);
		var fixer_menubutton = document.getElementById("fixer-menu-button");

		if (starting == true && this._showMovableMenu == false) {
			if (fixer_menubutton != null) { this.removeButton(fixer_menubutton); }
			return;
		}

		var appbutton = document.getElementById("PanelUI-button");

		if (appbutton == null) {
			this.removeButton(fixer_menubutton);
			return;
		}

		var navbar = document.getElementById("nav-bar");
		var windowcontrols = document.getElementById("window-controls");

		if (this._showMovableMenu == true) {
			// If the Fixer element is not visible, add it to the Navbar
			if (fixer_menubutton == null && windowcontrols != null) {
				window.CustomizableUI.addWidgetToArea("fixer-menu-button", window.CustomizableUI.AREA_NAVBAR);
				fixer_menubutton = document.getElementById("fixer-menu-button");
			}
			fixer_menubutton.appendChild(appbutton);
		}
		else {
			if (fixer_menubutton != null && navbar != null) {
				navbar.insertBefore(appbutton, windowcontrols);
				this.removeButton(fixer_menubutton);
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
