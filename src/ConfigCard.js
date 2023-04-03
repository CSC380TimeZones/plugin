const getConfigUICard = () => CardService.newCardBuilder()
    .setName("config-ui")
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextInput()
            .setValue("9:00")
            .setFieldName("start-time")
            .setSuggestions(
              CardService.newSuggestions()
                .addSuggestion("12:00 AM")
                .addSuggestion("01:00 AM")
                .addSuggestion("02:00 AM")
                .addSuggestion("03:00 AM")
                .addSuggestion("04:00 AM")
                .addSuggestion("05:00 AM")
                .addSuggestion("06:00 AM")
                .addSuggestion("07:00 AM")
            )
        )
    )
    .setDisplayStyle(CardService.DisplayStyle.PEEK)
    .build()