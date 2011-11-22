var ff4uifix_Fixer = {
	_MENU_PREF    : "menu",
	_NEW_TAB_PREF : "newtab",
	_STATUSBAR_PREF : "statusbarmov",
	_MENUBAR_PREF : "classicmenumov",
	_TITLEBAR_PREF : "fftitlebar",
	_prefBranch   : undefined,
	_ORIGupdateAppButtonDisplay : undefined,
	_showMovableMenu : false,
	init : function() {
	
		// Keep original updateAppButtonDisplay function
		try { this._ORIGupdateAppButtonDisplay = window.updateAppButtonDisplay; }
		catch (e) { }
		
		//Load Preferences
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService);
		this._prefBranch = prefService.getBranch("extensions.ff4uifix.");
		this._prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);
		
		//Update UI
		this.updateStatusbar(true);
		this.updateNewtab(true);
		this.updateMenuButton(true);
		this.updateMenubar(true); 
		this.updateTitlebar(true);
		
		//Add Preference Changed Events
		this._prefBranch.addObserver(this._MENU_PREF, this, false);
		this._prefBranch.addObserver(this._NEW_TAB_PREF, this, false);
		this._prefBranch.addObserver(this._STATUSBAR_PREF, this, false);
		this._prefBranch.addObserver(this._MENUBAR_PREF, this, false);
		this._prefBranch.addObserver(this._TITLEBAR_PREF, this, false);
	},
	
	observe : function (aSubject, aTopic, aData) {
		if (aTopic != "nsPref:changed")
			return;
		 
		if (aData == this._STATUSBAR_PREF)
			this.updateStatusbar(false);
		else if (aData == this._NEW_TAB_PREF)
			this.updateNewtab(false);
		else if (aData == this._MENU_PREF)
			this.updateMenuButton(false);		
		else if (aData == this._MENUBAR_PREF)
			this.updateMenubar(false);
		else if (aData == this._TITLEBAR_PREF)
			this.updateTitlebar(false);
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
			var menuparent = buttonHandle.parentNode;
			var newset = menuparent.getAttribute("currentset").split(",");
			var i = newset.indexOf(buttonHandle.id);
			if (i>=0) {
				newset.splice(i, 1);
				newset = newset.join(",");
				this.updateToolbar(menuparent, newset);
			}
		}
	},
	
	updateTitlebarLayout : function(){		
		var titlebar = document.getElementById("titlebar");
		if (titlebar != null) {
			let docElement = document.documentElement;
			if (docElement.getAttribute("tabsintitlebar") == "true") {
				TabsInTitlebar.allowedBy("pref", false);
				TabsInTitlebar.allowedBy("pref", true);
			}
		}
	},

	//Changed updateAppButtonDisplay function to disable custom Titlebar
	fixer_updateAppButtonDisplay : function () {
		let titlebar = document.getElementById("titlebar");
		if (titlebar != null) {
			titlebar.hidden = true;
			document.documentElement.removeAttribute("chromemargin");
		}
	},
	
	updateTitlebar : function (starting) {
		var fixer_titlebarpref = this._prefBranch.getBoolPref(this._TITLEBAR_PREF);
		if (starting == true && fixer_titlebarpref == false) { return; }
		
		if (fixer_titlebarpref == true){
			window.updateAppButtonDisplay = this.fixer_updateAppButtonDisplay;
			TabsInTitlebar.allowedBy("pref", false);
			updateAppButtonDisplay();
		}
		else {
			window.updateAppButtonDisplay = this._ORIGupdateAppButtonDisplay; 
			TabsInTitlebar._readPref();
			updateAppButtonDisplay();
			this.updateTitlebarLayout();
		}
	},
	
	//Moves Statusbar to set location
	updateStatusbar : function (starting) {
		
		var fixer_statusbarpref = this._prefBranch.getBoolPref(this._STATUSBAR_PREF);
		var fixer_statusbar = document.getElementById("fixer-status-bar");
		if (starting == true && fixer_statusbarpref == false && fixer_statusbar != null) { this.removeButton(fixer_statusbar); }
		if (starting == true && fixer_statusbarpref == false) { return; }
		
		var statusbar = document.getElementById("status-bar");
		
		if(fixer_statusbarpref == true) {
			if(fixer_statusbar == null) {
				statusbar.parentNode.insertItem("fixer-status-bar", statusbar, null, false);
				this.updateToolbar(statusbar.parentNode, statusbar.parentNode.currentSet);
				fixer_statusbar = document.getElementById("fixer-status-bar");
			}
			statusbar.setAttribute("style", "background-color: transparent;");
			fixer_statusbar.appendChild(statusbar);
		}
		else {
			if(fixer_statusbar == null) { return; }
			var addonbar = document.getElementById("addon-bar");
			addonbar.appendChild(statusbar);
			this.removeButton(fixer_statusbar);
		}
	},
	
	//Moves Menubar to set location
	updateMenubar : function (starting) {
		var fixer_menubarpref = this._prefBranch.getBoolPref(this._MENUBAR_PREF);
		if (starting == true && fixer_menubarpref == false) { return; }
		
		var menubar = document.getElementById("menubar-items");
		
		if(fixer_menubarpref == true) {
			menubar.setAttribute("removable", "true");
		}
	
		else {
			var menutoolbar = document.getElementById("toolbar-menubar");
			if(menubar == null){
				menutoolbar.insertItem("menubar-items", null, null, false);
				this.updateToolbar(menutoolbar, menutoolbar.currentSet);
				menubar = document.getElementById("menubar-items");
			}
			if(menubar.parentNode.id != menutoolbar.id){
				var oldtoolbar = menubar.parentNode;
				menutoolbar.appendChild(menubar);
				this.updateToolbar(oldtoolbar, oldtoolbar.currentSet);
			}
			menubar.removeAttribute("removable"); 
		}
	},
	
	updateMenuButton : function (starting) {
		this._showMovableMenu = this._prefBranch.getBoolPref(this._MENU_PREF);
		var fixer_menubutton = document.getElementById("fixer-menu-button");

		if (starting == true && this._showMovableMenu == false && fixer_menubutton != null) { this.removeButton(fixer_menubutton); }
		if (starting == true && this._showMovableMenu == false) { return; }
		
		var appbutton = document.getElementById("appmenu-button");
		if (appbutton == null) appbutton= document.getElementById("appmenu-toolbar-button");
		
		if (appbutton == null) {
			this.removeButton(fixer_menubutton); 
			return; 
		}
		
		if (this._showMovableMenu == true) {
			
			//If Movable Firefox Menu button is not visible, add it at start of Navigation Toolbar
			if (fixer_menubutton == null) {
				var tabtoolbar = document.getElementById("TabsToolbar");
				tabtoolbar.insertItem("fixer-menu-button", tabtoolbar.firstChild, null, false);
				this.updateToolbar(tabtoolbar, tabtoolbar.currentSet);
				
				fixer_menubutton = document.getElementById("fixer-menu-button");
			}
			
			fixer_menubutton.appendChild(appbutton);
		}
		else {
			if(fixer_menubutton == null) { return; }
			
			var appbuttoncontainer = document.getElementById("appmenu-button-container");
			
			if (appbuttoncontainer != null) {
				appbuttoncontainer.appendChild(appbutton);
			}
			else
			{
				var tabstoolbar = document.getElementById("TabsToolbar");
				tabstoolbar.insertBefore(appbutton, tabstoolbar.firstChild);
			}
			
			this.removeButton(fixer_menubutton);
		}
		
		if (starting == false){
			this.updateTitlebarLayout();
		}
	},
	
	CustomizationChange : function () {
	
		//Movable Firefox Menu Button
		var fixer_menupref = this._prefBranch.getBoolPref(this._MENU_PREF);
		var fixer_menubutton = document.getElementById("fixer-menu-button");
		if (fixer_menupref == true && fixer_menubutton == null) {
				//If fixer-menu-button is removed from toolbars, return appmenu-button element to appmenu-button-container and deactivate "Make Firefox Menu Button movable"
				
				//Place fixer-menu-button on nav-bar (so appmenu-button element is accessible)
				var tabtoolbar = document.getElementById("TabsToolbar");
				tabtoolbar.insertItem("fixer-menu-button", tabtoolbar.firstChild, null, false);
				this.updateToolbar(tabtoolbar, tabtoolbar.currentSet);
				
				//Set pref to false (also removes fixer-menu-button element)
				this._prefBranch.setBoolPref(this._MENU_PREF, false);
		}
		else if (fixer_menupref == false && fixer_menubutton != null) {
			this._prefBranch.setBoolPref(this._MENU_PREF, true);
		}
		
		
		
		//Movable Statusbar
		var fixer_statusbarpref = this._prefBranch.getBoolPref(this._STATUSBAR_PREF);
		var fixer_statusbar = document.getElementById("fixer-status-bar");
		if (fixer_statusbarpref == true && fixer_statusbar == null) {
				//If fixer-status-bar is removed from toolbars, return status-bar element to addon-bar and deactivate "Make Status Bar movable"
				
				//Place fixer-status-bar on addon-bar (so status-bar element is accessible)
				var addonbar = document.getElementById("addon-bar");
				addonbar.insertItem("fixer-status-bar", null, null, false);
				this.updateToolbar(addonbar, addonbar.currentSet);

				//Set pref to false (also removes fixer-status-bar element)
				this._prefBranch.setBoolPref(this._STATUSBAR_PREF, false);
		}
		else if (fixer_statusbarpref == false && fixer_statusbar != null) {
			this._prefBranch.setBoolPref(this._STATUSBAR_PREF, true);
		}
		
		
		//Movable Menu Bar
		var fixer_menubarpref = this._prefBranch.getBoolPref(this._MENUBAR_PREF);
		var menubar = document.getElementById("menubar-items");
		if (fixer_menubarpref == true && menubar == null) {
				//If menubar-items is removed from toolbars, return menubar-items element to toolbar-menubar and deactivate "Make Menu Bar movable"
				
				//Set pref to false (and restore menubar-items default position)
				this._prefBranch.setBoolPref(this._MENUBAR_PREF, false);
		}
	},
	
	cleanup : function () {
		this._prefBranch.removeObserver(this._MENU_PREF, this);
		this._prefBranch.removeObserver(this._NEW_TAB_PREF, this);
		this._prefBranch.removeObserver(this._STATUSBAR_PREF, this);
		this._prefBranch.removeObserver(this._MENUBAR_PREF, this);
	}
}

window.addEventListener("load", function () { ff4uifix_Fixer.init(); }, false);
window.addEventListener("customizationchange", function () { ff4uifix_Fixer.CustomizationChange(); }, false);
window.addEventListener("unload", function () { ff4uifix_Fixer.cleanup(); }, false);
