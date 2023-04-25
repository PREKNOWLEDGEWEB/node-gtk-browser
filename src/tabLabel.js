const gi = require('node-gtk');
const Gtk = gi.require('Gtk', '3.0');
class CloseableTabLabel extends Gtk.Box {
  constructor(tabLabel, notebook) {
    super({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 5 });

    this._tabLabel = tabLabel;
    this._notebook = notebook;

    const label = new Gtk.Label({ label: tabLabel });
    this.packStart(label, true, true, 0);

    const closeButton = new Gtk.ToolButton.newFromStock(Gtk.STOCK_CLOSE , Gtk.IconSize.BUTTON);
    const closeButtonCss = `
	  .close-button {
	    min-width: 0;
	    min-height: 0;
	    padding: 8px;
	    margin-left:20px;
	  }
	`;

	const cssProvider = new Gtk.CssProvider();
	cssProvider.loadFromData(closeButtonCss);
	const closeButtonStyleContext = closeButton.getStyleContext();
	closeButtonStyleContext.addProvider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
	closeButtonStyleContext.addClass('close-button');
    closeButton.on('clicked', () => {
      const pageNum = this._notebook.pageNum(this);
      this._notebook.removePage(pageNum);
    });
    this.packEnd(closeButton, false, false, 0);

    this.showAll();
  }
}

module.exports = {
	CloseableTabLabel
}