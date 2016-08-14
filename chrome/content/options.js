var ff4uifix_Options = {
	init : function() {
		var browserDoc = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator)
			.getMostRecentWindow("navigator:browser").document;

		//Hide "Make Firefox Menu Button Movable" if it's not supported in browser
		var appbuttonHandle = browserDoc.getElementById("PanelUI-menu-button");
		if (appbuttonHandle == null) {
			var menuPref = document.getElementById("fixer-menu-pref");
			menuPref.hidden = true;
		}
	}
}

window.addEventListener("load", function () { ff4uifix_Options.init(); }, false);
