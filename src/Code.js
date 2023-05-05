/** @typedef {object} Settings
 * @property {number} timezone
 * @property {object[]} preferredTimeRanges
 * @property {number} preferredTimeRanges.start
 * @property {number} preferredTimeRanges.end
 * @property {boolean[]} preferredTimeRanges.weekdays
 * @property {object[]} suboptimalTimeRanges
 * @property {number} suboptimalTimeRanges.start
 * @property {number} suboptimalTimeRanges.end
 * @property {boolean[]} suboptimalTimeRanges.weekdays
 * @property {object[]} calendars
 * @property {string} calendars.id
 * @property {string} calendars.name
 * @property {boolean} calendars.toggled
 */

/** @typedef {object} Output
 * @property {number[]} startTimes
 * @property {number[]} endTimes
 * @property {number[]} subStartTimes
 * @property {number[]} subEndTimes
 */

let userSettings = {
  timezone: 5,
  preferredTimeRanges: [
  ],
  suboptimalTimeRanges: [

  ],
  calendars: [

  ]
}

const UserProperties = PropertiesService.getUserProperties();
const BASE_URL = "https://csc380.clxxiii.dev";

const weekMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function onPluginOpen() {
  // Get settings from database
  let email = Session.getActiveUser().getEmail();
  let settingsUrl = `${BASE_URL}/currentUser?email=${email}`;
  let settingsRes;
  try {
    settingsRes = UrlFetchApp.fetch(settingsUrl, {method: 'GET'}).getContentText();
  } catch (e) {
    Logger.log(e);
    // Load
    return getAuthorizationCard();
  }
  let dbSettings = JSON.parse(settingsRes);

  if (dbSettings.status == 404) {
    return debugAction("No user in db!")
  }
  
  let settings = userSettings;
  settings.timezone = parseFloat(dbSettings.timezone)

  for (let i = 0; i < dbSettings.preferred_timerange.start.length; i++) {
    settings.preferredTimeRanges.push({ start: null, end: null, weekdays: null})
    settings.preferredTimeRanges[i].start = dbSettings.preferred_timerange.start[i];
    settings.preferredTimeRanges[i].end = dbSettings.preferred_timerange.end[i];
    settings.preferredTimeRanges[i].weekdays = dbSettings.preferred_timerange.days[i];
  }

  for (let i = 0; i < dbSettings.suboptimal_timerange.start.length; i++) {
    settings.suboptimalTimeRanges.push({ start: null, end: null, weekdays: null})
    settings.suboptimalTimeRanges[i].start = dbSettings.suboptimal_timerange.start[i];
    settings.suboptimalTimeRanges[i].end = dbSettings.suboptimal_timerange.end[i];
    settings.suboptimalTimeRanges[i].weekdays = dbSettings.suboptimal_timerange.days[i];
  }

  const calendars = Calendar.CalendarList.list().items
  const list = [];
  for (const calendar of calendars) {
    const toggled = dbSettings.calendar_id.includes(calendar.id);
    let element = {
      "id": calendar.id,
      "name": calendar.summary,
      "toggled": toggled
    }

    list.push(element);
  }
  settings.calendars = list

  save(settings);

  if (!UserProperties.getProperty("configApplied")) {
    UserProperties.setProperty("settings", JSON.stringify(userSettings))
    UserProperties.setProperty("configApplied", "true")
  }

  Logger.log(settings);
  return getMeetingUICard();
}

function sendMeetingRequest(e) {
  let email = e.formInput.emails + " " + Session.getActiveUser().getEmail(),
      mtngLength = parseInt(e.formInput.meetinglength),
      startDay = parseInt(e.formInput.starttime.msSinceEpoch),
      endDay = parseInt(e.formInput.endtime.msSinceEpoch)

  // Data Validation
  if (startDay >= endDay) {
    return generateErrorCard("Your start day must come before your end day.")
  }

  var url = `${BASE_URL}/email?email=${email.trim().replace("undefined ", "")}&mtngLength=${mtngLength}&startDay=${startDay}&endDay=${endDay}`
  Logger.log(url);
  var response = JSON.parse(UrlFetchApp.fetch(url,{method: "GET"}).getContentText());

  if (response.error == "unrecognized_emails") {
    return generateEmailCard(response.emails)
  }

  return generateOutputUICard(response, email, mtngLength)
}

function addToCalendar(e) {
  const emails = e.parameters.emails.replace("undefined", "");
  const title =  "Meeting with: " + emails;
  const startTime = parseInt(e.parameters.start);
  const length = parseInt(e.parameters.length) * 60 * 1000;
  const endTime = startTime + length;
  const start = new Date(startTime)
  const end = new Date(endTime)

  var event = CalendarApp.getDefaultCalendar().createEvent(title, start, end);
  event.setDescription("Scheduled using Jetlag Jelly")
  for (const email of emails.split(" ")) {
    if (email == "") continue;
    event.addGuest(email);
  }
  Logger.log("NEW EVENT ID: " + event.getId());
}

