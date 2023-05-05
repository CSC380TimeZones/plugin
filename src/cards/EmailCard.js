const generateEmailCard = (emails) => {
  return CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("Unrecognized Emails found in email string")
        .setSubtitle("Error"))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph()
            .setText(emails.join("\n"))))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph()
            .setText("Would you like us to send emails to the users that we don't recognize?"))
        .addWidget(
          CardService.newButtonSet()
          .addButton(
          CardService.newTextButton()
            .setText("Yes")
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor("#00FF00")
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName("sendEmails")
                .setParameters({ emails: `${emails.toString()}`})
            ))
          .addButton(
            CardService.newTextButton()
              .setText("No")
              .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
              .setBackgroundColor("#FF0000")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("popCard")))))
    .build()
}