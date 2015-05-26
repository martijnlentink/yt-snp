/*
 * Seek 'n Play is an application developed by Circularify
 */

// Main method
window.onload = function() {
 
	// First globalize the options page
	YTSNP.i18n.performTranslation();

	// Hide 'hide this page' options when already hidden
	chrome.storage.sync.get('settings', function (container) {
		if (container.settings && container.settings["hide-welcome"]) {
			document.getElementById("welcomeOptions").style.display = "none";
		}
	});
	
	// Show changelog with current language
	fillChangelog(window.navigator.language);
	YTSNP.settings.ready = function () {
		YTSNP.settings.bind();
	};
};

// Method for filling the changelog in the proper language
function fillChangelog(lang) {
	var lang = lang.substr(0, 2);
	
	// Get the current language log
	var logs = changelog[lang] || changelog["en"];

	// Reference the What's New section
	var ref = document.getElementById("whatsNew");
	
	// Loop through all log items
	for(var i = 0; i < logs.length; i++) {
	
		// Reference log item
		var item = logs[i];
	
		// Add version number to HTML.
		ref.innerHTML += "<h3>" + item.title + "</h3>";
		
		// Reference for list of changes
		var code = "";
			
		code += "<ul>";
		
		for(var j = 0; j < item.log.length; j++) {

			// Add changes for version to variable
			code += "<li>" + item.log[j].message + "</li>";
		}
		
		code += "</ul>";
		
		// Show version data 
		ref.innerHTML += code;
	}
};

