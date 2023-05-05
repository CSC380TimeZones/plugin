const getAuthorizationCard = () => CardService.newCardBuilder()
  .setHeader(
    CardService.newCardHeader()
      .setTitle("Login to continue"))
  .addSection(
    CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph()
          .setText("I don't recognize your email, click below to log in and link your account!"))
      .addWidget(
        CardService.newTextButton()
          .setText("Login")
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setAuthorizationAction(
            CardService.newAuthorizationAction()
              .setAuthorizationUrl(`${BASE_URL}/login`))))
  .build()