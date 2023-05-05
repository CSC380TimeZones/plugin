const generateErrorCard = (error) => CardService.newCardBuilder()
  .addSection(
    CardService.newCardSection()
      .setHeader("Error")
      .addWidget(
        CardService.newTextParagraph()
          .setText(error)))
  .build()