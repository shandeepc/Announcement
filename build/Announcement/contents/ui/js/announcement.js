/*
Project - Announcement
Author - Shandeep - https://www.linkedin.com/in/shandeepsrinivas/
*/

function aobserverForMutation(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  var xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return xsrfCookies[0].split(name+'=')[1];
}

async function getPluginId(pName, xxsrfToken) {
	var base_URL = window.location.origin;
	var plugins = new XMLHttpRequest();
	plugins.withCredentials = true;
	var prID = null;
	plugins.addEventListener("readystatechange", function() {
		if(this.readyState === 4) {
			var pluginObj = JSON.parse(this.response).objects.filter(c => c.name == pName);
			if(pluginObj) {
				var pluginID = pluginObj[0].id;
				prID = pluginID
			}
		}
	});
		
	plugins.open("GET", base_URL + "/rest/plugins", false);
	plugins.setRequestHeader("X-XSRF-TOKEN", xxsrfToken);
	plugins.send();
	return prID;
}

async function getPluginSettings(pluginName) {
	var base_URL = window.location.origin;
	var csrfToken = getCookie('CSRF-TOKEN');
	var settgs = null;
	if(csrfToken) {
		var pluginID = await getPluginId(pluginName, csrfToken);
		var pluginSetting = new XMLHttpRequest();
		pluginSetting.withCredentials = true;
		
		pluginSetting.addEventListener("readystatechange", function() {
		if(this.readyState === 4) {
			var pluginSettingObj = JSON.parse(this.response);
			if(pluginSettingObj) {
				settgs = pluginSettingObj;
			}
		}
		});
		
		pluginSetting.open("GET", base_URL + "/rest/plugins/" + pluginID + "/settings", false);
		pluginSetting.setRequestHeader("X-XSRF-TOKEN", csrfToken);
		pluginSetting.send();
	}
	return settgs;
}
async function xcec() {
	var settings = await getPluginSettings('announcement');
	console.log("settings - " + settings);

	var toAnnounce = null;
	var cssContent = null;
	var showInHome = null;

	for (const [key, value] of Object.entries(settings)) {
		if(value.name === 'announcement')
			toAnnounce = value.value;
		if(value.name === 'cssContent')
			cssContent = value.value;
		if(value.name === 'showInHome')
			showInHome = value.value;
	}
	if(document.URL.includes("home.jsf") && showInHome === 'true') {
		aobserverForMutation('.padder-v').then((elm) => {
    		jQuery('.padder-v').before("<marquee style='" + cssContent + "'>" + toAnnounce + "</marquee>");
		});
	}
}

xcec();