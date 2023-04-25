const gi = require('node-gtk');
const Gtk = gi.require('Gtk', '3.0');
const WebKit2 = gi.require('WebKit2');

const handleBrowser =  (webView,_window,_header,_callback) => {

	webView.on('load-changed', (loadEvent) => {
		_callback(webView.getUri());
	  switch (loadEvent) {
	    case WebKit2.LoadEvent.COMMITTED:
	      _callback(webView.getUri());
	      break
	  }
	})
}

module.exports = {
	handleBrowser
}