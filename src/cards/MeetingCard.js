const getMeetingUICard = () =>
    CardService.newCardBuilder()
        .addSection(
          CardService.newCardSection()
            .addWidget(
              CardService.newTextButton()
                .setText("Configure Time Settings")
                .setOnClickAction(
                  CardService
                    .newAction()
                    .setFunctionName("getConfigUICard")))
            .addWidget(
              CardService.newDecoratedText()
                .setText("Hi")
              
                .setAuthorizationAction(
                  CardService.newAuthorizationAction()
                    .setAuthorizationUrl("https://google.com")
                )))
        .addSection(
            CardService.newCardSection()
                .addWidget(
                CardService.newTextInput()
                  .setFieldName("meetinglength")
                  .setValue("60")
                  .setTitle("Meeting length in minutes"))
                .addWidget(
                  CardService
                    .newTextInput()
                    .setFieldName("emails")
                    .setMultiline(true)
                    .setTitle("Emails"))
                .addWidget(
                  CardService.newDateTimePicker()
                    .setValueInMsSinceEpoch(Date.now())
                    .setFieldName("starttime")
                    .setTitle("'Look for' Start Time"))
                .addWidget(
                  CardService.newDateTimePicker()
                    .setValueInMsSinceEpoch(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .setFieldName("endtime")
                    .setTitle("'Look for' End Time"))
                .addWidget(CardService.newTextButton()
                  .setText("Find a meeting time")
                  .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                  .setOnClickAction(
                    CardService
                      .newAction()
                      .setFunctionName("sendMeetingRequest"))))
        .setFixedFooter(
          CardService.newFixedFooter()
            .setPrimaryButton(
              CardService.newTextButton()
                .setText("About")
                .setOpenLink(
                  CardService.newOpenLink()
                    .setUrl("https://csc380.clxxiii.dev")
                )
            )
        )
        .setName("meeting-ui")
        .build()

