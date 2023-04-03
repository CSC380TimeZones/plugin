const getMeetingUICard = () => 
  CardService.newCardBuilder()
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newImage()
            .setImageUrl("https://avatars.githubusercontent.com/u/123573463?s=300&v=4")
        )
        .addWidget(
          CardService.newTextButton()
            .setText("Configure Time Settings")
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName("getConfigUICard")
            )
        )
    )
    .setName("meeting-ui")
    .build()