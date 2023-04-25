/** @typedef {object} Settings
 * @property {number} timezone
 * @property {object[]} priorityTimeRanges
 * @property {number} priorityTimeRanges.start
 * @property {number} priorityTimeRanges.end
 * @property {boolean[]} priorityTimeRanges.weekdays
 * @property {object[]} suboptimalTimeRanges
 * @property {number} suboptimalTimeRanges.start
 * @property {number} suboptimalTimeRanges.end
 * @property {boolean[]} suboptimalTimeRanges.weekdays
 * @property {object[]} calendars
 * @property {string} calendars.id
 * @property {string} calendars.name
 * @property {boolean} calendars.toggled
 */

// These are the default settings
let userSettings = {
  timezone: -5,
  priorityTimeRanges: [
    {
      start: 9,
      end: 17,
      weekdays: [false, true, false, true, false, true, false]
    },
    {
      start: 10,
      end: 16,
      weekdays: [false, false, true, false, true, false, false]
    }
  ],
  suboptimalTimeRanges: [
    {
      start: 16,
      end: 19,
      weekdays: [true, false, false, false, false, false, true]
    }
  ],
  calendars: [
    { id: "a92jfc0wnm29xmss9jfm3mks9", name: "Jewish Holidays", toggled: true }, 
    { id: "7gjsl4jc9shfkx9sj3mdol0sl", name: "Phases of the moon", toggled: false }
  ]
}

const UserProperties = PropertiesService.getUserProperties();
const BASE_URL = "https://csc380.clxxiii.dev";

const weekMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function onPluginOpen() {
  if (!UserProperties.getProperty("configApplied")) {
    UserProperties.setProperty("settings", JSON.stringify(userSettings))
    UserProperties.setProperty("configApplied", "true")
  }

  let settings = getSettings()
  const calendars = Calendar.CalendarList.list().items
  const list = [];
  for (const calendar of calendars) {
    const old = settings.calendars.find(x => x.id == calendar.id);
    let element = {
      "id": calendar.id,
      "name": calendar.summary,
      "toggled": calendar.selected ?? false,
    }
    if (old) element.toggled = old.toggled;
    list.push(element);
  }
  settings.calendars = list;
  save(settings);
  // return debugAction(settings)
  return getMeetingUICard();
}

function sendMeetingRequest(e) {
  let email = e.formInput.emails.split(" "),
      mtngLength = parseInt(e.formInput.meetinglength),
      startDay = parseInt(e.formInput.starttime.msSinceEpoch),
      endDay = parseInt(e.formInput.endtime.msSinceEpoch)

  var url = `${BASE_URL}/email?email=${email}&mtngLength=${mtngLength}&startDay=${startDay}&endDay=${endDay}`
  var response = UrlFetchApp.fetch(url,{method: "GET"});

  return debugAction(response)
}

/*
 * Config Change functions
 */
function toggleCalendar(e) {
  let id = parseInt(e.parameters.index);
  let settings = getSettings();
  settings.calendars[id].toggled = !settings.calendars[id].toggled;
  save(settings);
}

function changeTimezone(e) {
  let settings = getSettings();
  let timezoneTxt = e.formInputs.timezone[0];
  let timezone = timezoneTxt.match(/UTC(-|\+)(\d+)/);
  let num = parseInt(`${timezone[1]}${timezone[2]}`);

  settings.timezone = num;
  save(settings);

  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timezone?email=${email}&timezone=${num}`

  UrlFetchApp.fetch(url,{ 'method': "PUT" });
  return debugAction(url)
}

function createTimeRange(e) {
  let priority = e.parameters.priority == 'true'
  let settings = getSettings();
  let prioString = priority ? "priority" : "suboptimal"
  let range = {
      start: 9,
      end: 17,
      weekdays: [false, true, false, false, false, false, false]
    }
  settings[`${prioString}TimeRanges`].push(range)
  save(settings);

  // API CALL TO SAVE SETTINGS
  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timerange?email=${email}&start=${range.start}&end=${range.end}&days=${7}`
  UrlFetchApp.fetch(url,{ 'method': "POST" });

  let nav = CardService.newNavigation().updateCard(getConfigUICard());

  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build()
}

function deleteTimeRange(e) {
  let priority = e.parameters.priority == 'true'
  let start = e.formInput.start.hours + (e.formInput.start.minutes / 60);
  let end = e.formInput.end.hours + (e.formInput.end.minutes / 60);
  let index = parseInt(e.parameters.index);
  let settings = getSettings();
  let prioString = priority ? "priority" : "suboptimal";
  settings[`${prioString}TimeRanges`].splice(index,1);
  save(settings);

  // API CALL TO SAVE SETTINGS
  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timerange?email=${email}&start=${start}&end=${end}&days=${7}`
  UrlFetchApp.fetch(url,{ 'method': "DELETE" });

  let nav = CardService.newNavigation().popCard().updateCard(getConfigUICard());

  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build()
}

function changeTimeRangeTime(e) {
  let settings = getSettings();

  let start = e.formInput.start.hours + (e.formInput.start.minutes / 60);
  let end = e.formInput.end.hours + (e.formInput.end.minutes / 60);

  let priority = e.parameters.priority == 'true';
  let index = parseInt(e.parameters.index);
  let prioString = priority ? "priority" : "suboptimal";

  let range = settings[`${prioString}TimeRanges`][index]

  range.start = start;
  range.end = end;

  settings[`${prioString}TimeRanges`][index] = range;
  save(settings);

  // API CALL TO SAVE SETTINGS
  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timerange?email=${email}&start=${start}&end=${end}&days=${7}`
  UrlFetchApp.fetch(url,{ 'method': "PATCH" });

  let nav = CardService.newNavigation()
    .popCard()
    .updateCard(getConfigUICard())
    .pushCard(generateTimeRangeCard({ parameters: {
      priority: `${priority}`,
      index: `${index}`,
      start: `${range.start}`,
      end: `${range.end}`,
      weekdays: JSON.stringify(range.weekdays)
    }}))

  // return debugAction({start,end, p: e.parameters});
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build()
}

function changeTimeRangeWeekday(e) {
  let settings = getSettings();

  let priority = e.parameters.priority == 'true';
  let index = parseInt(e.parameters.index);
  let prioString = priority ? "priority" : "suboptimal";
  let weekIndex = weekMap.indexOf(e.parameters.name);
  let range = settings[`${prioString}TimeRanges`][index];
  settings[`${prioString}TimeRanges`][index].weekdays[weekIndex] = !range.weekdays[weekIndex];
  save(settings);

  let nav = CardService.newNavigation()
    .popCard()
    .updateCard(getConfigUICard())
    .pushCard(generateTimeRangeCard({ parameters: {
      priority: `${priority}`,
      index: `${index}`,
      start: `${range.start}`,
      end: `${range.end}`,
      weekdays: JSON.stringify(range.weekdays)
    }}))

  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build()
}

/*
 * Helper Functions
 */

/**
 * @returns {Settings}
 */
function getSettings(fromDB) {
  if (!fromDB)
    return JSON.parse(UserProperties.getProperty("settings"));
  
  // Some API Call to get settings from database
  return JSON.parse(UserProperties.getProperties("settings"));
}

function save(settings) {
  UserProperties.setProperty("settings", JSON.stringify(settings));
}

function debugAction(e) {
  return CardService.newCardBuilder()
    .setDisplayStyle(CardService.DisplayStyle.PEEK)
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph()
            .setText(JSON.stringify(e,null,2))))
    .build()
}