// Array containing changelog data
var changelog = {

	"de": [
		
		{
			"title": "Version 1.5",
			"log": [
				{ "message": "Fest groﬂen Fehler, weil Seek 'n Play nicht mehr funktionieren." }
			]
		},{
			"title": "Version 1.4.1",
			"log": [
				{ "message": "Einige Probleme mit den &Uuml;bersetzungen wurden behoben;" },
				{ "message": "Der Startbildschirm kann nun deaktiviert werden." }
			]
		},{
			"title": "Version 1.4",
			"log": [
				{ "message": "Startseite hinzugef&uuml;gt, welche auf Updates und bekannte Fehler hinweist." }
			]
		},{
			"title": "Version 1.3.4",
			"log": [
				{ "message": "Fehler behoben, durch welchen die Buttons im Youtube-Player immer angezeigt wurden." }
			]
		},{
			"title": "Version 1.3.3",
			"log": [
				{ "message": "Fehler behoben, sodass das Video jetzt immer an der richtigen Stelle fortgesetzt wird.." }
			]
		},{
			"title": "Version 1.3.2",
			"log": [
				{ "message": "Der YouTube-Player setzt das Video jetzt beim zur&uuml;ckgehen an der gleichen Stelle fort." }
			]
		},{
			"title": "Version 1.3.1",
			"log": [
				{ "message": "Kleinere Fehler beseitigt." }
			]
		},{
			"title": "Version 1.3",
			"log": [
				{ "message": "Problem, welches eine weitere Ausf&uuml;hrung der Erweiterung verhinderte, wurde beseitigt;" },
				{ "message": "Optionsmen&uuml; zur Ver&auml;nderung der Position des YouTube-Players hinzugef&uuml;gt." }
			]
		},{
			"title": "Version 1.2",
			"log": [
				{ "message": "Button zum Schlie&szlig;en des Players im Suchmodus hinzugef&uuml;gt;" },
				{ "message": "Button, um zur&uuml;ck zum Video zu gehen, hinzugef&uuml;gt" },
				{ "message": "Probleme mit dem YouTube-Player auf manchen Ger&auml;ten behoben." }
			]
		},{
			"title": "Version 1.1",
			"log": [
				{ "message": "Videos werden jetzt in 16:9 abgespielt;" },
				{ "message": "Der YouTube-Player wird jetzt auf allen Ger&auml;ten richtig angezeigt." }
			]
		},{
			"title": "Version 1.0",
			"log": [
				{ "message": "Erste Ver&ouml;ffentlichung." }
			]
		}
	],

	"en": [
		
		{
			"title": "Version 1.5",
			"log": [
				{ "message": "Fixed large bug causing Seek 'n Play to no longer work." }
			]
		},{
			"title": "Version 1.4.1",
			"log": [
				{ "message": "Fixed some internationalization issues;" },
				{ "message": "Added option to suppress welcome screen." }
			]
		},{
			"title": "Version 1.4",
			"log": [
				{ "message": "Added welcome page, so we can notify people with known bugs and updates." }
			]
		},{
			"title": "Version 1.3.4",
			"log": [
				{ "message": "Fixed bug with controls showing up when they're not supposed to." }
			]
		},{
			"title": "Version 1.3.3",
			"log": [
				{ "message": "Fixed bug with player not always resuming the video where you left off." }
			]
		},{
			"title": "Version 1.3.2",
			"log": [
				{ "message": "Player now continues where you left off when you go back." }
			]
		},{
			"title": "Version 1.3.1",
			"log": [
				{ "message": "Small bug fix." }
			]
		},{
			"title": "Version 1.3",
			"log": [
				{ "message": "Resolved problem with extension no longer working;" },
				{ "message": "Added options pane where you can change the player position." }
			]
		},{
			"title": "Version 1.2",
			"log": [
				{ "message": "Added a button so you can close the video player in search mode;" },
				{ "message": "Added a button to allow you to go back to a video from search mode;" },
				{ "message": "Fixed player issues on some machines." }
			]
		},{
			"title": "Version 1.1",
			"log": [
				{ "message": "Videos now play in 16:9 ratio;" },
				{ "message": "Fixed player visibility issue on some machines." }
			]
		},{
			"title": "Version 1.0",
			"log": [
				{ "message": "Initial release." }
			]
		}
	],

	"nl": [
		
		{
			"title": "Version 1.5",
			"log": [
				{ "message": "Grote fout opgelost die er voor zorgde dat Seek 'n Play niet meer werkte." }
			]
		},{
			"title": "Versie 1.4.1",
			"log": [
				{ "message": "Enkele fouten met internationalisering opgelost;" },
				{ "message": "Instellingen toegevoegd zodat het tonen van het startscherm configurabel is." }
			]
		},{
			"title": "Versie 1.4",
			"log": [
				{ "message": "Welkompagina toegevoegd zodat we gebruikers op de hoogte kunnen stellen van problemen en updates." }
			]
		},{
			"title": "Versie 1.3.4",
			"log": [
				{ "message": "Probleem opgelost dat de controls zichtbaar zijn op plekken waar dat niet hoort." }
			]
		},{
			"title": "Versie 1.3.3",
			"log": [
				{ "message": "Probleem opgelost dat de video niet altijd verder gaat waar je gebleven was." }
			]
		},{
			"title": "Versie 1.3.2",
			"log": [
				{ "message": "Video gaat nu verder waar je gebleven was als je terug gaat naar de video." }
			]
		},{
			"title": "Versie 1.3.1",
			"log": [
				{ "message": "Klein foutje opgelost." }
			]
		},{
			"title": "Versie 1.3",
			"log": [
				{ "message": "Probleem waardoor de extensie niet meer werkte opgelost;" },
				{ "message": "Instellingenscherm toegevoegd waar de speler positie ingesteld kan worden." }
			]
		},{
			"title": "Versie 1.2",
			"log": [
				{ "message": "Knop toegevoegd om de speler te kunnen sluiten in zoek-modus';" },
				{ "message": "Knop toegevoegd om vanuit de zoek-modus terug te gaan naar een video;" },
				{ "message": "Problemen opgelost met de speler op enkele machines." }
			]
		},{
			"title": "Versie 1.1",
			"log": [
				{ "message": "Player speelt nu video's in 16:9 ratio;" },
				{ "message": "Zichtbaarheidsproblemen op sommige machines opgelost." }
			]
		},{
			"title": "Versie 1.0",
			"log": [
				{ "message": "Initi&euml;le release." }
			]
		}
	]
};