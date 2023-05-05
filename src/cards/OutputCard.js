
const dateOptions = {weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit'}
const timeOptions = {hour: '2-digit', minute: '2-digit'}
/**
 * @param times {Output}
 */
const generateOutputUICard = (times, email, length) => {
  
  const card = CardService.newCardBuilder();

  // Priority
  generateSection(card,"https://i.imgur.com/QJsLocI.png", times.startTimes, times.endTimes, email, length)
  // Suboptimal
  generateSection(card,"https://i.imgur.com/g0UrfE8.png", times.subStartTimes, times.subEndTimes, email, length)

  return card.build();
}

/**
 * @param card {CardService.Card}
 * @param headerImg {string}
 * @param startTimes {number[]}
 * @param endTimes {number[]}
 */
const generateSection = (card, headerImg, startTimes, endTimes, emails, length) => {
  card.addSection(
    CardService.newCardSection()
      .addWidget(
        CardService.newImage()
          .setImageUrl(headerImg)
          .setAltText("Priority Times")))

  for (let i = 0; i < startTimes.length; i++) {
    const start = new Date(startTimes[i]);
    const end = new Date(endTimes[i])

    const startTimeString = Intl.DateTimeFormat("en-US", timeOptions).format(start);
    const endTimeString =  Intl.DateTimeFormat("en-US", timeOptions).format(end);

    const startDateString = Intl.DateTimeFormat("en-US", dateOptions).format(start);
    const endDateString = Intl.DateTimeFormat("en-US", dateOptions).format(end);

    const section = CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph()
          .setText(`${startTimeString} - ${endTimeString}`))
    
    if (startDateString == endDateString) {
      section.addWidget(
        CardService.newTextParagraph()
          .setText(startDateString))
    } else {
            section.addWidget(
        CardService.newTextParagraph()
          .setText(`${startDateString} - ${endDateString}`))
    }

    section.addWidget(
      CardService.newTextButton()
        .setText("Add to Calendar")
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#38dd33")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("addToCalendar")
            .setParameters({
              "start": `${start.valueOf()}`,
              "end": `${end.valueOf()}`,
              "emails": emails,
              "length": `${length}`
            })))
    
    card.addSection(section);
  }
  
}