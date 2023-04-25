const gi = require('node-gtk');
const path = require('path');
const declareEnv = require("./src/declareEnv");
const Gtk = gi.require('Gtk', '3.0');
const WebKit2 = gi.require('WebKit2');
const GLib = gi.require('GLib', '2.0');
const GObject = gi.require('GObject', '2.0');
const Gdk = gi.require('Gdk', '3.0')
const { CloseableTabLabel } = require('./src/tabLabel');
const { handleBrowser } = require('./src/handleBrowser');
const StrvBuilder = GLib.StrvBuilder;

/* Start Loop */
gi.startLoop();

Gtk.init();

const headerBar = new Gtk.HeaderBar();
headerBar.setTitle('Prototype Browser');
headerBar.setSubtitle('Subtitle');
headerBar.setShowCloseButton(true);
headerBar.setDecorationLayout("menu:minimize,maximize,close");

const aboutDialog = new Gtk.AboutDialog({
  'program-name': 'Prototype handleBrowser',
  'website': 'https://google.com',
  'website-label': 'Google',
  'license' : 'GPL 3-0',
  'license-type': Gtk.License.GPL_3_0,
  'logo-icon-name': 'myapp-logo'
});


const aboutButton = new Gtk.Button();
aboutButton.setLabel('About');
aboutButton.on('clicked' , () => {
  aboutDialog.present();
});

const createNewPage = () => {
  /* Declarations */
  const webView = new WebKit2.WebView();
  const scrollWindow = new Gtk.ScrolledWindow({});
  const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL })
  const hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
  const label = new Gtk.Label({ label: `Tab ${notebook.getNPages() + 1}` });
  const newNotebook = new Gtk.Notebook();
  const tabLabel = new CloseableTabLabel("New Tab Page",notebook);
  const newPage = new Gtk.Label({ label: `New Page` });
  const toolbar = new Gtk.Toolbar();
  const lastToolBar = new Gtk.Toolbar();
  const urlBar = new Gtk.Entry()

  const webSettings = webView.getSettings()
  webSettings.enableDeveloperExtras = true
  webSettings.enableCaretBrowsing = true
  webSettings.enableWebAudio = true;
  webSettings.enableMediaStream = true;
  webSettings.enableMediaCaptureRequiresSecureConnection = true;

  console.log('webSettings: ', webSettings)


  const button = {
    back:    Gtk.ToolButton.newFromStock(Gtk.STOCK_GO_BACK),
    forward: Gtk.ToolButton.newFromStock(Gtk.STOCK_GO_FORWARD),
    refresh: Gtk.ToolButton.newFromStock(Gtk.STOCK_REFRESH),
    settings: Gtk.ToolButton.newFromStock(Gtk.STOCK_REFRESH),
  }

  //Add Widgets
  scrollWindow.add(webView)
  toolbar.add(button.back)
  toolbar.add(button.forward)
  toolbar.add(button.refresh)

  // pack horizontally toolbar and url bar
  hbox.packStart(toolbar, false, false, 0)
  hbox.packStart(urlBar,  true,  true,  8)
  // pack vertically top bar (hbox) and scrollable window
  vbox.packStart(hbox,         false, true, 0)
  vbox.packStart(scrollWindow, true,  true, 0)

  //Load Url
  webView.loadUri(url(process.argv[2] || 'google.com'));

  //Handle Browser
  handleBrowser(webView , window , headerBar , (cb) => {
    //Set URL
    urlBar.setText(cb);
    const title = webView.getTitle();
    const tabLabel = notebook.getTabLabel(vbox);
    _tabLabel = title;
    button.back.setSensitive(webView.canGoBack())
    button.forward.setSensitive(webView.canGoForward())
    headerBar.setSubtitle(title);
  });

  urlBar.on('activate', () => {
    let href = url(urlBar.getText())
    urlBar.setText(href)
    webView.loadUri(href)
  })

  button.back.on('clicked',    () => webView.goBack())
  button.forward.on('clicked', () => webView.goForward())
  button.refresh.on('clicked', () => webView.reload())

  //Add Tabs
  notebook.appendPage(vbox, tabLabel);
  notebook.setCurrentPage(notebook.getNPages());
  window.showAll();
  regeneratePopOver();
};

const addTabBtn = new Gtk.ToolButton.newFromStock(Gtk.STOCK_ADD);
addTabBtn.on('clicked' , createNewPage);

headerBar.packStart(addTabBtn);
headerBar.packEnd(aboutButton);

const window = new Gtk.Window(Gtk.WindowPosition.CENTER);
window.setDefaultSize(1000, 500);
window.on('destroy', () => {
  Gtk.mainQuit();
});
//window.setDecorated(false);
window.setTitle("Prototype Browser");
window.setTitlebar(headerBar);

const notebook = new Gtk.Notebook();
notebook.setTabPos(Gtk.PositionType.BOTTOM);

const hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0.5 });
hbox.packStart(notebook, true, true, 0);

const addButton = new Gtk.ToolButton.newFromStock(Gtk.STOCK_ADD);
addButton.on('clicked', () => {
  console.log("addButton:clicked");
  createNewPage();
});

let gtkSettings = Gtk.Settings.getDefault()
gtkSettings.gtkIconThemeName = 'Adwaita-dark';

const regeneratePopOver = () => {
  const popover = new Gtk.Popover();

  for (let i = 0; i < notebook.getNPages(); i++) {
    const tabLabel = notebook.getTabLabel(notebook.getNthPage(i));
    tabLabel.connect('enter-notify-event', (widget, event) => {
      tooltip.setTipText(widget.getLabel().getText());
      tooltip.enable();
      tooltip.move(
        Gdk.Rectangle.new(
          event.x_root - 10,
          event.y_root + 20,
          tooltip.getTipWindow().getAllocation().width,
          tooltip.getTipWindow().getAllocation().height
        )
      );
    });
    tabLabel.connect('leave-notify-event', () => {
      tooltip.disable();
    });
  }
}

createNewPage();

const onSwitchPage = (notebook, page, page_num) => {
  console.log('onSwitchPage called');
}

notebook.on('switch-page', onSwitchPage);

hbox.packEnd(addButton, false, false, 0);
headerBar.packStart(addButton);

window.add(hbox);
window.showAll();
function url(href) {
  return /^([a-z]{2,}):/.test(href) ? href : ('http://' + href)
}

Gtk.main();