function sendEmails(e) {
  const emails = e.parameters.emails.split(",")
  try {
    for (const email of emails) {
      var url = `${BASE_URL}/send?email=${email}`
      Logger.log(url);
      UrlFetchApp.fetch(url,{method: "GET"})
    }
  } catch (e) {
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation()
          .popCard())
      .setNotification(
        CardService.newNotification()
          .setText("Failed to send all emails, make sure they are valid!"))
      .build()
  }

  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .popCard())
    .setNotification(
      CardService.newNotification()
        .setText("Successfully sent all emails!"))
    .build()
}

/*
 * Config Change functions
 */
function toggleCalendar(e) {
  let id = parseInt(e.parameters.index);
  let settings = getSettings();
  let toggled = settings.calendars[id].toggled;
  settings.calendars[id].toggled = !toggled
  save(settings);

  let email = Session.getActiveUser().getEmail();
  let calendarId = encodeURI(settings.calendars[id].id).replace("#", "%23")
  var url = `${BASE_URL}/calendar?email=${email}&calendar_id=${calendarId}&used=${!toggled}`
  Logger.log(url);

  UrlFetchApp.fetch(url,{ 'method': "PUT" });
}


function changeTimezone(e) {
  let settings = getSettings();
  let timezoneTxt = e.formInputs.timezone[0];
  let num = parseFloat(timezoneTxt.replace("UTC", ""))

  if (!num) {
    return generateErrorCard("Your timezone could not be parsed! Make sure it's either the number offset from UTC, or in the format 'UTC-0', or 'UTC+6'")
  }

  settings.timezone = num;
  save(settings);

  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timezone?email=${email}&timezone=${num}`

  UrlFetchApp.fetch(url,{ 'method': "PUT" });
}

function createTimeRange(e) {
  let priority = e.parameters.priority == 'true'
  let settings = getSettings();
  let prioString = priority ? "preferred" : "suboptimal"

  let range = {
      start: 9,
      end: 17,
      weekdays: [false, true, false, false, false, false, false]
    }
  settings[`${prioString}TimeRanges`].push(range)
  save(settings);

  // API CALL TO SAVE SETTINGS
  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timerange?email=${email}&type=${prioString}&start=${range.start}&end=${range.end}&${range.weekdays.map(x => `days=${x}`).join("&")}`
  UrlFetchApp.fetch(url,{ 'method': "POST" });

  let nav = CardService.newNavigation().updateCard(getConfigUICard());

  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build()
}

function deleteTimeRange(e) {
  let priority = e.parameters.priority == 'true'
  let index = parseInt(e.parameters.index);
  let settings = getSettings();
  let prioString = priority ? "preferred" : "suboptimal";
  settings[`${prioString}TimeRanges`].splice(index,1);
  save(settings);

  // API CALL TO SAVE SETTINGS
  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timerange?email=${email}&type=${prioString}&index=${index}`
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

  if (start >= end) {
    return generateErrorCard("Start time must come before end time")
  }

  let priority = e.parameters.priority == 'true';
  let index = parseInt(e.parameters.index);
  let prioString = priority ? "preferred" : "suboptimal";

  let range = settings[`${prioString}TimeRanges`][index]

  range.start = start;
  range.end = end;

  settings[`${prioString}TimeRanges`][index] = range;
  save(settings);

  let weekdays = range.weekdays.map(x => `days=${x}`);
  // API CALL TO SAVE SETTINGS
  let email = Session.getActiveUser().getEmail();
  var url = `${BASE_URL}/timerange?email=${email}&type=${prioString}&index=${index}&start=${start}&end=${end}&${weekdays.join("&")}`
  Logger.log(url)
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

  let start = e.formInput.start.hours + (e.formInput.start.minutes / 60);
  let end = e.formInput.end.hours + (e.formInput.end.minutes / 60);

  let priority = e.parameters.priority == 'true';
  let index = parseInt(e.parameters.index);
  let prioString = priority ? "preferred" : "suboptimal";
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

      // API CALL TO SAVE SETTINGS
  let email = Session.getActiveUser().getEmail();
  let weekdays = range.weekdays.map(x => `days=${x}`);
  var url = `${BASE_URL}/timerange?email=${email}&type=${prioString}&index=${index}&start=${start}&end=${end}&${weekdays.join("&")}`
  UrlFetchApp.fetch(url,{ 'method': "PATCH" });

  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build()
}

/*
 * Helper Functions
 */
function popCard() {
  const nav = CardService.newNavigation()
    .popCard();
  
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}

/**
 * @returns {Settings}
 */
function getSettings(fromDB) {
  if (!fromDB)
    return JSON.parse(UserProperties.getProperty("settings"));

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