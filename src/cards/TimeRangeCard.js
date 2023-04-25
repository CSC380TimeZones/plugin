const generateTimeRangeCard = ({parameters}) => {
  const startH = Math.floor(parameters.start)
  const startM = (parameters.start - startH) * 60
  const endH = Math.floor(parameters.end)
  const endM = (parameters.end - endH) * 60

  return CardService.newCardBuilder()
    .setName("config-ui")
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTimePicker()
            .setFieldName("start")
            .setTitle("Start Time")
            .setHours(startH)
            .setMinutes(startM)
            .setOnChangeAction(
              CardService.newAction()
                .setFunctionName("changeTimeRangeTime")
                .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                .setParameters({
                  index: parameters.index,
                  priority: parameters.priority
                })))
        .addWidget(
          CardService.newTimePicker()
            .setFieldName("end")
            .setHours(endH)
            .setMinutes(endM)
            .setOnChangeAction(
              CardService.newAction()
                .setFunctionName("changeTimeRangeTime")
                .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                .setParameters({
                  index: parameters.index,
                  priority: parameters.priority
                }))
            .setTitle("End Time"))
        .addWidget(
          generateWeekday("Sunday", JSON.parse(parameters.weekdays)[0], parameters.index, parameters.priority))
        .addWidget(
          generateWeekday("Monday", JSON.parse(parameters.weekdays)[1], parameters.index, parameters.priority))
        .addWidget(
          generateWeekday("Tuesday", JSON.parse(parameters.weekdays)[2], parameters.index, parameters.priority))
        .addWidget(
          generateWeekday("Wednesday", JSON.parse(parameters.weekdays)[3], parameters.index, parameters.priority))
        .addWidget(
          generateWeekday("Thursday", JSON.parse(parameters.weekdays)[4], parameters.index, parameters.priority))
        .addWidget(
          generateWeekday("Friday", JSON.parse(parameters.weekdays)[5], parameters.index, parameters.priority))
        .addWidget(
          generateWeekday("Saturday", JSON.parse(parameters.weekdays)[6], parameters.index, parameters.priority))
        .addWidget(
          CardService.newTextButton()
            .setText("Delete Time Range")
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName("deleteTimeRange")
                .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                .setParameters({
                  "priority": parameters.priority,
                  "index": parameters.index
                }))))
        .build()
}

const generateWeekday = (name, checked, index, priority) =>
  CardService.newDecoratedText()
            .setText(name)
            .setSwitchControl(
              CardService.newSwitch()
                .setControlType(CardService.SwitchControlType.CHECK_BOX)
                .setOnChangeAction(
                  CardService.newAction()
                    .setFunctionName("changeTimeRangeWeekday")
                    .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                    .setParameters({index, priority, name}))
                .setFieldName(name.toLowerCase())
                .setSelected(checked || false))
