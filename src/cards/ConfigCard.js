const getConfigUICard = () => {
  let settings = JSON.parse(UserProperties.getProperty("settings"));

  let card = CardService.newCardBuilder()
    .setName("config-ui")
    .setHeader(
      CardService.newCardHeader()
      .setTitle("Time Configuration"))
    .addSection(
      getTimeRangesSection(settings.preferredTimeRanges, true))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          getTimeZoneBox(settings.timezone)))
    .addSection(
      getTimeRangesSection(settings.suboptimalTimeRanges, false))
    .addSection(
      getCalendarSection(settings.calendars))
    .build()

  return card;
}

const getCalendarSection = (calendars) => {
  calendars = calendars ?? userSettings.calendars
  let calendarNames = calendars.map(x => x.name)
  let active = calendars.map(x => x.toggled)
  let ids = calendars.map(x => x.id)

  const section = CardService.newCardSection()
    .setHeader("Calendars")

  for (let i = 0; i < active.length; i++) {
    let calendar = calendarNames[i];
    let isActive = active[i];
    let id = ids[i]
    section.addWidget(
      CardService.newDecoratedText()
        .setSwitchControl(
          CardService.newSwitch()
            .setFieldName(id)
            .setSelected(isActive)
            .setControlType(CardService.SwitchControlType.CHECK_BOX)
            .setOnChangeAction(
              CardService.newAction()
                .setFunctionName("toggleCalendar")
                .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                .setParameters({index: `${i}`})))
        .setText(calendar))
  }

  return section;
}

const getTimeZoneBox = (num) => 
  CardService.newTextInput()
    .setFieldName("timezone")
    .setTitle("Timezone")
    .setValue(`UTC${num > 0 ? "+" : ""}${num}`)
    .setOnChangeAction(
      CardService.newAction()
        .setFunctionName("changeTimezone")
    ) 

const getTimeRangesSection = (ranges, priority) => {
  const card = CardService.newCardSection()
    .setHeader(`${priority ? "Priority" : "Suboptimal"} Time Ranges`)
  
  for (let i = 0; i < ranges.length; i++) {
    let range = ranges[i]
    card
      .addWidget(getTimeRangeButton(range.start, range.end, range.weekdays,i,priority)) 
  }

  card.addWidget(
  CardService.newTextButton()
    .setText("new")
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName("createTimeRange")
        .setParameters({"priority": `${priority}`})
    ))

  return card
}

const getTimeRangeButton = (start,end,weekdays,index,priority) => {
    start = start ?? 9;
    end = end ?? 5
    weekdays = weekdays ?? []

    let weekdayString = 
      `${weekdays[0] ? 'Sun, ' : ''}` +
      `${weekdays[1] ? 'Mon, ' : ''}` + 
      `${weekdays[2] ? 'Tue, ' : ''}` + 
      `${weekdays[3] ? 'Wed, ' : ''}` + 
      `${weekdays[4] ? 'Thu, ' : ''}` + 
      `${weekdays[5] ? 'Fri, ' : ''}` + 
      `${weekdays[6] ? 'Sat, ' : ''}` 
    weekdayString = weekdayString.slice(0,weekdayString.length - 2)

    return CardService.newDecoratedText()
    .setText(`${weekdayString}: ${start}:00 - ${end}:00`)
    .setOnClickAction(
      CardService
         .newAction()
         .setFunctionName("generateTimeRangeCard")
         .setParameters(
           { 
            start: start.toString(), 
            end: end.toString(), 
            index: `${index}`,
            priority: `${priority}`,
            weekdays: `[${weekdays.toString()}]`
            }))
}
