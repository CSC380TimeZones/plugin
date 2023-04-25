function onPluginOpen() {
  const ui = HtmlService.createHtmlOutputFromFile('sidebar');
  DocumentApp.getUi().showSidebar(ui);
}
